import { NextRequest, NextResponse } from "next/server";
import { db, videos, scrapeJobs, competitors, competitorSnapshots } from "@/lib/db";
import { scrapeProfile, scrapeHashtag, searchTikTok, TikTokVideo } from "@/lib/apify";
import { analyzeVideo } from "@/lib/ai-detection";
import { eq } from "drizzle-orm";
import { z } from "zod";

const scrapeRequestSchema = z.object({
  type: z.enum(["competitor", "hashtag", "search"]),
  target: z.string().min(1),
  maxItems: z.number().optional().default(20),
});

// POST - Run a scrape job
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, target, maxItems } = scrapeRequestSchema.parse(body);

    // Create job record
    const [job] = await db
      .insert(scrapeJobs)
      .values({
        type,
        targetValue: target,
        status: "running",
        startedAt: new Date(),
      })
      .returning();

    // Run the scrape based on type
    let results: TikTokVideo[] = [];
    let competitorId: number | null = null;

    try {
      switch (type) {
        case "competitor": {
          const handle = target.replace("@", "");
          results = await scrapeProfile(handle, maxItems);

          // Find or check if this is a tracked competitor
          const [competitor] = await db
            .select()
            .from(competitors)
            .where(eq(competitors.tiktokHandle, handle));

          if (competitor) {
            competitorId = competitor.id;

            // Update competitor snapshot if we have profile data
            if (results.length > 0 && results[0].authorMeta) {
              const authorMeta = results[0].authorMeta;
              await db.insert(competitorSnapshots).values({
                competitorId: competitor.id,
                followers: authorMeta.fans,
                following: authorMeta.following,
                totalLikes: authorMeta.heart,
                videoCount: authorMeta.video,
              });
            }
          }
          break;
        }

        case "hashtag": {
          const hashtag = target.replace("#", "");
          results = await scrapeHashtag(hashtag, maxItems);
          break;
        }

        case "search": {
          results = await searchTikTok(target, maxItems);
          break;
        }
      }

      // Process and store results
      let itemsScraped = 0;

      for (const video of results) {
        // Run AI detection
        const tempVideo = {
          id: 0,
          tiktokId: video.id,
          competitorId: null,
          authorHandle: video.authorMeta.name,
          authorName: video.authorMeta.nickName,
          authorAvatar: video.authorMeta.avatar,
          authorFollowers: video.authorMeta.fans,
          authorVerified: video.authorMeta.verified,
          description: video.text,
          hashtags: video.hashtags?.map((h) => h.name) || [],
          mentions: video.mentions || [],
          likes: video.diggCount,
          comments: video.commentCount,
          shares: video.shareCount,
          plays: video.playCount,
          saves: video.collectCount,
          audioName: video.musicMeta?.musicName,
          audioAuthor: video.musicMeta?.musicAuthor,
          audioOriginal: video.musicMeta?.musicOriginal,
          duration: video.videoMeta?.duration,
          videoUrl: video.videoUrl,
          coverUrl: video.covers?.default,
          webUrl: video.webVideoUrl,
          isAd: video.isAd,
          isPinned: video.isPinned,
          aiUgcScore: null,
          aiUgcSignals: [],
          videoCreatedAt: new Date(video.createTime * 1000),
          scrapedAt: new Date(),
        };

        const aiResult = analyzeVideo(tempVideo);

        // Insert video
        await db
          .insert(videos)
          .values({
            tiktokId: video.id,
            competitorId,
            authorHandle: video.authorMeta.name,
            authorName: video.authorMeta.nickName,
            authorAvatar: video.authorMeta.avatar,
            authorFollowers: video.authorMeta.fans,
            authorVerified: video.authorMeta.verified,
            description: video.text,
            hashtags: video.hashtags?.map((h) => h.name) || [],
            mentions: video.mentions || [],
            likes: video.diggCount,
            comments: video.commentCount,
            shares: video.shareCount,
            plays: video.playCount,
            saves: video.collectCount,
            audioName: video.musicMeta?.musicName,
            audioAuthor: video.musicMeta?.musicAuthor,
            audioOriginal: video.musicMeta?.musicOriginal,
            duration: video.videoMeta?.duration,
            videoUrl: video.videoUrl,
            coverUrl: video.covers?.default,
            webUrl: video.webVideoUrl,
            isAd: video.isAd,
            isPinned: video.isPinned,
            aiUgcScore: aiResult.score,
            aiUgcSignals: aiResult.signals,
            videoCreatedAt: new Date(video.createTime * 1000),
          })
          .onConflictDoUpdate({
            target: videos.tiktokId,
            set: {
              likes: video.diggCount,
              comments: video.commentCount,
              shares: video.shareCount,
              plays: video.playCount,
              saves: video.collectCount,
              scrapedAt: new Date(),
            },
          });

        itemsScraped++;
      }

      // Update job as completed
      await db
        .update(scrapeJobs)
        .set({
          status: "completed",
          itemsScraped,
          completedAt: new Date(),
        })
        .where(eq(scrapeJobs.id, job.id));

      return NextResponse.json({
        success: true,
        jobId: job.id,
        itemsScraped,
      });
    } catch (scrapeError) {
      // Update job as failed
      await db
        .update(scrapeJobs)
        .set({
          status: "failed",
          error: String(scrapeError),
          completedAt: new Date(),
        })
        .where(eq(scrapeJobs.id, job.id));

      throw scrapeError;
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Scrape error:", error);
    return NextResponse.json(
      { error: "Scrape failed", message: String(error) },
      { status: 500 }
    );
  }
}

// GET - Get scrape job status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get("jobId");

    if (jobId) {
      const [job] = await db
        .select()
        .from(scrapeJobs)
        .where(eq(scrapeJobs.id, parseInt(jobId)));

      if (!job) {
        return NextResponse.json({ error: "Job not found" }, { status: 404 });
      }

      return NextResponse.json(job);
    }

    // Return recent jobs
    const recentJobs = await db
      .select()
      .from(scrapeJobs)
      .orderBy(scrapeJobs.createdAt)
      .limit(20);

    return NextResponse.json(recentJobs);
  } catch (error) {
    console.error("Error fetching jobs:", error);
    return NextResponse.json(
      { error: "Failed to fetch jobs" },
      { status: 500 }
    );
  }
}

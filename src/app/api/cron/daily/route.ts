import { NextResponse } from "next/server";
import { db, competitors, trackedHashtags, videos, competitorSnapshots, hashtagSnapshots } from "@/lib/db";
import { scrapeProfile, scrapeHashtag } from "@/lib/apify";
import { analyzeVideo } from "@/lib/ai-detection";
import { sendDailyDigest, sendViralAlert, sendAIUgcAlert } from "@/lib/email";
import { eq, gte, and, desc } from "drizzle-orm";

// This route is called by Vercel Cron Jobs daily
// Configure in vercel.json: { "crons": [{ "path": "/api/cron/daily", "schedule": "0 8 * * *" }] }

export async function GET() {
  try {
    const results = {
      competitorsScraped: 0,
      hashtagsScraped: 0,
      videosCollected: 0,
      viralVideos: 0,
      aiUgcDetected: 0,
    };

    // Get alert email from env
    const alertEmail = process.env.ALERT_EMAIL;
    const viralThreshold = parseInt(process.env.VIRAL_THRESHOLD || "10000");
    const aiUgcThreshold = parseFloat(process.env.AI_UGC_THRESHOLD || "0.7");

    // 1. Scrape active competitors
    const activeCompetitors = await db
      .select()
      .from(competitors)
      .where(
        and(
          eq(competitors.isActive, true),
          eq(competitors.scrapeFrequency, "daily")
        )
      );

    for (const competitor of activeCompetitors) {
      try {
        const videos_data = await scrapeProfile(competitor.tiktokHandle, 20);

        if (videos_data.length > 0) {
          // Update competitor snapshot
          const authorMeta = videos_data[0].authorMeta;
          await db.insert(competitorSnapshots).values({
            competitorId: competitor.id,
            followers: authorMeta.fans,
            following: authorMeta.following,
            totalLikes: authorMeta.heart,
            videoCount: authorMeta.video,
          });

          // Process videos
          for (const video of videos_data) {
            const aiResult = analyzeVideo({
              description: video.text,
              hashtags: video.hashtags?.map((h) => h.name) || [],
              likes: video.diggCount,
              plays: video.playCount,
              audioName: video.musicMeta?.musicName,
              audioOriginal: video.musicMeta?.musicOriginal,
              duration: video.videoMeta?.duration,
              isAd: video.isAd,
              authorFollowers: video.authorMeta.fans,
            });

            await db
              .insert(videos)
              .values({
                tiktokId: video.id,
                competitorId: competitor.id,
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
                  scrapedAt: new Date(),
                },
              });

            results.videosCollected++;

            if (video.diggCount >= viralThreshold) {
              results.viralVideos++;
            }

            if (aiResult.score >= aiUgcThreshold) {
              results.aiUgcDetected++;
            }
          }
        }

        results.competitorsScraped++;
      } catch (error) {
        console.error(`Error scraping competitor ${competitor.tiktokHandle}:`, error);
      }
    }

    // 2. Scrape active hashtags (weekly check)
    const activeHashtags = await db
      .select()
      .from(trackedHashtags)
      .where(eq(trackedHashtags.isActive, true));

    for (const hashtag of activeHashtags) {
      try {
        const videos_data = await scrapeHashtag(hashtag.hashtag, 10);

        if (videos_data.length > 0) {
          // Create snapshot with estimated video count
          // Note: TikTok doesn't provide exact hashtag counts, this is an approximation
          await db.insert(hashtagSnapshots).values({
            hashtagId: hashtag.id,
            videoCount: videos_data.length, // This would need to be enhanced with actual count
          });
        }

        results.hashtagsScraped++;
      } catch (error) {
        console.error(`Error scraping hashtag ${hashtag.hashtag}:`, error);
      }
    }

    // 3. Send alerts if configured
    if (alertEmail) {
      // Get today's viral videos
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const viralVideos = await db
        .select()
        .from(videos)
        .where(
          and(
            gte(videos.scrapedAt, today),
            gte(videos.likes, viralThreshold)
          )
        )
        .limit(10);

      if (viralVideos.length > 0) {
        await sendViralAlert(alertEmail, viralVideos, viralThreshold);
      }

      // Get today's AI UGC detections
      const aiUgcVideos = await db
        .select()
        .from(videos)
        .where(
          and(
            gte(videos.scrapedAt, today),
            gte(videos.aiUgcScore, aiUgcThreshold)
          )
        )
        .limit(10);

      if (aiUgcVideos.length > 0) {
        await sendAIUgcAlert(
          alertEmail,
          aiUgcVideos.map((v) => ({
            video: v,
            score: v.aiUgcScore || 0,
            signals: (v.aiUgcSignals as string[]) || [],
          }))
        );
      }

      // Get top content for digest
      const topContent = await db
        .select()
        .from(videos)
        .where(gte(videos.scrapedAt, today))
        .orderBy(desc(videos.likes))
        .limit(5);

      await sendDailyDigest(alertEmail, {
        newVideos: results.videosCollected,
        viralVideos: results.viralVideos,
        aiUgcDetected: results.aiUgcDetected,
        topContent,
      });
    }

    return NextResponse.json({
      success: true,
      results,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Daily cron error:", error);
    return NextResponse.json(
      { error: "Cron job failed", message: String(error) },
      { status: 500 }
    );
  }
}

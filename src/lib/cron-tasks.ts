import { db, competitors, trackedHashtags, videos, competitorSnapshots, hashtagSnapshots } from "./db";
import { scrapeProfile, scrapeHashtag } from "./apify";
import { analyzeVideo } from "./ai-detection";
import { sendDailyDigest, sendViralAlert, sendAIUgcAlert } from "./email";
import { eq, gte, and, desc } from "drizzle-orm";

export interface CronResults {
  competitorsScraped: number;
  hashtagsScraped: number;
  videosCollected: number;
  viralVideos: number;
  aiUgcDetected: number;
}

export async function runDailyCron(): Promise<CronResults> {
  const results: CronResults = {
    competitorsScraped: 0,
    hashtagsScraped: 0,
    videosCollected: 0,
    viralVideos: 0,
    aiUgcDetected: 0,
  };

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
        const authorMeta = videos_data[0].authorMeta;
        await db.insert(competitorSnapshots).values({
          competitorId: competitor.id,
          followers: authorMeta.fans,
          following: authorMeta.following,
          totalLikes: authorMeta.heart,
          videoCount: authorMeta.video,
        });

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

  // 2. Scrape active hashtags
  const activeHashtags = await db
    .select()
    .from(trackedHashtags)
    .where(eq(trackedHashtags.isActive, true));

  for (const hashtag of activeHashtags) {
    try {
      const videos_data = await scrapeHashtag(hashtag.hashtag, 10);

      if (videos_data.length > 0) {
        await db.insert(hashtagSnapshots).values({
          hashtagId: hashtag.id,
          videoCount: videos_data.length,
        });
      }

      results.hashtagsScraped++;
    } catch (error) {
      console.error(`Error scraping hashtag ${hashtag.hashtag}:`, error);
    }
  }

  // 3. Send alerts if configured
  if (alertEmail) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const viralVideosData = await db
      .select()
      .from(videos)
      .where(
        and(
          gte(videos.scrapedAt, today),
          gte(videos.likes, viralThreshold)
        )
      )
      .limit(10);

    if (viralVideosData.length > 0) {
      await sendViralAlert(alertEmail, viralVideosData, viralThreshold);
    }

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

  return results;
}

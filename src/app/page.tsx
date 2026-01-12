export const dynamic = 'force-dynamic';

import { Header } from "@/components/header";
import { StatCard } from "@/components/stat-card";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users,
  Video,
  TrendingUp,
  Bot,
  ArrowRight,
  Play,
} from "lucide-react";
import Link from "next/link";
import { db, competitors, videos, trackedHashtags } from "@/lib/db";
import { desc, gte, count } from "drizzle-orm";

async function getStats() {
  try {
    const [competitorCount] = await db.select({ count: count() }).from(competitors);
    const [videoCount] = await db.select({ count: count() }).from(videos);
    const [hashtagCount] = await db.select({ count: count() }).from(trackedHashtags);
    const [aiUgcCount] = await db.select({ count: count() }).from(videos).where(gte(videos.aiUgcScore, 0.5));

    return {
      competitors: competitorCount?.count || 0,
      videosScraped: videoCount?.count || 0,
      trendsTracked: hashtagCount?.count || 0,
      aiUgcDetected: aiUgcCount?.count || 0,
    };
  } catch {
    return { competitors: 0, videosScraped: 0, trendsTracked: 0, aiUgcDetected: 0 };
  }
}

async function getRecentVideos() {
  try {
    const recentVideos = await db
      .select()
      .from(videos)
      .orderBy(desc(videos.scrapedAt))
      .limit(5);
    return recentVideos;
  } catch {
    return [];
  }
}

async function getTrackedHashtags() {
  try {
    const hashtags = await db
      .select()
      .from(trackedHashtags)
      .limit(4);
    return hashtags;
  } catch {
    return [];
  }
}

export default async function DashboardPage() {
  const stats = await getStats();
  const recentVideos = await getRecentVideos();
  const hashtags = await getTrackedHashtags();

  return (
    <div>
      <Header
        title="Dashboard"
        description="Overview of your TikTok research"
      />

      <div className="p-6">
        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Competitors Tracked"
            value={stats.competitors}
            change="Add more in Competitors tab"
            changeType="neutral"
            icon={Users}
          />
          <StatCard
            title="Videos Scraped"
            value={stats.videosScraped.toLocaleString()}
            change="Run a scrape to collect"
            changeType="neutral"
            icon={Video}
          />
          <StatCard
            title="Hashtags Tracked"
            value={stats.trendsTracked}
            change="Add in Hashtags tab"
            changeType="neutral"
            icon={TrendingUp}
          />
          <StatCard
            title="AI UGC Detected"
            value={stats.aiUgcDetected}
            change={stats.videosScraped > 0 ? `${((stats.aiUgcDetected / stats.videosScraped) * 100).toFixed(1)}% of videos` : "No videos yet"}
            changeType="neutral"
            icon={Bot}
          />
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          {/* Tracked Hashtags */}
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Tracked Hashtags</h2>
              <Link href="/hashtags">
                <Button variant="ghost" size="sm">
                  Manage
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </div>

            <div className="mt-4 space-y-3">
              {hashtags.length === 0 ? (
                <div className="rounded-lg bg-zinc-50 p-4 text-center text-zinc-500">
                  No hashtags tracked yet.
                  <Link href="/hashtags" className="block mt-2">
                    <Button size="sm">Add Hashtag</Button>
                  </Link>
                </div>
              ) : (
                hashtags.map((hashtag) => (
                  <div
                    key={hashtag.id}
                    className="flex items-center justify-between rounded-lg bg-zinc-50 p-3"
                  >
                    <div>
                      <p className="font-medium text-zinc-900">#{hashtag.hashtag}</p>
                      <p className="text-sm text-zinc-500">{hashtag.category || "Uncategorized"}</p>
                    </div>
                    <Badge variant="secondary" className={hashtag.isActive ? "bg-green-100 text-green-700" : "bg-zinc-100 text-zinc-500"}>
                      {hashtag.isActive ? "Active" : "Paused"}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Recent Videos */}
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Recent Videos</h2>
              <Link href="/competitors">
                <Button variant="ghost" size="sm">
                  View all
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </div>

            <div className="mt-4 space-y-3">
              {recentVideos.length === 0 ? (
                <div className="rounded-lg bg-zinc-50 p-4 text-center text-zinc-500">
                  No videos scraped yet.
                  <Link href="/jobs" className="block mt-2">
                    <Button size="sm">Run Scrape</Button>
                  </Link>
                </div>
              ) : (
                recentVideos.map((video) => (
                  <div
                    key={video.id}
                    className="flex items-start gap-3 rounded-lg bg-zinc-50 p-3"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-zinc-200 overflow-hidden">
                      {video.coverUrl ? (
                        <img src={video.coverUrl} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <Play className="h-5 w-5 text-zinc-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-zinc-900">@{video.authorHandle}</p>
                        {(video.aiUgcScore || 0) >= 0.5 && (
                          <Badge className="bg-yellow-100 text-yellow-700">
                            <Bot className="mr-1 h-3 w-3" />
                            AI UGC
                          </Badge>
                        )}
                      </div>
                      <p className="mt-0.5 truncate text-sm text-zinc-500">
                        {video.description || "No description"}
                      </p>
                      <p className="mt-1 text-xs text-zinc-400">
                        {(video.likes || 0).toLocaleString()} likes
                      </p>
                    </div>
                    {video.webUrl && (
                      <a href={video.webUrl} target="_blank" rel="noopener noreferrer">
                        <Button variant="ghost" size="sm">View</Button>
                      </a>
                    )}
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="mt-6 p-6">
          <h2 className="text-lg font-semibold">Quick Actions</h2>
          <p className="text-sm text-zinc-500 mt-1">Get started by adding competitors and running your first scrape</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/competitors">
              <Button>
                <Users className="mr-2 h-4 w-4" />
                Add Competitor
              </Button>
            </Link>
            <Link href="/hashtags">
              <Button variant="outline">
                <TrendingUp className="mr-2 h-4 w-4" />
                Track Hashtag
              </Button>
            </Link>
            <Link href="/ai-ugc">
              <Button variant="outline">
                <Bot className="mr-2 h-4 w-4" />
                Scan for AI UGC
              </Button>
            </Link>
            <Link href="/jobs">
              <Button variant="outline">
                <Play className="mr-2 h-4 w-4" />
                Run Manual Scrape
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}

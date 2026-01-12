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

// Mock data - will be replaced with real data from database
const mockStats = {
  competitors: 8,
  videosScraped: 1247,
  trendsTracked: 24,
  aiUgcDetected: 156,
};

const mockRecentVideos = [
  {
    id: 1,
    author: "@shein_official",
    description: "New summer collection just dropped! #shein #fashion",
    likes: 45200,
    isAiUgc: false,
  },
  {
    id: 2,
    author: "@fashionfinds",
    description: "You NEED this dress I just discovered...",
    likes: 12300,
    isAiUgc: true,
  },
  {
    id: 3,
    author: "@cider",
    description: "POV: Your outfit for the weekend",
    likes: 89100,
    isAiUgc: false,
  },
];

const mockTrendingHashtags = [
  { tag: "#quietluxury", growth: "+45%", videos: 125000 },
  { tag: "#grwm", growth: "+23%", videos: 890000 },
  { tag: "#minimalstyle", growth: "+67%", videos: 45000 },
  { tag: "#chinahaul", growth: "+89%", videos: 23000 },
];

export default function DashboardPage() {
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
            value={mockStats.competitors}
            change="+2 this week"
            changeType="positive"
            icon={Users}
          />
          <StatCard
            title="Videos Scraped"
            value={mockStats.videosScraped.toLocaleString()}
            change="+128 today"
            changeType="positive"
            icon={Video}
          />
          <StatCard
            title="Trends Tracked"
            value={mockStats.trendsTracked}
            change="3 breakouts"
            changeType="positive"
            icon={TrendingUp}
          />
          <StatCard
            title="AI UGC Detected"
            value={mockStats.aiUgcDetected}
            change="12.5% of videos"
            changeType="neutral"
            icon={Bot}
          />
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          {/* Trending Hashtags */}
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Trending Hashtags</h2>
              <Link href="/trends">
                <Button variant="ghost" size="sm">
                  View all
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </div>

            <div className="mt-4 space-y-3">
              {mockTrendingHashtags.map((hashtag) => (
                <div
                  key={hashtag.tag}
                  className="flex items-center justify-between rounded-lg bg-zinc-50 p-3"
                >
                  <div>
                    <p className="font-medium text-zinc-900">{hashtag.tag}</p>
                    <p className="text-sm text-zinc-500">
                      {hashtag.videos.toLocaleString()} videos
                    </p>
                  </div>
                  <Badge
                    variant="secondary"
                    className="bg-green-100 text-green-700"
                  >
                    {hashtag.growth}
                  </Badge>
                </div>
              ))}
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
              {mockRecentVideos.map((video) => (
                <div
                  key={video.id}
                  className="flex items-start gap-3 rounded-lg bg-zinc-50 p-3"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-zinc-200">
                    <Play className="h-5 w-5 text-zinc-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-zinc-900">{video.author}</p>
                      {video.isAiUgc && (
                        <Badge className="bg-yellow-100 text-yellow-700">
                          <Bot className="mr-1 h-3 w-3" />
                          AI UGC
                        </Badge>
                      )}
                    </div>
                    <p className="mt-0.5 truncate text-sm text-zinc-500">
                      {video.description}
                    </p>
                    <p className="mt-1 text-xs text-zinc-400">
                      {video.likes.toLocaleString()} likes
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="mt-6 p-6">
          <h2 className="text-lg font-semibold">Quick Actions</h2>
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

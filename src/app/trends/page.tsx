"use client";

import { Header } from "@/components/header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  TrendingUp,
  TrendingDown,
  Rocket,
  ArrowRight,
  Hash,
  Music,
  Video,
} from "lucide-react";

// Mock data
const mockTrends = {
  rising: [
    { hashtag: "quietluxury", videos: 125000, growth: 45, velocity: 234 },
    { hashtag: "chinahaul", videos: 89000, growth: 89, velocity: 456 },
    { hashtag: "minimalstyle", videos: 67000, growth: 34, velocity: 189 },
    { hashtag: "capsulewardrobe", videos: 234000, growth: 23, velocity: 123 },
    { hashtag: "oldmoneyaesthetic", videos: 456000, growth: 56, velocity: 345 },
  ],
  breakouts: [
    { hashtag: "deinfluencing", videos: 12000, growth: 234, velocity: 890 },
    { hashtag: "dupeculture", videos: 8900, growth: 189, velocity: 678 },
  ],
  declining: [
    { hashtag: "haul", videos: 890000, growth: -12, velocity: -45 },
    { hashtag: "sheinhaul", videos: 234000, growth: -8, velocity: -23 },
  ],
  sounds: [
    { name: "original sound - fashiongirl", uses: 45000, growth: 67 },
    { name: "Escapism - RAYE", uses: 234000, growth: 23 },
    { name: "original sound - aesthetic", uses: 12000, growth: 145 },
  ],
  formats: [
    { name: "GRWM (Get Ready With Me)", percentage: 34, trend: "up" },
    { name: "Outfit Check", percentage: 23, trend: "up" },
    { name: "Haul", percentage: 18, trend: "down" },
    { name: "POV Style", percentage: 15, trend: "stable" },
    { name: "Before/After", percentage: 10, trend: "up" },
  ],
};

function TrendCard({
  hashtag,
  videos,
  growth,
  isBreakout = false,
}: {
  hashtag: string;
  videos: number;
  growth: number;
  isBreakout?: boolean;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border bg-white p-4">
      <div className="flex items-center gap-3">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-lg ${
            isBreakout ? "bg-orange-100" : "bg-zinc-100"
          }`}
        >
          {isBreakout ? (
            <Rocket className="h-5 w-5 text-orange-600" />
          ) : (
            <Hash className="h-5 w-5 text-zinc-600" />
          )}
        </div>
        <div>
          <p className="font-medium">#{hashtag}</p>
          <p className="text-sm text-zinc-500">
            {(videos / 1000).toFixed(0)}K videos
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Badge
          className={
            growth > 50
              ? "bg-orange-100 text-orange-700"
              : growth > 0
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }
        >
          {growth > 0 ? (
            <TrendingUp className="mr-1 h-3 w-3" />
          ) : (
            <TrendingDown className="mr-1 h-3 w-3" />
          )}
          {growth > 0 ? "+" : ""}
          {growth}%
        </Badge>
        <Button variant="ghost" size="icon">
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export default function TrendsPage() {
  return (
    <div>
      <Header
        title="Trend Radar"
        description="Track emerging hashtags, sounds, and content formats"
      />

      <div className="p-6">
        <Tabs defaultValue="hashtags">
          <TabsList>
            <TabsTrigger value="hashtags">
              <Hash className="mr-2 h-4 w-4" />
              Hashtags
            </TabsTrigger>
            <TabsTrigger value="sounds">
              <Music className="mr-2 h-4 w-4" />
              Sounds
            </TabsTrigger>
            <TabsTrigger value="formats">
              <Video className="mr-2 h-4 w-4" />
              Formats
            </TabsTrigger>
          </TabsList>

          <TabsContent value="hashtags" className="mt-6">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Breakouts */}
              <Card className="p-6">
                <div className="flex items-center gap-2">
                  <Rocket className="h-5 w-5 text-orange-500" />
                  <h2 className="text-lg font-semibold">Breakout Trends</h2>
                </div>
                <p className="mt-1 text-sm text-zinc-500">
                  Hashtags growing &gt;100% this week
                </p>
                <div className="mt-4 space-y-3">
                  {mockTrends.breakouts.map((trend) => (
                    <TrendCard
                      key={trend.hashtag}
                      hashtag={trend.hashtag}
                      videos={trend.videos}
                      growth={trend.growth}
                      isBreakout
                    />
                  ))}
                </div>
              </Card>

              {/* Rising */}
              <Card className="p-6">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  <h2 className="text-lg font-semibold">Rising Trends</h2>
                </div>
                <p className="mt-1 text-sm text-zinc-500">
                  Steady growth in fashion space
                </p>
                <div className="mt-4 space-y-3">
                  {mockTrends.rising.slice(0, 4).map((trend) => (
                    <TrendCard
                      key={trend.hashtag}
                      hashtag={trend.hashtag}
                      videos={trend.videos}
                      growth={trend.growth}
                    />
                  ))}
                </div>
              </Card>

              {/* Declining */}
              <Card className="col-span-full p-6">
                <div className="flex items-center gap-2">
                  <TrendingDown className="h-5 w-5 text-red-500" />
                  <h2 className="text-lg font-semibold">Declining Trends</h2>
                </div>
                <p className="mt-1 text-sm text-zinc-500">
                  Hashtags losing momentum
                </p>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  {mockTrends.declining.map((trend) => (
                    <TrendCard
                      key={trend.hashtag}
                      hashtag={trend.hashtag}
                      videos={trend.videos}
                      growth={trend.growth}
                    />
                  ))}
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="sounds" className="mt-6">
            <Card className="p-6">
              <h2 className="text-lg font-semibold">Trending Sounds</h2>
              <p className="mt-1 text-sm text-zinc-500">
                Popular audio in fashion content
              </p>
              <div className="mt-4 space-y-3">
                {mockTrends.sounds.map((sound, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-lg border bg-white p-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                        <Music className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-medium">{sound.name}</p>
                        <p className="text-sm text-zinc-500">
                          {(sound.uses / 1000).toFixed(0)}K uses
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-700">
                      +{sound.growth}%
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="formats" className="mt-6">
            <Card className="p-6">
              <h2 className="text-lg font-semibold">Content Formats</h2>
              <p className="mt-1 text-sm text-zinc-500">
                Popular video formats in fashion TikTok
              </p>
              <div className="mt-4 space-y-4">
                {mockTrends.formats.map((format, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{format.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-zinc-500">
                          {format.percentage}%
                        </span>
                        {format.trend === "up" && (
                          <TrendingUp className="h-4 w-4 text-green-500" />
                        )}
                        {format.trend === "down" && (
                          <TrendingDown className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                    </div>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-zinc-100">
                      <div
                        className="h-full rounded-full bg-zinc-900"
                        style={{ width: `${format.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

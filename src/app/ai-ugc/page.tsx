"use client";

import { useState } from "react";
import { Header } from "@/components/header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Bot,
  Search,
  Filter,
  Play,
  Heart,
  MessageCircle,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Bookmark,
} from "lucide-react";

// Mock data for detected AI UGC videos
const mockAiVideos = [
  {
    id: 1,
    author: "@fashionfinds_23",
    description: "I just discovered this amazing dress and you NEED it! Link in bio #tiktokmademebuyit",
    likes: 45000,
    comments: 234,
    aiScore: 0.89,
    signals: ["Script pattern detected", "Suspicious hashtags", "New account high engagement"],
    thumbnail: null,
  },
  {
    id: 2,
    author: "@styledeals",
    description: "This changed my life! Best purchase ever, run don't walk #amazonfinds",
    likes: 23000,
    comments: 89,
    aiScore: 0.76,
    signals: ["Script pattern detected", "Suspicious hashtags"],
    thumbnail: null,
  },
  {
    id: 3,
    author: "@ootd_queen",
    description: "Holy grail product alert! You're welcome #viralproduct #ugc",
    likes: 67000,
    comments: 456,
    aiScore: 0.92,
    signals: ["Script pattern detected", "Suspicious hashtags", "UGC hashtag", "Original sound"],
    thumbnail: null,
  },
  {
    id: 4,
    author: "@minimalstyle_co",
    description: "New in from my favorite brand, obsessed with the quality",
    likes: 12000,
    comments: 67,
    aiScore: 0.45,
    signals: ["Script pattern detected"],
    thumbnail: null,
  },
  {
    id: 5,
    author: "@trendyhunter",
    description: "Game changer! Must have for summer #gifted #ad",
    likes: 34000,
    comments: 123,
    aiScore: 0.95,
    signals: ["Marked as advertisement", "Script pattern detected", "Suspicious hashtags"],
    thumbnail: null,
  },
];

function getScoreColor(score: number) {
  if (score >= 0.7) return "bg-red-100 text-red-700 border-red-200";
  if (score >= 0.4) return "bg-yellow-100 text-yellow-700 border-yellow-200";
  return "bg-green-100 text-green-700 border-green-200";
}

function getScoreLabel(score: number) {
  if (score >= 0.7) return "Likely AI";
  if (score >= 0.4) return "Suspicious";
  return "Organic";
}

function getScoreIcon(score: number) {
  if (score >= 0.7) return <XCircle className="h-4 w-4" />;
  if (score >= 0.4) return <AlertTriangle className="h-4 w-4" />;
  return <CheckCircle className="h-4 w-4" />;
}

export default function AiUgcPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "high" | "medium" | "low">("all");

  const filteredVideos = mockAiVideos.filter((video) => {
    if (filter === "high") return video.aiScore >= 0.7;
    if (filter === "medium") return video.aiScore >= 0.4 && video.aiScore < 0.7;
    if (filter === "low") return video.aiScore < 0.4;
    return true;
  });

  const stats = {
    total: mockAiVideos.length,
    highScore: mockAiVideos.filter((v) => v.aiScore >= 0.7).length,
    mediumScore: mockAiVideos.filter((v) => v.aiScore >= 0.4 && v.aiScore < 0.7).length,
    avgScore: (mockAiVideos.reduce((sum, v) => sum + v.aiScore, 0) / mockAiVideos.length * 100).toFixed(0),
  };

  return (
    <div>
      <Header
        title="AI UGC Detector"
        description="Identify AI-generated and scripted UGC content"
        action={
          <Button>
            <Search className="mr-2 h-4 w-4" />
            Scan New Content
          </Button>
        }
      />

      <div className="p-6">
        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="p-4">
            <p className="text-sm text-zinc-500">Videos Analyzed</p>
            <p className="mt-1 text-2xl font-semibold">{stats.total}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-zinc-500">Likely AI</p>
            <p className="mt-1 text-2xl font-semibold text-red-600">{stats.highScore}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-zinc-500">Suspicious</p>
            <p className="mt-1 text-2xl font-semibold text-yellow-600">{stats.mediumScore}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-zinc-500">Avg AI Score</p>
            <p className="mt-1 text-2xl font-semibold">{stats.avgScore}%</p>
          </Card>
        </div>

        {/* Filters */}
        <div className="mt-6 flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <Input
              placeholder="Search by author or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="high">
                <XCircle className="mr-1 h-3 w-3" />
                Likely AI
              </TabsTrigger>
              <TabsTrigger value="medium">
                <AlertTriangle className="mr-1 h-3 w-3" />
                Suspicious
              </TabsTrigger>
              <TabsTrigger value="low">
                <CheckCircle className="mr-1 h-3 w-3" />
                Organic
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Video Grid */}
        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredVideos.map((video) => (
            <Card key={video.id} className="overflow-hidden">
              {/* Thumbnail */}
              <div className="relative aspect-video bg-zinc-100">
                <div className="flex h-full items-center justify-center">
                  <Play className="h-8 w-8 text-zinc-300" />
                </div>
                {/* AI Score Badge */}
                <Badge
                  className={`absolute left-2 top-2 gap-1 ${getScoreColor(video.aiScore)}`}
                >
                  {getScoreIcon(video.aiScore)}
                  {getScoreLabel(video.aiScore)} ({(video.aiScore * 100).toFixed(0)}%)
                </Badge>
              </div>

              {/* Content */}
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <p className="font-medium">{video.author}</p>
                  <Button variant="ghost" size="icon">
                    <Bookmark className="h-4 w-4" />
                  </Button>
                </div>

                <p className="mt-2 line-clamp-2 text-sm text-zinc-600">
                  {video.description}
                </p>

                {/* Signals */}
                <div className="mt-3">
                  <p className="text-xs font-medium text-zinc-500">Detection Signals:</p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {video.signals.map((signal, i) => (
                      <Badge key={i} variant="outline" className="text-[10px]">
                        {signal}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Stats */}
                <div className="mt-3 flex items-center gap-3 text-xs text-zinc-500">
                  <span className="flex items-center gap-1">
                    <Heart className="h-3 w-3" />
                    {(video.likes / 1000).toFixed(1)}K
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageCircle className="h-3 w-3" />
                    {video.comments}
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

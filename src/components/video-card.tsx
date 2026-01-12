"use client";

import Image from "next/image";
import { Heart, MessageCircle, Share2, Eye, Bookmark, ExternalLink, Bot } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { Video } from "@/lib/db/schema";
import { cn } from "@/lib/utils";

interface VideoCardProps {
  video: Video;
  showAiScore?: boolean;
  onSave?: (video: Video) => void;
  onView?: (video: Video) => void;
}

function formatNumber(num: number | null | undefined): string {
  if (!num) return "0";
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

function getAiScoreColor(score: number | null | undefined): string {
  if (!score) return "bg-zinc-100 text-zinc-600";
  if (score >= 0.7) return "bg-red-100 text-red-700";
  if (score >= 0.4) return "bg-yellow-100 text-yellow-700";
  return "bg-green-100 text-green-700";
}

function getAiScoreLabel(score: number | null | undefined): string {
  if (!score) return "Not analyzed";
  if (score >= 0.7) return "Likely AI";
  if (score >= 0.4) return "Suspicious";
  return "Organic";
}

export function VideoCard({ video, showAiScore = false, onSave, onView }: VideoCardProps) {
  return (
    <Card className="group overflow-hidden transition-shadow hover:shadow-lg">
      {/* Thumbnail */}
      <div className="relative aspect-[9/16] bg-zinc-100">
        {video.coverUrl ? (
          <Image
            src={video.coverUrl}
            alt={video.description || "TikTok video"}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-zinc-400">
            No thumbnail
          </div>
        )}

        {/* Overlay on hover */}
        <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => onView?.(video)}
          >
            <ExternalLink className="mr-1 h-3 w-3" />
            View
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => onSave?.(video)}
          >
            <Bookmark className="mr-1 h-3 w-3" />
            Save
          </Button>
        </div>

        {/* Duration badge */}
        {video.duration && (
          <div className="absolute bottom-2 right-2 rounded bg-black/70 px-1.5 py-0.5 text-xs text-white">
            {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, "0")}
          </div>
        )}

        {/* AI Score badge */}
        {showAiScore && video.aiUgcScore !== null && (
          <div className="absolute left-2 top-2">
            <Badge className={cn("gap-1", getAiScoreColor(video.aiUgcScore))}>
              <Bot className="h-3 w-3" />
              {getAiScoreLabel(video.aiUgcScore)}
            </Badge>
          </div>
        )}

        {/* Ad badge */}
        {video.isAd && (
          <Badge className="absolute right-2 top-2 bg-blue-500">
            Ad
          </Badge>
        )}
      </div>

      {/* Content */}
      <div className="p-3">
        {/* Author */}
        <div className="flex items-center gap-2">
          {video.authorAvatar && (
            <Image
              src={video.authorAvatar}
              alt={video.authorHandle}
              width={24}
              height={24}
              className="rounded-full"
            />
          )}
          <span className="text-sm font-medium text-zinc-900">
            @{video.authorHandle}
          </span>
          {video.authorVerified && (
            <Badge variant="secondary" className="h-4 px-1 text-[10px]">
              Verified
            </Badge>
          )}
        </div>

        {/* Description */}
        <p className="mt-2 line-clamp-2 text-xs text-zinc-600">
          {video.description || "No description"}
        </p>

        {/* Hashtags */}
        {video.hashtags && video.hashtags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {(video.hashtags as string[]).slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-[10px]">
                #{tag}
              </Badge>
            ))}
            {(video.hashtags as string[]).length > 3 && (
              <Badge variant="outline" className="text-[10px]">
                +{(video.hashtags as string[]).length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Stats */}
        <div className="mt-3 flex items-center gap-3 text-xs text-zinc-500">
          <span className="flex items-center gap-1">
            <Heart className="h-3 w-3" />
            {formatNumber(video.likes)}
          </span>
          <span className="flex items-center gap-1">
            <MessageCircle className="h-3 w-3" />
            {formatNumber(video.comments)}
          </span>
          <span className="flex items-center gap-1">
            <Share2 className="h-3 w-3" />
            {formatNumber(video.shares)}
          </span>
          <span className="flex items-center gap-1">
            <Eye className="h-3 w-3" />
            {formatNumber(video.plays)}
          </span>
        </div>

        {/* Audio */}
        {video.audioName && (
          <p className="mt-2 truncate text-[10px] text-zinc-400">
            🎵 {video.audioName}
            {video.audioOriginal && " (Original)"}
          </p>
        )}
      </div>
    </Card>
  );
}

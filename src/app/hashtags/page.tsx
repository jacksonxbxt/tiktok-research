"use client";

import { useState } from "react";
import { Header } from "@/components/header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  MoreHorizontal,
  TrendingUp,
  TrendingDown,
  Minus,
  ExternalLink,
  Trash2,
  Pause,
  Play,
  Hash,
} from "lucide-react";

// Mock data
const mockHashtags = [
  {
    id: 1,
    hashtag: "quietluxury",
    category: "aesthetic",
    videoCount: 125000,
    growth: 45,
    isActive: true,
    lastScraped: "1 hour ago",
  },
  {
    id: 2,
    hashtag: "chinahaul",
    category: "shopping",
    videoCount: 89000,
    growth: 89,
    isActive: true,
    lastScraped: "2 hours ago",
  },
  {
    id: 3,
    hashtag: "minimalstyle",
    category: "aesthetic",
    videoCount: 67000,
    growth: 34,
    isActive: true,
    lastScraped: "3 hours ago",
  },
  {
    id: 4,
    hashtag: "fashiontiktok",
    category: "general",
    videoCount: 2340000,
    growth: 12,
    isActive: true,
    lastScraped: "1 hour ago",
  },
  {
    id: 5,
    hashtag: "grwm",
    category: "format",
    videoCount: 890000,
    growth: 23,
    isActive: false,
    lastScraped: "1 week ago",
  },
];

const hashtagCategories = [
  { value: "general", label: "General Fashion" },
  { value: "aesthetic", label: "Aesthetic" },
  { value: "shopping", label: "Shopping" },
  { value: "format", label: "Content Format" },
  { value: "brand", label: "Brand Related" },
];

export default function HashtagsPage() {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newHashtag, setNewHashtag] = useState("");

  const handleAdd = async () => {
    console.log("Adding hashtag:", newHashtag);
    setIsAddOpen(false);
    setNewHashtag("");
  };

  return (
    <div>
      <Header
        title="Tracked Hashtags"
        description="Monitor hashtag trends and velocity"
        action={
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Track Hashtag
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Track New Hashtag</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <label className="text-sm font-medium">Hashtag</label>
                  <div className="relative mt-1">
                    <Hash className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                    <Input
                      placeholder="quietluxury (without #)"
                      value={newHashtag}
                      onChange={(e) =>
                        setNewHashtag(e.target.value.replace("#", ""))
                      }
                      className="pl-9"
                    />
                  </div>
                </div>
                <Button onClick={handleAdd} className="w-full">
                  Start Tracking
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="p-6">
        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="p-4">
            <p className="text-sm text-zinc-500">Total Tracked</p>
            <p className="mt-1 text-2xl font-semibold">{mockHashtags.length}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-zinc-500">Active</p>
            <p className="mt-1 text-2xl font-semibold text-green-600">
              {mockHashtags.filter((h) => h.isActive).length}
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-zinc-500">Avg Growth</p>
            <p className="mt-1 text-2xl font-semibold">
              +{(mockHashtags.reduce((sum, h) => sum + h.growth, 0) / mockHashtags.length).toFixed(0)}%
            </p>
          </Card>
        </div>

        {/* Hashtag Table */}
        <Card className="mt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Hashtag</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Videos</TableHead>
                <TableHead className="text-right">Growth (7d)</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Scraped</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockHashtags.map((hashtag) => (
                <TableRow key={hashtag.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Hash className="h-4 w-4 text-zinc-400" />
                      <span className="font-medium">{hashtag.hashtag}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {hashtagCategories.find((c) => c.value === hashtag.category)
                        ?.label || hashtag.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {hashtag.videoCount >= 1000000
                      ? `${(hashtag.videoCount / 1000000).toFixed(1)}M`
                      : `${(hashtag.videoCount / 1000).toFixed(0)}K`}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {hashtag.growth > 0 ? (
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      ) : hashtag.growth < 0 ? (
                        <TrendingDown className="h-4 w-4 text-red-500" />
                      ) : (
                        <Minus className="h-4 w-4 text-zinc-400" />
                      )}
                      <span
                        className={
                          hashtag.growth > 0
                            ? "text-green-600"
                            : hashtag.growth < 0
                            ? "text-red-600"
                            : "text-zinc-500"
                        }
                      >
                        {hashtag.growth > 0 ? "+" : ""}
                        {hashtag.growth}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={hashtag.isActive ? "default" : "secondary"}
                      className={hashtag.isActive ? "bg-green-100 text-green-700" : ""}
                    >
                      {hashtag.isActive ? "Active" : "Paused"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-zinc-500">
                    {hashtag.lastScraped}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <ExternalLink className="mr-2 h-4 w-4" />
                          View on TikTok
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          {hashtag.isActive ? (
                            <>
                              <Pause className="mr-2 h-4 w-4" />
                              Pause Tracking
                            </>
                          ) : (
                            <>
                              <Play className="mr-2 h-4 w-4" />
                              Resume Tracking
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Remove
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  );
}

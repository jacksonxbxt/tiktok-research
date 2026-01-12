"use client";

import { useState, useEffect } from "react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  ExternalLink,
  Trash2,
  Pause,
  Play,
  Hash,
  Loader2,
} from "lucide-react";

interface TrackedHashtag {
  id: number;
  hashtag: string;
  category: string | null;
  isActive: boolean;
  addedAt: string;
}

const hashtagCategories = [
  { value: "general", label: "General Fashion" },
  { value: "aesthetic", label: "Aesthetic" },
  { value: "shopping", label: "Shopping" },
  { value: "format", label: "Content Format" },
  { value: "brand", label: "Brand Related" },
];

export default function HashtagsPage() {
  const [hashtags, setHashtags] = useState<TrackedHashtag[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [newHashtag, setNewHashtag] = useState("");
  const [newCategory, setNewCategory] = useState("");

  useEffect(() => {
    fetchHashtags();
  }, []);

  const fetchHashtags = async () => {
    try {
      const res = await fetch("/api/hashtags");
      const data = await res.json();
      setHashtags(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch hashtags:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!newHashtag) return;

    setAdding(true);
    try {
      const res = await fetch("/api/hashtags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hashtag: newHashtag, category: newCategory }),
      });

      if (res.ok) {
        setIsAddOpen(false);
        setNewHashtag("");
        setNewCategory("");
        fetchHashtags();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to add hashtag");
      }
    } catch (error) {
      console.error("Failed to add hashtag:", error);
      alert("Failed to add hashtag");
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to stop tracking this hashtag?")) return;

    try {
      const res = await fetch(`/api/hashtags?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchHashtags();
      }
    } catch (error) {
      console.error("Failed to delete:", error);
    }
  };

  const handleToggle = async (id: number, isActive: boolean) => {
    try {
      await fetch("/api/hashtags", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isActive: !isActive }),
      });
      fetchHashtags();
    } catch (error) {
      console.error("Failed to toggle:", error);
    }
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
                <div>
                  <label className="text-sm font-medium">Category (optional)</label>
                  <Select value={newCategory} onValueChange={setNewCategory}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {hashtagCategories.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleAdd} className="w-full" disabled={adding}>
                  {adding && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
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
            <p className="mt-1 text-2xl font-semibold">{hashtags.length}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-zinc-500">Active</p>
            <p className="mt-1 text-2xl font-semibold text-green-600">
              {hashtags.filter((h) => h.isActive).length}
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-zinc-500">Paused</p>
            <p className="mt-1 text-2xl font-semibold text-zinc-400">
              {hashtags.filter((h) => !h.isActive).length}
            </p>
          </Card>
        </div>

        {/* Hashtag Table */}
        <Card className="mt-6">
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
            </div>
          ) : hashtags.length === 0 ? (
            <div className="p-8 text-center text-zinc-500">
              <p>No hashtags tracked yet.</p>
              <p className="mt-1 text-sm">Click "Track Hashtag" to start monitoring trends.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Hashtag</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Added</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {hashtags.map((hashtag) => (
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
                          ?.label || hashtag.category || "Uncategorized"}
                      </Badge>
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
                      {new Date(hashtag.addedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() =>
                              window.open(
                                `https://tiktok.com/tag/${hashtag.hashtag}`,
                                "_blank"
                              )
                            }
                          >
                            <ExternalLink className="mr-2 h-4 w-4" />
                            View on TikTok
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleToggle(hashtag.id, hashtag.isActive)}
                          >
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
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => handleDelete(hashtag.id)}
                          >
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
          )}
        </Card>
      </div>
    </div>
  );
}

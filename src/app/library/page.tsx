"use client";

import { useState } from "react";
import { Header } from "@/components/header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  Grid,
  List,
  Play,
  Heart,
  ExternalLink,
  Trash2,
  Tag,
  Filter,
} from "lucide-react";

// Mock saved content
const mockSavedContent = [
  {
    id: 1,
    author: "@shein_official",
    description: "Summer collection lookbook - perfect transitions and music sync",
    likes: 234000,
    tags: ["inspiration", "transitions", "lookbook"],
    category: "viral",
    savedAt: "2 days ago",
    notes: "Great example of fast cuts with music sync. Use similar format for our launch.",
  },
  {
    id: 2,
    author: "@fashionbrand",
    description: "AI avatar product showcase - clean execution",
    likes: 45000,
    tags: ["ai-ugc", "product-showcase"],
    category: "ai-ugc",
    savedAt: "3 days ago",
    notes: "HeyGen avatar, very natural. Consider for our UGC strategy.",
  },
  {
    id: 3,
    author: "@minimalista",
    description: "Capsule wardrobe breakdown - educational content",
    likes: 89000,
    tags: ["educational", "capsule", "minimal"],
    category: "inspiration",
    savedAt: "1 week ago",
    notes: "Good format for our quality/value angle. Educational but not boring.",
  },
  {
    id: 4,
    author: "@streetstyle",
    description: "GRWM format with outfit breakdown",
    likes: 156000,
    tags: ["grwm", "outfit", "trending"],
    category: "viral",
    savedAt: "1 week ago",
    notes: null,
  },
];

const categories = [
  { value: "all", label: "All" },
  { value: "viral", label: "Viral" },
  { value: "ai-ugc", label: "AI UGC" },
  { value: "inspiration", label: "Inspiration" },
  { value: "competitor", label: "Competitor" },
];

export default function LibraryPage() {
  const [view, setView] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const filteredContent = mockSavedContent.filter((item) => {
    if (selectedCategory !== "all" && item.category !== selectedCategory) {
      return false;
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        item.description.toLowerCase().includes(query) ||
        item.author.toLowerCase().includes(query) ||
        item.tags.some((tag) => tag.includes(query))
      );
    }
    return true;
  });

  return (
    <div>
      <Header
        title="Content Library"
        description="Your saved videos and inspiration"
      />

      <div className="p-6">
        {/* Filters */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <Input
              placeholder="Search saved content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
            <TabsList>
              {categories.map((cat) => (
                <TabsTrigger key={cat.value} value={cat.value}>
                  {cat.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <div className="flex items-center gap-1 rounded-lg border p-1">
            <Button
              variant={view === "grid" ? "secondary" : "ghost"}
              size="icon"
              onClick={() => setView("grid")}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={view === "list" ? "secondary" : "ghost"}
              size="icon"
              onClick={() => setView("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content Grid */}
        {view === "grid" ? (
          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredContent.map((item) => (
              <Card key={item.id} className="overflow-hidden">
                <div className="relative aspect-video bg-zinc-100">
                  <div className="flex h-full items-center justify-center">
                    <Play className="h-8 w-8 text-zinc-300" />
                  </div>
                  <Badge className="absolute right-2 top-2 bg-black/70">
                    {item.category}
                  </Badge>
                </div>
                <div className="p-4">
                  <p className="font-medium">{item.author}</p>
                  <p className="mt-1 line-clamp-2 text-sm text-zinc-600">
                    {item.description}
                  </p>

                  <div className="mt-2 flex flex-wrap gap-1">
                    {item.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-[10px]">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  {item.notes && (
                    <p className="mt-2 text-xs text-zinc-500 italic">
                      &ldquo;{item.notes}&rdquo;
                    </p>
                  )}

                  <div className="mt-3 flex items-center justify-between text-xs text-zinc-500">
                    <span className="flex items-center gap-1">
                      <Heart className="h-3 w-3" />
                      {(item.likes / 1000).toFixed(0)}K
                    </span>
                    <span>{item.savedAt}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="mt-6 space-y-3">
            {filteredContent.map((item) => (
              <Card key={item.id} className="flex items-center gap-4 p-4">
                <div className="flex h-20 w-32 items-center justify-center rounded-lg bg-zinc-100">
                  <Play className="h-6 w-6 text-zinc-300" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{item.author}</p>
                    <Badge variant="secondary">{item.category}</Badge>
                  </div>
                  <p className="mt-1 text-sm text-zinc-600">{item.description}</p>
                  <div className="mt-2 flex items-center gap-3 text-xs text-zinc-500">
                    <span className="flex items-center gap-1">
                      <Heart className="h-3 w-3" />
                      {(item.likes / 1000).toFixed(0)}K
                    </span>
                    <span>Saved {item.savedAt}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon">
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Tag className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-red-500">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {filteredContent.length === 0 && (
          <div className="mt-12 text-center">
            <p className="text-zinc-500">No saved content found</p>
            <p className="mt-1 text-sm text-zinc-400">
              Save videos from other pages to build your library
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

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
  Plus,
  MoreHorizontal,
  TrendingUp,
  TrendingDown,
  Minus,
  ExternalLink,
  Trash2,
  RefreshCw,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Mock data
const mockCompetitors = [
  {
    id: 1,
    name: "SHEIN",
    tiktokHandle: "shein_official",
    category: "fast-fashion",
    followers: 5200000,
    followerChange: 2.3,
    videos: 1250,
    avgLikes: 45000,
    lastScraped: "2 hours ago",
    isActive: true,
  },
  {
    id: 2,
    name: "Cider",
    tiktokHandle: "caborwine",
    category: "fast-fashion",
    followers: 890000,
    followerChange: 5.1,
    videos: 340,
    avgLikes: 23000,
    lastScraped: "3 hours ago",
    isActive: true,
  },
  {
    id: 3,
    name: "Halara",
    tiktokHandle: "halaborofficial",
    category: "athleisure",
    followers: 1200000,
    followerChange: -1.2,
    videos: 520,
    avgLikes: 31000,
    lastScraped: "1 hour ago",
    isActive: true,
  },
  {
    id: 4,
    name: "Atorie",
    tiktokHandle: "shopatorie",
    category: "premium",
    followers: 12000,
    followerChange: 15.4,
    videos: 45,
    avgLikes: 890,
    lastScraped: "5 hours ago",
    isActive: true,
  },
];

const categories = [
  { value: "fast-fashion", label: "Fast Fashion" },
  { value: "premium", label: "Premium" },
  { value: "luxury", label: "Luxury" },
  { value: "streetwear", label: "Streetwear" },
  { value: "athleisure", label: "Athleisure" },
  { value: "minimal", label: "Minimal" },
];

export default function CompetitorsPage() {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newCompetitor, setNewCompetitor] = useState({
    name: "",
    tiktokHandle: "",
    category: "",
  });

  const handleAdd = async () => {
    // TODO: Implement API call
    console.log("Adding competitor:", newCompetitor);
    setIsAddOpen(false);
    setNewCompetitor({ name: "", tiktokHandle: "", category: "" });
  };

  return (
    <div>
      <Header
        title="Competitors"
        description="Track and analyze competitor TikTok accounts"
        action={
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Competitor
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Competitor</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <label className="text-sm font-medium">Brand Name</label>
                  <Input
                    placeholder="e.g., SHEIN"
                    value={newCompetitor.name}
                    onChange={(e) =>
                      setNewCompetitor({ ...newCompetitor, name: e.target.value })
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">TikTok Handle</label>
                  <Input
                    placeholder="e.g., shein_official (without @)"
                    value={newCompetitor.tiktokHandle}
                    onChange={(e) =>
                      setNewCompetitor({
                        ...newCompetitor,
                        tiktokHandle: e.target.value.replace("@", ""),
                      })
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Category</label>
                  <Select
                    value={newCompetitor.category}
                    onValueChange={(value) =>
                      setNewCompetitor({ ...newCompetitor, category: value })
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleAdd} className="w-full">
                  Add Competitor
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="p-6">
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Brand</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Followers</TableHead>
                <TableHead className="text-right">Growth</TableHead>
                <TableHead className="text-right">Videos</TableHead>
                <TableHead className="text-right">Avg Likes</TableHead>
                <TableHead>Last Scraped</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockCompetitors.map((competitor) => (
                <TableRow key={competitor.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{competitor.name}</p>
                      <p className="text-sm text-zinc-500">
                        @{competitor.tiktokHandle}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {categories.find((c) => c.value === competitor.category)
                        ?.label || competitor.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {(competitor.followers / 1000000).toFixed(1)}M
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {competitor.followerChange > 0 ? (
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      ) : competitor.followerChange < 0 ? (
                        <TrendingDown className="h-4 w-4 text-red-500" />
                      ) : (
                        <Minus className="h-4 w-4 text-zinc-400" />
                      )}
                      <span
                        className={
                          competitor.followerChange > 0
                            ? "text-green-600"
                            : competitor.followerChange < 0
                            ? "text-red-600"
                            : "text-zinc-500"
                        }
                      >
                        {competitor.followerChange > 0 ? "+" : ""}
                        {competitor.followerChange}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">{competitor.videos}</TableCell>
                  <TableCell className="text-right">
                    {(competitor.avgLikes / 1000).toFixed(1)}K
                  </TableCell>
                  <TableCell className="text-zinc-500">
                    {competitor.lastScraped}
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
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Scrape Now
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

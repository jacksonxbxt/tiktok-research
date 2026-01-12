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
  Plus,
  MoreHorizontal,
  ExternalLink,
  Trash2,
  RefreshCw,
  Loader2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Competitor {
  id: number;
  name: string;
  tiktokHandle: string;
  category: string | null;
  notes: string | null;
  isActive: boolean;
  scrapeFrequency: string;
  addedAt: string;
}

const categories = [
  { value: "fast-fashion", label: "Fast Fashion" },
  { value: "premium", label: "Premium" },
  { value: "luxury", label: "Luxury" },
  { value: "streetwear", label: "Streetwear" },
  { value: "athleisure", label: "Athleisure" },
  { value: "minimal", label: "Minimal" },
];

export default function CompetitorsPage() {
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [newCompetitor, setNewCompetitor] = useState({
    name: "",
    tiktokHandle: "",
    category: "",
  });

  useEffect(() => {
    fetchCompetitors();
  }, []);

  const fetchCompetitors = async () => {
    try {
      const res = await fetch("/api/competitors");
      const data = await res.json();
      setCompetitors(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch competitors:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!newCompetitor.name || !newCompetitor.tiktokHandle) return;

    setAdding(true);
    try {
      const res = await fetch("/api/competitors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCompetitor),
      });

      if (res.ok) {
        setIsAddOpen(false);
        setNewCompetitor({ name: "", tiktokHandle: "", category: "" });
        fetchCompetitors();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to add competitor");
      }
    } catch (error) {
      console.error("Failed to add competitor:", error);
      alert("Failed to add competitor");
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this competitor?")) return;

    try {
      const res = await fetch(`/api/competitors?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchCompetitors();
      }
    } catch (error) {
      console.error("Failed to delete:", error);
    }
  };

  const handleScrape = async (handle: string) => {
    try {
      const res = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "profile", target: handle }),
      });
      if (res.ok) {
        alert(`Started scraping @${handle}`);
      }
    } catch (error) {
      console.error("Failed to start scrape:", error);
    }
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
                <Button onClick={handleAdd} className="w-full" disabled={adding}>
                  {adding && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Add Competitor
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="p-6">
        <Card>
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
            </div>
          ) : competitors.length === 0 ? (
            <div className="p-8 text-center text-zinc-500">
              <p>No competitors added yet.</p>
              <p className="mt-1 text-sm">Click "Add Competitor" to start tracking.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Brand</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Frequency</TableHead>
                  <TableHead>Added</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {competitors.map((competitor) => (
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
                          ?.label || competitor.category || "Uncategorized"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={competitor.isActive ? "default" : "secondary"}>
                        {competitor.isActive ? "Active" : "Paused"}
                      </Badge>
                    </TableCell>
                    <TableCell className="capitalize">
                      {competitor.scrapeFrequency}
                    </TableCell>
                    <TableCell className="text-zinc-500">
                      {new Date(competitor.addedAt).toLocaleDateString()}
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
                                `https://tiktok.com/@${competitor.tiktokHandle}`,
                                "_blank"
                              )
                            }
                          >
                            <ExternalLink className="mr-2 h-4 w-4" />
                            View on TikTok
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleScrape(competitor.tiktokHandle)}
                          >
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Scrape Now
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => handleDelete(competitor.id)}
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

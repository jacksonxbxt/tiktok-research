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
  Play,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  Plus,
  User,
  Hash,
  Search,
  RefreshCw,
} from "lucide-react";

// Mock jobs data
const mockJobs = [
  {
    id: 1,
    type: "competitor",
    target: "@shein_official",
    status: "completed",
    itemsScraped: 50,
    startedAt: "10:30 AM",
    completedAt: "10:32 AM",
    duration: "2m 15s",
  },
  {
    id: 2,
    type: "hashtag",
    target: "#quietluxury",
    status: "running",
    itemsScraped: 23,
    startedAt: "10:45 AM",
    completedAt: null,
    duration: null,
  },
  {
    id: 3,
    type: "search",
    target: "chinese fashion brand",
    status: "pending",
    itemsScraped: 0,
    startedAt: null,
    completedAt: null,
    duration: null,
  },
  {
    id: 4,
    type: "competitor",
    target: "@cider",
    status: "failed",
    itemsScraped: 0,
    startedAt: "9:00 AM",
    completedAt: "9:01 AM",
    duration: "1m 05s",
    error: "Rate limit exceeded",
  },
  {
    id: 5,
    type: "competitor",
    target: "@halara",
    status: "completed",
    itemsScraped: 45,
    startedAt: "8:00 AM",
    completedAt: "8:03 AM",
    duration: "3m 22s",
  },
];

function getStatusIcon(status: string) {
  switch (status) {
    case "completed":
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case "running":
      return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
    case "pending":
      return <Clock className="h-4 w-4 text-yellow-500" />;
    case "failed":
      return <XCircle className="h-4 w-4 text-red-500" />;
    default:
      return null;
  }
}

function getStatusBadge(status: string) {
  switch (status) {
    case "completed":
      return <Badge className="bg-green-100 text-green-700">Completed</Badge>;
    case "running":
      return <Badge className="bg-blue-100 text-blue-700">Running</Badge>;
    case "pending":
      return <Badge className="bg-yellow-100 text-yellow-700">Pending</Badge>;
    case "failed":
      return <Badge className="bg-red-100 text-red-700">Failed</Badge>;
    default:
      return null;
  }
}

function getTypeIcon(type: string) {
  switch (type) {
    case "competitor":
      return <User className="h-4 w-4" />;
    case "hashtag":
      return <Hash className="h-4 w-4" />;
    case "search":
      return <Search className="h-4 w-4" />;
    default:
      return null;
  }
}

export default function JobsPage() {
  const [isNewJobOpen, setIsNewJobOpen] = useState(false);
  const [newJob, setNewJob] = useState({
    type: "",
    target: "",
  });

  const handleRunJob = async () => {
    console.log("Running job:", newJob);
    setIsNewJobOpen(false);
    setNewJob({ type: "", target: "" });
  };

  const stats = {
    running: mockJobs.filter((j) => j.status === "running").length,
    pending: mockJobs.filter((j) => j.status === "pending").length,
    completed: mockJobs.filter((j) => j.status === "completed").length,
    failed: mockJobs.filter((j) => j.status === "failed").length,
  };

  return (
    <div>
      <Header
        title="Scrape Jobs"
        description="Run and monitor scraping jobs"
        action={
          <Dialog open={isNewJobOpen} onOpenChange={setIsNewJobOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Scrape Job
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Run Manual Scrape</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <label className="text-sm font-medium">Type</label>
                  <Select
                    value={newJob.type}
                    onValueChange={(value) =>
                      setNewJob({ ...newJob, type: value })
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select scrape type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="competitor">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          Competitor Profile
                        </div>
                      </SelectItem>
                      <SelectItem value="hashtag">
                        <div className="flex items-center gap-2">
                          <Hash className="h-4 w-4" />
                          Hashtag
                        </div>
                      </SelectItem>
                      <SelectItem value="search">
                        <div className="flex items-center gap-2">
                          <Search className="h-4 w-4" />
                          Search Query
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">
                    {newJob.type === "competitor"
                      ? "Username"
                      : newJob.type === "hashtag"
                      ? "Hashtag"
                      : "Search Query"}
                  </label>
                  <Input
                    placeholder={
                      newJob.type === "competitor"
                        ? "@username"
                        : newJob.type === "hashtag"
                        ? "#hashtag"
                        : "Enter search query"
                    }
                    value={newJob.target}
                    onChange={(e) =>
                      setNewJob({ ...newJob, target: e.target.value })
                    }
                    className="mt-1"
                  />
                </div>
                <Button onClick={handleRunJob} className="w-full">
                  <Play className="mr-2 h-4 w-4" />
                  Start Scrape
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="p-6">
        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
              <p className="text-sm text-zinc-500">Running</p>
            </div>
            <p className="mt-1 text-2xl font-semibold">{stats.running}</p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-yellow-500" />
              <p className="text-sm text-zinc-500">Pending</p>
            </div>
            <p className="mt-1 text-2xl font-semibold">{stats.pending}</p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <p className="text-sm text-zinc-500">Completed (Today)</p>
            </div>
            <p className="mt-1 text-2xl font-semibold">{stats.completed}</p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-500" />
              <p className="text-sm text-zinc-500">Failed</p>
            </div>
            <p className="mt-1 text-2xl font-semibold">{stats.failed}</p>
          </Card>
        </div>

        {/* Jobs Table */}
        <Card className="mt-6">
          <div className="flex items-center justify-between border-b p-4">
            <h2 className="font-semibold">Recent Jobs</h2>
            <Button variant="ghost" size="sm">
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Target</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Items</TableHead>
                <TableHead>Started</TableHead>
                <TableHead>Duration</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockJobs.map((job) => (
                <TableRow key={job.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getTypeIcon(job.type)}
                      <span className="capitalize">{job.type}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{job.target}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(job.status)}
                      {getStatusBadge(job.status)}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    {job.itemsScraped > 0 ? job.itemsScraped : "-"}
                  </TableCell>
                  <TableCell className="text-zinc-500">
                    {job.startedAt || "-"}
                  </TableCell>
                  <TableCell className="text-zinc-500">
                    {job.duration || "-"}
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

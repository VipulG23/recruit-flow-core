"use client";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "react-router-dom";
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  MapPin,
  Clock,
  Users,
  Briefcase,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useStore, Job } from "@/store/useStore";
import { JOB_STATUSES } from "@/api/server";

const statusColors = {
  active: "bg-success text-success-foreground",
  paused: "bg-warning text-warning-foreground",
  closed: "bg-muted text-muted-foreground",
  draft: "bg-secondary text-secondary-foreground",
};

const priorityColors = {
  low: "text-muted-foreground",
  medium: "text-foreground",
  high: "text-warning",
  urgent: "text-destructive",
};

const fetchJobs = async (): Promise<Job[]> => {
  const response = await fetch("/api/jobs");
  if (!response.ok) throw new Error("Failed to fetch jobs");
  const data = await response.json();
  return data.jobs || data;
};

export default function JobsPage() {
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isJobFormOpen, setIsJobFormOpen] = useState(false);
  const [highlightCreateJob, setHighlightCreateJob] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);

  const { setJobs, jobs } = useStore();

  const { data: jobsData, isLoading, error } = useQuery({
    queryKey: ["jobs"],
    queryFn: fetchJobs,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (jobsData) setJobs(jobsData);
  }, [jobsData, setJobs]);

  // Highlight Create Job if navigated from Dashboard
  useEffect(() => {
    if (location.state?.highlightCreateJob) {
      setHighlightCreateJob(true);
      setIsJobFormOpen(true);
      const timer = setTimeout(() => setHighlightCreateJob(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [location.state]);

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || job.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreateJob = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    const newJob: Job = {
      id: Date.now().toString(),
      title: formData.get("title") as string,
      department: formData.get("department") as string,
      location: formData.get("location") as string,
      type: formData.get("type") as string,
      status: "active",
      priority: formData.get("priority") as string,
      salary: {
        min: Number(formData.get("salaryMin")),
        max: Number(formData.get("salaryMax")),
      },
      createdAt: new Date().toISOString(),
    };

    setJobs([...jobs, newJob]);
    setIsJobFormOpen(false);
    form.reset();
  };

  const handleDeleteJob = async (jobId: string) => {
    if (!confirm("Are you sure you want to archive this job?")) return;
    try {
      setJobs(jobs.filter((job) => job.id !== jobId));
      const response = await fetch(`/api/jobs/${jobId}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete job from server");
    } catch (err) {
      console.error(err);
      alert("Error deleting job. Please try again.");
    }
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-destructive">Error loading jobs</h3>
          <p className="text-muted-foreground">Please try again later</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Jobs</h1>
          <p className="text-muted-foreground">Manage your job postings and hiring</p>
        </div>

        {/* Create Job Button */}
        <Dialog open={isJobFormOpen} onOpenChange={setIsJobFormOpen}>
          <DialogTrigger asChild>
            <Button
              className={`btn-primary transition-all ${
                highlightCreateJob ? "ring-4 ring-yellow-400" : ""
              }`}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Job
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create Job</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateJob} className="space-y-4">
              <div>
                <Label htmlFor="title">Job Title</Label>
                <Input id="title" name="title" required />
              </div>

              <div>
                <Label htmlFor="department">Department</Label>
                <Input id="department" name="department" required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input id="location" name="location" required />
                </div>
                <div>
                  <Label htmlFor="type">Job Type</Label>
                  <Input id="type" name="type" placeholder="Full-time" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="salaryMin">Min Salary</Label>
                  <Input type="number" id="salaryMin" name="salaryMin" required />
                </div>
                <div>
                  <Label htmlFor="salaryMax">Max Salary</Label>
                  <Input type="number" id="salaryMax" name="salaryMax" required />
                </div>
              </div>

              <div>
                <Label htmlFor="priority">Priority</Label>
                <select
                  id="priority"
                  name="priority"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  required
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <DialogFooter>
                <Button type="submit" className="btn-primary">Save</Button>
                <Button variant="outline" onClick={() => setIsJobFormOpen(false)}>Cancel</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search jobs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Status: {statusFilter === "all" ? "All" : statusFilter}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setStatusFilter("all")}>All Statuses</DropdownMenuItem>
            {JOB_STATUSES.map((status) => (
              <DropdownMenuItem key={status.value} onClick={() => setStatusFilter(status.value)}>
                {status.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Jobs Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-muted rounded w-3/4"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded"></div>
                  <div className="h-4 bg-muted rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
{filteredJobs.map((job) => (
<Card key={job.id} className="card-interactive hover:shadow-primary/10">
<CardHeader className="pb-3">
<div className="flex items-start justify-between">
<div className="space-y-1">
<CardTitle className="text-lg leading-tight">{job.title}</CardTitle>
<p className="text-sm text-muted-foreground">{job.department}</p>
</div>
<DropdownMenu>
<DropdownMenuTrigger asChild>
<Button variant="ghost" size="sm" className="h-8 w-8 p-0">
<MoreHorizontal className="h-4 w-4" />
</Button>
</DropdownMenuTrigger>
<DropdownMenuContent align="end">
<DropdownMenuItem
onClick={() => { setSelectedJob(job); setIsEditFormOpen(true); }}
>Edit Job</DropdownMenuItem>
<DropdownMenuItem className="text-destructive" onClick={() => handleDeleteJob(job.id)}>Archive Job</DropdownMenuItem>
</DropdownMenuContent>
</DropdownMenu>
</div>
</CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />{job.location}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />{job.type}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Badge className={statusColors[job.status]} variant="secondary">
                {JOB_STATUSES.find((s) => s.value === job.status)?.label}
              </Badge>

              <div className="text-right">
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Users className="h-3 w-3" /><span>24 candidates</span>
                </div>
                <div className={`text-sm font-medium ${priorityColors[job.priority]}`}>
                  {job.priority.charAt(0).toUpperCase() + job.priority.slice(1)} priority
                </div>
              </div>
            </div>

            <div className="text-sm">
              <div className="font-medium text-foreground">
                ${job.salary.min.toLocaleString()} - ${job.salary.max.toLocaleString()}
              </div>
              <div className="text-muted-foreground">
                Posted {new Date(job.createdAt).toLocaleDateString()}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )}
</div>
  )
}
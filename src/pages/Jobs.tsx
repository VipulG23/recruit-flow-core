import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Search, Filter, MoreHorizontal, MapPin, Clock, Users, Briefcase } from "lucide-react";
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
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const { setJobs, jobs } = useStore();

  const { data: jobsData, isLoading, error } = useQuery({
    queryKey: ["jobs"],
    queryFn: fetchJobs,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  useEffect(() => {
    if (jobsData) {
      setJobs(jobsData);
    }
  }, [jobsData, setJobs]);

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || job.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
          <p className="text-muted-foreground">
            Manage your job postings and hiring pipeline
          </p>
        </div>
        <Button className="btn-primary">
          <Plus className="h-4 w-4 mr-2" />
          Create Job
        </Button>
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
            <DropdownMenuItem onClick={() => setStatusFilter("all")}>
              All Statuses
            </DropdownMenuItem>
            {JOB_STATUSES.map((status) => (
              <DropdownMenuItem 
                key={status.value}
                onClick={() => setStatusFilter(status.value)}
              >
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
            <Card 
              key={job.id} 
              className="card-interactive hover:shadow-primary/10"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg leading-tight">
                      {job.title}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {job.department}
                    </p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>View Details</DropdownMenuItem>
                      <DropdownMenuItem>Edit Job</DropdownMenuItem>
                      <DropdownMenuItem>View Candidates</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">
                        Archive Job
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {job.location}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {job.type}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Badge 
                    className={statusColors[job.status]}
                    variant="secondary"
                  >
                    {JOB_STATUSES.find(s => s.value === job.status)?.label}
                  </Badge>
                  
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Users className="h-3 w-3" />
                      <span>24 candidates</span>
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

      {filteredJobs.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
            <Briefcase className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">No jobs found</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm || statusFilter !== "all" 
              ? "Try adjusting your search or filters"
              : "Create your first job posting to get started"
            }
          </p>
          {(!searchTerm && statusFilter === "all") && (
            <Button className="btn-primary">
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Job
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
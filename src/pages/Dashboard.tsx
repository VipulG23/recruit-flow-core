import { useQuery } from "@tanstack/react-query";
import {
  Users,
  BriefcaseIcon,
  FileText,
  TrendingUp,
  Clock,
  AlertCircle,
  Building2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {  useNavigate } from "react-router-dom";


interface DashboardStats {
  totalJobs: number;
  activeJobs: number;
  totalCandidates: number;
  recentApplications: number;
  averageTimeToHire: number;
  offerAcceptanceRate: number;
}

const fetchDashboardStats = async (): Promise<DashboardStats> => {
  const response = await fetch("/api/stats/overview");
  if (!response.ok) throw new Error("Failed to fetch stats");
  const data = await response.json();

  return {
    totalJobs: data.jobs,
    activeJobs: data.activeJobs,
    totalCandidates: data.candidates,
    recentApplications: 0, 
    averageTimeToHire: 30, 
    offerAcceptanceRate: data.candidates ? data.hired / data.candidates : 0,
  };
};


export default function Dashboard() {
  const navigate = useNavigate();

  const { data: stats, isLoading, error } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: fetchDashboardStats,
    staleTime: 5 * 60 * 1000,
  });

  const StatCard = ({
    title,
    value,
    icon: Icon,
    change,
    changeType = "neutral"
  }: {
    title: string;
    value: string | number;
    icon: any;
    change?: string;
    changeType?: "positive" | "negative" | "neutral";
  }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold">{value}</p>
            {change && (
              <p className={`text-sm ${
                changeType === "positive" ? "text-success" :
                changeType === "negative" ? "text-destructive" :
                "text-muted-foreground"
              }`}>
                {change}
              </p>
            )}
          </div>
          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <Icon className="h-6 w-6 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-destructive">Error loading dashboard</h3>
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
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's what's happening with your hiring.
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded w-24"></div>
                    <div className="h-8 bg-muted rounded w-16"></div>
                  </div>
                  <div className="h-12 w-12 bg-muted rounded-lg"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Jobs"
            value={stats?.totalJobs || 0}
            icon={BriefcaseIcon}
            change="+2 this week"
            changeType="positive"
          />
          <StatCard
            title="Active Jobs"
            value={stats?.activeJobs || 0}
            icon={Building2}
            change="3 paused"
            changeType="neutral"
          />
          <StatCard
            title="Total Candidates"
            value={stats?.totalCandidates || 0}
            icon={Users}
            change="+47 this week"
            changeType="positive"
          />
          <StatCard
            title="Recent Applications"
            value={stats?.recentApplications || 0}
            icon={FileText}
            change="Last 7 days"
            changeType="neutral"
          />
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Hiring Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Average Time to Hire</span>
                <span className="font-semibold">
                  {stats?.averageTimeToHire || 0} days
                </span>
              </div>
              <Progress
                value={((stats?.averageTimeToHire || 0) / 60) * 100}
                className="h-2"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Offer Acceptance Rate</span>
                <span className="font-semibold">
                  {stats ? Math.round(stats.offerAcceptanceRate * 100) : 0}%
                </span>
              </div>
              <Progress
                value={(stats?.offerAcceptanceRate || 0) * 100}
                className="h-2"
              />
            </div>

            <div className="pt-4 border-t">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <TrendingUp className="h-4 w-4" />
                Performance is 12% better than last month
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-primary" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-success"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">New candidate applied</p>
                  <p className="text-xs text-muted-foreground">
                    Senior Developer - 2 min ago
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-warning"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Interview scheduled</p>
                  <p className="text-xs text-muted-foreground">
                    Product Manager - 1 hour ago
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-primary"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Job posted</p>
                  <p className="text-xs text-muted-foreground">
                    UX Designer - 3 hours ago
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-success"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Offer accepted</p>
                  <p className="text-xs text-muted-foreground">
                    Data Scientist - 1 day ago
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Create Job */}
            <Card
              className="cursor-pointer hover:border-primary transition-colors"
              onClick={() =>
                navigate("/jobs", { state: { highlightCreateJob: true } })
              }
            >
              <CardContent className="p-4 text-center">
                <BriefcaseIcon className="h-8 w-8 text-primary mx-auto mb-2" />
                <h3 className="font-semibold">Create Job</h3>
                <p className="text-sm text-muted-foreground">
                  Post a new job opening
                </p>
              </CardContent>
            </Card>

            {/* Create Assessment */}
            <Card
              className="cursor-pointer hover:border-primary transition-colors"
              onClick={() =>
                navigate("/assessments", {
                  state: { highlightCreateAssessment: true }, // ✅ corrected
                })
              }
            >
              <CardContent className="p-4 text-center">
                <FileText className="h-8 w-8 text-primary mx-auto mb-2" />
                <h3 className="font-semibold">Create Assessment</h3>
                <p className="text-sm text-muted-foreground">
                  Build candidate evaluation
                </p>
              </CardContent>
            </Card>

            {/* Review Candidates */}
            <Card
              className="cursor-pointer hover:border-primary transition-colors"
              onClick={() =>
                navigate("/assessments", {
                  state: { highlightCreateAssessment: true }, 
                })
              }
            >
              <CardContent className="p-4 text-center">
                <Users className="h-8 w-8 text-primary mx-auto mb-2" />
                <h3 className="font-semibold">Review Candidates</h3>
                <p className="text-sm text-muted-foreground">
                  View pending applications
                </p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

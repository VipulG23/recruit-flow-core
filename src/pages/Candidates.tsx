import { useState, useEffect, useMemo, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Search, User, Mail, MapPin, Star } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useStore, Candidate } from "@/store/useStore";
import { JOB_STAGES } from "@/api/server";

const stageColors: Record<string, string> = {
  applied: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  screening:
    "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  interview:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  assessment: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  final: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  offer:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200",
  hired: "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200",
  rejected: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
};

const fetchCandidates = async (
  search = "",
  stage = "",
  page = 1
): Promise<{ candidates: Candidate[]; pagination: any }> => {
  const params = new URLSearchParams({
    search,
    stage,
    page: page.toString(),
    limit: "50",
  });

  const response = await fetch(`/api/candidates?${params}`);
  if (!response.ok) throw new Error("Failed to fetch candidates");
  return response.json();
};

export default function CandidatesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [stageFilter, setStageFilter] = useState("all");
  const { setCandidates, candidates } = useStore();
  const parentRef = useRef<HTMLDivElement>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["candidates", searchTerm, stageFilter],
    queryFn: () =>
      fetchCandidates(searchTerm, stageFilter === "all" ? "" : stageFilter),
    staleTime: 2 * 60 * 1000,
  });

  useEffect(() => {
    if (data?.candidates) setCandidates(data.candidates);
  }, [data, setCandidates]);

  // Filtered + sorted candidates
  const filteredCandidates = useMemo(() => {
    let filtered = candidates.filter((candidate) => {
      const matchesSearch =
        !searchTerm ||
        candidate.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStage =
        stageFilter === "all" || candidate.stage === stageFilter;
      return matchesSearch && matchesStage;
    });

    // Example sort: by experience descending
    filtered.sort((a, b) => b.experience - a.experience);

    return filtered;
  }, [candidates, searchTerm, stageFilter]);

  // Virtualizer
  const virtualizer = useVirtualizer({
    count: filteredCandidates.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 120,
    overscan: 5,
  });

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-destructive">
            Error loading candidates
          </h3>
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
          <h1 className="text-3xl font-bold tracking-tight">Candidates</h1>
          <p className="text-muted-foreground">
            Manage your candidate pipeline ({candidates.length} total
            candidates)
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search candidates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select value={stageFilter} onValueChange={setStageFilter}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Stages</SelectItem>
            {JOB_STAGES.map((stage) => (
              <SelectItem key={stage.id} value={stage.id}>
                {stage.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Stage Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        {JOB_STAGES.map((stage) => {
          const count = candidates.filter((c) => c.stage === stage.id).length;
          return (
            <Card key={stage.id} className="p-3">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{count}</div>
                <div className="text-xs text-muted-foreground">
                  {stage.name}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Candidates List */}
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-muted rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-1/4"></div>
                    <div className="h-3 bg-muted rounded w-1/3"></div>
                  </div>
                  <div className="h-6 bg-muted rounded w-20"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div ref={parentRef} className="h-[600px] overflow-auto">
          <div
            style={{
              height: `${virtualizer.getTotalSize()}px`,
              width: "100%",
              position: "relative",
            }}
          >
            {virtualizer.getVirtualItems().map((virtualItem) => {
              const candidate = filteredCandidates[virtualItem.index];
              const stage = JOB_STAGES.find((s) => s.id === candidate.stage);

              return (
                <div
                  key={virtualItem.key}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: `${virtualItem.size}px`,
                    transform: `translateY(${virtualItem.start}px)`,
                  }}
                >
                  <Card className="card-interactive mb-2 mx-1">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={candidate.avatar} />
                            <AvatarFallback>
                              <User className="h-6 w-6" />
                            </AvatarFallback>
                          </Avatar>
                          <div className="space-y-1">
                            <h3 className="font-semibold">
                              {candidate.firstName} {candidate.lastName}
                            </h3>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {candidate.email}
                              </div>
                              <div className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {candidate.location}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <span className="text-muted-foreground">
                                {candidate.currentRole} at{" "}
                                {candidate.currentCompany}
                              </span>
                              <span className="text-muted-foreground">•</span>
                              <span className="text-muted-foreground">
                                {candidate.experience} years exp
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right space-y-1">
                            <div className="flex items-center gap-1">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-3 w-3 ${
                                    i < candidate.rating
                                      ? "fill-warning text-warning"
                                      : "text-muted-foreground"
                                  }`}
                                />
                              ))}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Applied{" "}
                              {new Date(
                                candidate.appliedAt
                              ).toLocaleDateString()}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              via {candidate.source}
                            </div>
                          </div>
                          <Badge
                            className={
                              stageColors[candidate.stage] ||
                              stageColors.applied
                            }
                          >
                            {stage?.name || candidate.stage}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {filteredCandidates.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
            <User className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">No candidates found</h3>
          <p className="text-muted-foreground">
            {searchTerm || stageFilter !== "all"
              ? "Try adjusting your search or filters"
              : "Candidates will appear here as they apply to your jobs"}
          </p>
        </div>
      )}
    </div>
  );
}

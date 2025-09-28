import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Search, MoreHorizontal, FileText, Clock, Users, Eye } from "lucide-react";
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
import { useStore, Assessment } from "@/store/useStore";

const statusColors = {
  draft: "bg-secondary text-secondary-foreground",
  active: "bg-success text-success-foreground", 
  paused: "bg-warning text-warning-foreground",
  archived: "bg-muted text-muted-foreground",
};

const typeIcons = {
  quiz: FileText,
  coding: FileText,
  essay: FileText, 
  interview: Users,
};

const fetchAssessments = async (): Promise<Assessment[]> => {
  const response = await fetch("/api/assessments");
  if (!response.ok) throw new Error("Failed to fetch assessments");
  const data = await response.json();
  return data.assessments || data;
};

export default function AssessmentsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const { setAssessments, assessments } = useStore();

  const { data: assessmentsData, isLoading, error } = useQuery({
    queryKey: ["assessments"],
    queryFn: fetchAssessments,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  useEffect(() => {
    if (assessmentsData) {
      setAssessments(assessmentsData);
    }
  }, [assessmentsData, setAssessments]);

  const filteredAssessments = assessments.filter((assessment) => {
    return assessment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
           assessment.description.toLowerCase().includes(searchTerm.toLowerCase());
  });

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-destructive">Error loading assessments</h3>
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
          <h1 className="text-3xl font-bold tracking-tight">Assessments</h1>
          <p className="text-muted-foreground">
            Create and manage candidate assessments
          </p>
        </div>
        <Button className="btn-primary">
          <Plus className="h-4 w-4 mr-2" />
          Create Assessment
        </Button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search assessments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <div>
                <div className="text-2xl font-bold">{assessments.length}</div>
                <div className="text-sm text-muted-foreground">Total Assessments</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-success"></div>
              <div>
                <div className="text-2xl font-bold">
                  {assessments.filter(a => a.status === 'active').length}
                </div>
                <div className="text-sm text-muted-foreground">Active</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-secondary"></div>
              <div>
                <div className="text-2xl font-bold">
                  {assessments.filter(a => a.status === 'draft').length}
                </div>
                <div className="text-sm text-muted-foreground">Drafts</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <div>
                <div className="text-2xl font-bold">156</div>
                <div className="text-sm text-muted-foreground">Responses</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Assessments Grid */}
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
          {filteredAssessments.map((assessment) => {
            const TypeIcon = typeIcons[assessment.type] || FileText;
            
            return (
              <Card 
                key={assessment.id} 
                className="card-interactive hover:shadow-primary/10"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg leading-tight">
                        {assessment.title}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {assessment.description}
                      </p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="h-4 w-4 mr-2" />
                          Preview
                        </DropdownMenuItem>
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                        <DropdownMenuItem>Duplicate</DropdownMenuItem>
                        <DropdownMenuItem>View Responses</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <TypeIcon className="h-3 w-3" />
                      {assessment.type.charAt(0).toUpperCase() + assessment.type.slice(1)}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {assessment.duration} min
                    </div>
                    <div className="flex items-center gap-1">
                      <FileText className="h-3 w-3" />
                      {assessment.questions.length} questions
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <Badge 
                      className={statusColors[assessment.status]}
                      variant="secondary"
                    >
                      {assessment.status.charAt(0).toUpperCase() + assessment.status.slice(1)}
                    </Badge>
                    
                    <div className="text-sm text-muted-foreground">
                      Created {new Date(assessment.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Eye className="h-3 w-3 mr-1" />
                      Preview
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      Edit
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {filteredAssessments.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
            <FileText className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">No assessments found</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm 
              ? "Try adjusting your search term"
              : "Create your first assessment to evaluate candidates"
            }
          </p>
          {!searchTerm && (
            <Button className="btn-primary">
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Assessment
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
"use client";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Plus,
  Search,
  MoreHorizontal,
  FileText,
  Clock,
  Users,
  Eye,
  Copy,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Pencil } from "lucide-react"; 
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useStore, Assessment } from "@/store/useStore";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

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

const assessmentTypes = ["quiz", "coding", "essay", "interview"];
const assessmentStatuses = ["draft", "active", "paused", "archived"];

const fetchAssessments = async (): Promise<Assessment[]> => {
  const response = await fetch("/api/assessments");
  if (!response.ok) throw new Error("Failed to fetch assessments");
  const data = await response.json();
  return data.assessments || data;
};

export default function AssessmentsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const { setAssessments, assessments } = useStore();

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    id: "",
    title: "",
    description: "",
    type: "quiz",
    duration: 30,
    status: "draft",
    questions: [] as any[],
    createdAt: "",
  });

  const [previewAssessment, setPreviewAssessment] = useState<Assessment | null>(null);

  const {
    data: assessmentsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["assessments"],
    queryFn: fetchAssessments,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (assessmentsData) setAssessments(assessmentsData);
  }, [assessmentsData, setAssessments]);

  const filteredAssessments = assessments.filter(
    (a) =>
      a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newAssessment: Assessment = {
      ...formData,
      id: formData.id || Date.now().toString(),
      createdAt: formData.createdAt || new Date().toISOString(),
    };

    const exists = assessments.find((a) => a.id === newAssessment.id);

    if (exists) {
      // Edit existing
      setAssessments(
        assessments.map((a) => (a.id === newAssessment.id ? newAssessment : a))
      );
    } else {
      // Create new
      setAssessments([newAssessment, ...assessments]);
    }

    setShowForm(false);
    setFormData({
      id: "",
      title: "",
      description: "",
      type: "quiz",
      duration: 30,
      status: "draft",
      questions: [],
      createdAt: "",
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Are you sure you want to delete this assessment?")) return;
    setAssessments(assessments.filter((a) => a.id !== id));
  };

  const handleDuplicate = (a: Assessment) => {
    const dup: Assessment = { ...a, id: Date.now().toString(), title: a.title + " (Copy)", createdAt: new Date().toISOString() };
    setAssessments([dup, ...assessments]);
  };

  const handleEdit = (a: Assessment) => {
    setFormData(a);
    setShowForm(true);
  };

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
        <Button onClick={() => setShowForm(true)} className="btn-primary">
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

      {/* Assessment Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-900 rounded-lg w-full max-w-lg p-6 space-y-4">
            <h2 className="text-xl font-bold">{formData.id ? "Edit" : "Create"} Assessment</h2>
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleFormChange}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  name="description"
                  required
                  rows={3}
                  value={formData.description}
                  onChange={handleFormChange}
                  className="mt-1 w-full rounded-md border border-input px-3 py-2 bg-background text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <Label>Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(val) => handleSelectChange("type", val)}
                  >
                    <SelectTrigger className="mt-1 w-full">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {assessmentTypes.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t.charAt(0).toUpperCase() + t.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex-1">
                  <Label>Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(val) => handleSelectChange("status", val)}
                  >
                    <SelectTrigger className="mt-1 w-full">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {assessmentStatuses.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s.charAt(0).toUpperCase() + s.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Input
                  id="duration"
                  name="duration"
                  type="number"
                  min={1}
                  value={formData.duration}
                  onChange={handleFormChange}
                  className="mt-1"
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="btn-primary">
                  {formData.id ? "Update" : "Create"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview Dialog */}
      <Dialog
        open={!!previewAssessment}
        onOpenChange={() => setPreviewAssessment(null)}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Assessment Preview</DialogTitle>
          </DialogHeader>

          {previewAssessment && (
            <div className="space-y-4">
              <div>
                <Label>Title</Label>
                <p className="mt-1">{previewAssessment.title}</p>
              </div>
              <div>
                <Label>Description</Label>
                <p className="mt-1">{previewAssessment.description}</p>
              </div>
              <div className="flex gap-4">
                <div>
                  <Label>Type</Label>
                  <p className="mt-1">{previewAssessment.type}</p>
                </div>
                <div>
                  <Label>Status</Label>
                  <p className="mt-1">{previewAssessment.status}</p>
                </div>
                <div>
                  <Label>Duration</Label>
                  <p className="mt-1">{previewAssessment.duration} min</p>
                </div>
              </div>
              <div>
                <Label>Questions</Label>
                <p className="mt-1">{previewAssessment.questions?.length || 0}</p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setPreviewAssessment(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => setPreviewAssessment(assessment)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Preview
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEdit(assessment)}>
                          <Pencil className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDuplicate(assessment)}>
                          <Copy className="h-4 w-4 mr-2" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleDelete(assessment.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
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
                      {assessment.questions?.length || 0} questions
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
                </CardContent>
              </Card>
            );
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
              : "Create your first assessment to evaluate candidates"}
          </p>
          {!searchTerm && (
            <Button className="btn-primary" onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Assessment
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

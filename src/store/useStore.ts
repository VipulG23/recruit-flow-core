import { create } from "zustand";
import { persist } from "zustand/middleware";
import localforage from "localforage";

// Configure localforage for IndexedDB storage
localforage.config({
  driver: localforage.INDEXEDDB,
  name: "TalentFlow",
  version: 1.0,
  storeName: "talentflow_store",
});

export interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  status: "active" | "paused" | "closed" | "draft";
  description: string;
  requirements: string[];
  salary: {
    min: number;
    max: number;
    currency: string;
  };
  priority: "low" | "medium" | "high" | "urgent";
  hiringManager: {
    id: string;
    name: string;
    email: string;
    avatar: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface Candidate {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatar: string;
  location: string;
  experience: number;
  currentRole: string;
  currentCompany: string;
  stage: string;
  jobId: string;
  appliedAt: Date;
  lastActivity: Date;
  rating: number;
  notes: string;
  skills: string[];
  resumeUrl: string;
  linkedinUrl: string;
  source: string;
}

export interface Assessment {
  id: string;
  title: string;
  description: string;
  type: "quiz" | "coding" | "essay" | "interview";
  duration: number;
  questions: AssessmentQuestion[];
  status: "draft" | "active" | "paused" | "archived";
  createdAt: Date;
}

export interface AssessmentQuestion {
  id: number;
  type: "multiple-choice" | "text" | "code" | "rating";
  question: string;
  required: boolean;
  options?: string[];
}

export interface AppState {
  // UI State
  sidebarCollapsed: boolean;
  currentTheme: "light" | "dark";
  
  // Jobs
  jobs: Job[];
  selectedJob: Job | null;
  jobsLoading: boolean;
  
  // Candidates  
  candidates: Candidate[];
  selectedCandidate: Candidate | null;
  candidatesLoading: boolean;
  candidateFilters: {
    search: string;
    stage: string;
    jobId: string;
  };
  
  // Assessments
  assessments: Assessment[];
  selectedAssessment: Assessment | null;
  assessmentsLoading: boolean;
  
  // Pagination
  pagination: {
    candidates: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface AppActions {
  // UI Actions
  setSidebarCollapsed: (collapsed: boolean) => void;
  setTheme: (theme: "light" | "dark") => void;
  
  // Job Actions
  setJobs: (jobs: Job[]) => void;
  setSelectedJob: (job: Job | null) => void;
  setJobsLoading: (loading: boolean) => void;
  addJob: (job: Job) => void;
  updateJob: (id: string, updates: Partial<Job>) => void;
  removeJob: (id: string) => void;
  
  // Candidate Actions
  setCandidates: (candidates: Candidate[]) => void;
  setSelectedCandidate: (candidate: Candidate | null) => void;
  setCandidatesLoading: (loading: boolean) => void;
  updateCandidate: (id: string, updates: Partial<Candidate>) => void;
  moveCandidateToStage: (candidateId: string, newStage: string) => void;
  setCandidateFilters: (filters: Partial<AppState["candidateFilters"]>) => void;
  
  // Assessment Actions
  setAssessments: (assessments: Assessment[]) => void;
  setSelectedAssessment: (assessment: Assessment | null) => void;
  setAssessmentsLoading: (loading: boolean) => void;
  addAssessment: (assessment: Assessment) => void;
  updateAssessment: (id: string, updates: Partial<Assessment>) => void;
  removeAssessment: (id: string) => void;
  
  // Pagination Actions
  setCandidatesPagination: (pagination: Partial<AppState["pagination"]["candidates"]>) => void;
  
  // Persistence Actions
  loadFromStorage: () => Promise<void>;
  saveToStorage: () => Promise<void>;
}

// Create the store with persistence
export const useStore = create<AppState & AppActions>()(
  persist(
    (set, get) => ({
      // Initial State
      sidebarCollapsed: false,
      currentTheme: "light",
      
      jobs: [],
      selectedJob: null,
      jobsLoading: false,
      
      candidates: [],
      selectedCandidate: null,
      candidatesLoading: false,
      candidateFilters: {
        search: "",
        stage: "",
        jobId: "",
      },
      
      assessments: [],
      selectedAssessment: null,
      assessmentsLoading: false,
      
      pagination: {
        candidates: {
          page: 1,
          limit: 50,
          total: 0,
          totalPages: 0,
        },
      },

      // UI Actions
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      setTheme: (theme) => set({ currentTheme: theme }),

      // Job Actions
      setJobs: (jobs) => set({ jobs }),
      setSelectedJob: (job) => set({ selectedJob: job }),
      setJobsLoading: (loading) => set({ jobsLoading: loading }),
      addJob: (job) => set((state) => ({ jobs: [...state.jobs, job] })),
      updateJob: (id, updates) =>
        set((state) => ({
          jobs: state.jobs.map((job) =>
            job.id === id ? { ...job, ...updates } : job
          ),
        })),
      removeJob: (id) =>
        set((state) => ({
          jobs: state.jobs.filter((job) => job.id !== id),
        })),

      // Candidate Actions
      setCandidates: (candidates) => set({ candidates }),
      setSelectedCandidate: (candidate) => set({ selectedCandidate: candidate }),
      setCandidatesLoading: (loading) => set({ candidatesLoading: loading }),
      updateCandidate: (id, updates) =>
        set((state) => ({
          candidates: state.candidates.map((candidate) =>
            candidate.id === id ? { ...candidate, ...updates } : candidate
          ),
        })),
      moveCandidateToStage: (candidateId, newStage) =>
        set((state) => ({
          candidates: state.candidates.map((candidate) =>
            candidate.id === candidateId
              ? { ...candidate, stage: newStage, lastActivity: new Date() }
              : candidate
          ),
        })),
      setCandidateFilters: (filters) =>
        set((state) => ({
          candidateFilters: { ...state.candidateFilters, ...filters },
        })),

      // Assessment Actions
      setAssessments: (assessments) => set({ assessments }),
      setSelectedAssessment: (assessment) => set({ selectedAssessment: assessment }),
      setAssessmentsLoading: (loading) => set({ assessmentsLoading: loading }),
      addAssessment: (assessment) =>
        set((state) => ({ assessments: [...state.assessments, assessment] })),
      updateAssessment: (id, updates) =>
        set((state) => ({
          assessments: state.assessments.map((assessment) =>
            assessment.id === id ? { ...assessment, ...updates } : assessment
          ),
        })),
      removeAssessment: (id) =>
        set((state) => ({
          assessments: state.assessments.filter((assessment) => assessment.id !== id),
        })),

      // Pagination Actions
      setCandidatesPagination: (pagination) =>
        set((state) => ({
          pagination: {
            ...state.pagination,
            candidates: { ...state.pagination.candidates, ...pagination },
          },
        })),

      // Persistence Actions
      loadFromStorage: async () => {
        try {
          const stored = await localforage.getItem<Partial<AppState>>("talentflow-state");
          if (stored) {
            set((state) => ({ ...state, ...stored }));
          }
        } catch (error) {
          console.error("Failed to load from storage:", error);
        }
      },

      saveToStorage: async () => {
        try {
          const state = get();
          const toSave = {
            jobs: state.jobs,
            candidates: state.candidates,
            assessments: state.assessments,
            candidateFilters: state.candidateFilters,
            pagination: state.pagination,
            sidebarCollapsed: state.sidebarCollapsed,
            currentTheme: state.currentTheme,
          };
          await localforage.setItem("talentflow-state", toSave);
        } catch (error) {
          console.error("Failed to save to storage:", error);
        }
      },
    }),
    {
      name: "talentflow-storage",
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
        currentTheme: state.currentTheme,
        candidateFilters: state.candidateFilters,
      }),
    }
  )
);
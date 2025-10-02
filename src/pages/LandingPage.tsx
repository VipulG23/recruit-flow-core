import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BriefcaseIcon, Users, FileText, Building2, CheckCircle } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-4 border-b border-border bg-card">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-primary">
            <Building2 className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">TalentFlow</h1>
        </div>
        <nav className="flex items-center gap-40">
          <Link
            to="/jobs"
            className="text-sm font-medium text-muted-foreground hover:text-primary"
          >
            Jobs
          </Link>
          <Link
            to="/candidates"
            className="text-sm font-medium text-muted-foreground hover:text-primary"
          >
            Candidates
          </Link>
          <Link
            to="/assessments"
            className="text-sm font-medium text-muted-foreground hover:text-primary"
          >
            Assessments
          </Link>
        </nav>
        <Button asChild>
          <Link to="/dashboard">Get Started</Link>
        </Button>
      </header>

      {/* Hero Section */}
      <main className="flex flex-1 flex-col items-center justify-center text-center px-6 py-20">
        <h2 className="text-4xl sm:text-5xl font-bold tracking-tight">
          Smarter Hiring with <span className="text-primary">TalentFlow</span>
        </h2>
        <p className="mt-4 text-lg text-muted-foreground max-w-xl">
          A lightweight applicant tracking system (ATS) to manage jobs,
          candidates, and assessments — all in one place.
        </p>
        <div className="mt-6 flex gap-4">
          <Button size="lg" asChild>
            <Link to="/jobs">Explore Jobs</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link to="/candidates">View Candidates</Link>
          </Button>
        </div>
      </main>

      {/* Features */}
      <section className="px-6 py-16 bg-muted/30">
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8">
          <div className="p-6 rounded-xl bg-card shadow-sm text-center">
            <BriefcaseIcon className="mx-auto h-8 w-8 text-primary mb-3" />
            <h3 className="font-semibold">Post Jobs</h3>
            <p className="text-sm text-muted-foreground mt-2">
              Quickly create and publish job postings to attract top talent.
            </p>
          </div>
          <div className="p-6 rounded-xl bg-card shadow-sm text-center">
            <Users className="mx-auto h-8 w-8 text-primary mb-3" />
            <h3 className="font-semibold">Track Applicants</h3>
            <p className="text-sm text-muted-foreground mt-2">
              Monitor candidate pipelines and manage interviews efficiently.
            </p>
          </div>
          <div className="p-6 rounded-xl bg-card shadow-sm text-center">
            <CheckCircle className="mx-auto h-8 w-8 text-primary mb-3" />
            <h3 className="font-semibold">Hire Smarter</h3>
            <p className="text-sm text-muted-foreground mt-2">
              Make data-driven hiring decisions with performance insights.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto px-6 py-4 border-t border-border text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} TalentFlow. Built for the React Technical
        Assignment.
      </footer>
    </div>
  );
}

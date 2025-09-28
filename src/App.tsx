import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import Jobs from "./pages/Jobs";
import Candidates from "./pages/Candidates";
import Assessments from "./pages/Assessments";
import NotFound from "./pages/NotFound";
import { createMockServer } from "@/api/server";
import { useStore } from "@/store/useStore";

const queryClient = new QueryClient();

// Initialize MirageJS server
if (process.env.NODE_ENV === "development") {
  createMockServer();
}

const App = () => {
  const { loadFromStorage, currentTheme } = useStore();

  useEffect(() => {
    // Load persisted state from storage
    loadFromStorage();
    
    // Apply theme
    document.documentElement.classList.toggle("dark", currentTheme === "dark");
  }, [loadFromStorage, currentTheme]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<AppLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="jobs" element={<Jobs />} />
              <Route path="candidates" element={<Candidates />} />
              <Route path="assessments" element={<Assessments />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;

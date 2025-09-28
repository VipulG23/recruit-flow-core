import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { useStore } from "@/store/useStore";
import { cn } from "@/lib/utils";

export const AppLayout = () => {
  const { sidebarCollapsed } = useStore();

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      
      <div className={cn(
        "flex-1 flex flex-col overflow-hidden transition-all duration-300",
        sidebarCollapsed ? "ml-16" : "ml-64"
      )}>
        <Header />
        
        <main className="flex-1 overflow-auto bg-muted/30">
          <div className="container mx-auto p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
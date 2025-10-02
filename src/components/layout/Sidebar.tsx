import { NavLink } from "react-router-dom";
import {
  Users,
  BriefcaseIcon,
  FileText,
  ChevronLeft,
  ChevronRight,
  Building2,
  LayoutDashboard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStore } from "@/store/useStore";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const navigation = [
  {
    name: "About Us",
    href: "/",
    icon: Building2,
    description: "Learn more about our platform",
  },
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    description: "Overview of stats and activity",
  },
  {
    name: "Jobs",
    href: "/jobs",
    icon: BriefcaseIcon,
    description: "Manage job postings",
  },
  {
    name: "Candidates",
    href: "/candidates",
    icon: Users,
    description: "View candidate pipeline",
  },
  {
    name: "Assessments",
    href: "/assessments",
    icon: FileText,
    description: "Create and manage assessments",
  },
];

export const Sidebar = () => {
  const { sidebarCollapsed, setSidebarCollapsed } = useStore();

  const NavItem = ({ item }: { item: (typeof navigation)[0] }) => {
    const content = (
      <NavLink
        to={item.href}
        className={({ isActive }) =>
          cn(
            "flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all",
            "hover:bg-primary/10 hover:text-primary",
            isActive
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground",
            sidebarCollapsed && "justify-center px-2"
          )
        }
      >
        <item.icon className="h-5 w-5 flex-shrink-0" />
        {!sidebarCollapsed && <span>{item.name}</span>}
      </NavLink>
    );

    if (sidebarCollapsed) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>{content}</TooltipTrigger>
          <TooltipContent side="right" className="flex flex-col">
            <span className="font-medium">{item.name}</span>
            <span className="text-xs text-muted-foreground">
              {item.description}
            </span>
          </TooltipContent>
        </Tooltip>
      );
    }

    return content;
  };

  return (
    <div
      className={cn(
        "fixed left-0 top-0 z-40 h-full bg-card border-r border-border transition-all duration-300",
        sidebarCollapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center border-b border-border px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            {!sidebarCollapsed && (
              <div className="flex flex-col">
                <h1 className="text-lg font-bold tracking-tight">TalentFlow</h1>
                <p className="text-xs text-muted-foreground">ATS Platform</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-4">
          {navigation.map((item) => (
            <NavItem key={item.name} item={item} />
          ))}
        </nav>

        {/* Collapse Toggle */}
        <div className="border-t border-border p-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className={cn(
              "w-full justify-start gap-2",
              sidebarCollapsed && "justify-center px-2"
            )}
          >
            {sidebarCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <>
                <ChevronLeft className="h-4 w-4" />
                <span>Collapse</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

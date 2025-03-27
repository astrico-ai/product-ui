import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Home, MessageSquare, Users, FileText, Settings } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

const menuItems = [
  { icon: Home, label: "Home", path: "/" },
  { icon: MessageSquare, label: "Chat", path: "/chat" },
  { icon: Users, label: "Sources", path: "/sources" },
  { icon: FileText, label: "Training", path: "/training" },
  { icon: Settings, label: "Dashboard", path: "/dashboard" },
];

export function Sidebar({ isCollapsed, setIsCollapsed }: SidebarProps) {
  const location = useLocation();

  return (
    <div
      className={cn(
        "fixed left-0 top-0 h-screen bg-blue-50/40 dark:bg-blue-950/20 border-r border-r-blue-100 dark:border-r-blue-900/30 transition-all duration-300 ease-in-out z-50",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      <div className="flex h-20 items-center justify-between px-5 border-b border-b-blue-100 dark:border-b-blue-900/30 bg-background">
        {!isCollapsed && (
          <span className="text-2xl font-bold">
            Astrico <span className="text-primary">AI</span>
          </span>
        )}
        <Button
          variant="ghost"
          size="icon"
          className={cn("h-8 w-8", isCollapsed && "ml-auto mr-auto")}
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? (
            <ChevronRight className="h-6 w-6" />
          ) : (
            <ChevronLeft className="h-6 w-6" />
          )}
        </Button>
      </div>
      <nav className="space-y-2 p-4">
        {menuItems.map(({ icon: Icon, label, path }) => (
          <Link key={path} to={path}>
            <Button
              variant="ghost"
              className={cn(
                "w-full py-6 transition-all duration-200",
                isCollapsed ? "justify-center" : "justify-start gap-4",
                location.pathname === path 
                  ? "bg-primary/15 text-primary hover:bg-primary/20 dark:bg-primary/20 dark:hover:bg-primary/25" 
                  : "hover:bg-blue-100/50 dark:hover:bg-blue-900/20 text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className={cn(
                "h-6 w-6 transition-colors",
                location.pathname === path 
                  ? "text-primary" 
                  : "text-muted-foreground group-hover:text-foreground"
              )} />
              {!isCollapsed && (
                <span className={cn(
                  "text-base transition-colors",
                  location.pathname === path && "text-primary font-medium"
                )}>
                  {label}
                </span>
              )}
            </Button>
          </Link>
        ))}
      </nav>
    </div>
  );
}

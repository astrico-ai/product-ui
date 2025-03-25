import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Sidebar } from "./Sidebar";
import { Bell, MessageSquare, Settings, HelpCircle } from "lucide-react";
import { Button } from "./ui/button";
import { Link } from "react-router-dom";

interface MainLayoutProps {
  children: React.ReactNode;
  userName?: string;
  greeting?: string;
  autoCollapse?: boolean;
}

export function MainLayout({ 
  children, 
  userName = "User", 
  greeting = "Welcome", 
  autoCollapse = false 
}: MainLayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    if (autoCollapse) {
      setIsCollapsed(true);
    }
  }, [autoCollapse]);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <main className={cn(
        "transition-all duration-300 ease-in-out",
        isCollapsed ? "pl-16" : "pl-60"
      )}>
        <div className="flex items-center justify-between h-16 px-4 border-b">
          <h1 className="text-xl font-semibold">
            {greeting}, {userName}
          </h1>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="text-muted-foreground">
              <Bell className="h-5 w-5" />
            </Button>
            <Link to="/chat">
              <Button variant="ghost" size="icon" className="text-muted-foreground">
                <MessageSquare className="h-5 w-5" />
              </Button>
            </Link>
            <Button variant="ghost" size="icon" className="text-muted-foreground">
              <Settings className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-muted-foreground">
              <HelpCircle className="h-5 w-5" />
            </Button>
          </div>
        </div>
        {children}
      </main>
    </div>
  );
}

import { Home, GraduationCap, LayoutDashboard, Database, ChevronLeft, ChevronRight } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

const navigation = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Training', href: '/training', icon: GraduationCap },
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Sources', href: '/sources', icon: Database },
];

export function Sidebar({ isCollapsed, setIsCollapsed }: SidebarProps) {
  const location = useLocation();

  return (
    <div className={cn(
      "fixed inset-y-0 left-0 z-50 flex flex-col border-r bg-background transition-all duration-300",
      isCollapsed ? "w-16" : "w-60"
    )}>
      <div className="flex h-16 items-center justify-between px-4 border-b">
        <div className={cn(
          "flex items-center gap-2 transition-opacity duration-200",
          isCollapsed && "opacity-0 pointer-events-none"
        )}>
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold">S</span>
          </div>
          <span className="font-semibold">SleekSearch</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="h-8 w-8"
        >
          {isCollapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <ChevronLeft className="h-5 w-5" />
          )}
        </Button>
      </div>

      <nav className="flex-1 p-2">
        <TooltipProvider delayDuration={0}>
          <div className="space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Tooltip key={item.name}>
                  <TooltipTrigger asChild>
                    <Link
                      to={item.href}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 transition-colors text-[15px]",
                        isActive 
                          ? "bg-[#3551f31a] text-[#3551f3]" 
                          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                        !isCollapsed && "justify-start",
                        isCollapsed && "justify-center"
                      )}
                    >
                      <item.icon className={cn(
                        "h-5 w-5",
                        isActive && "text-[#3551f3]"
                      )} />
                      {!isCollapsed && <span>{item.name}</span>}
                    </Link>
                  </TooltipTrigger>
                  {isCollapsed && (
                    <TooltipContent side="right">
                      <p className={cn(
                        "text-[15px]",
                        isActive && "text-[#3551f3]"
                      )}>{item.name}</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              );
            })}
          </div>
        </TooltipProvider>
      </nav>
    </div>
  );
}

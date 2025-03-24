
import { Bell, MessageSquare, Search, HelpCircle, Settings } from "lucide-react";

interface HeaderProps {
  userName: string;
  greeting?: string;
}

export function Header({ userName, greeting = "Good evening" }: HeaderProps) {
  return (
    <header className="h-16 border-b bg-background/95 backdrop-blur-sm sticky top-0 z-20 w-full animate-fade-in">
      <div className="flex h-full items-center justify-between px-4 md:px-6">
        <div>
          <h1 className="text-xl font-semibold">{greeting}, {userName}</h1>
        </div>
        <div className="flex items-center gap-4">
          <button className="rounded-full p-2 hover:bg-secondary transition-colors relative">
            <Bell className="h-5 w-5 text-muted-foreground" />
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500"></span>
          </button>
          <button className="rounded-full p-2 hover:bg-secondary transition-colors">
            <MessageSquare className="h-5 w-5 text-muted-foreground" />
          </button>
          <button className="rounded-full p-2 hover:bg-secondary transition-colors">
            <HelpCircle className="h-5 w-5 text-muted-foreground" />
          </button>
          <button className="rounded-full p-2 hover:bg-secondary transition-colors">
            <Settings className="h-5 w-5 text-muted-foreground" />
          </button>
          <div className="h-9 w-9 rounded-full bg-navy-200 flex items-center justify-center">
            <span className="text-navy-700 font-medium">VP</span>
          </div>
        </div>
      </div>
    </header>
  );
}

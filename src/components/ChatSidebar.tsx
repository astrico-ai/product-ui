
import { PlusCircle, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatSession } from "@/pages/ChatPage";
import { cn } from "@/lib/utils";

interface ChatSidebarProps {
  sessions: ChatSession[];
  currentSessionId: string;
  onSessionClick: (sessionId: string) => void;
  onNewChat: () => void;
}

export function ChatSidebar({
  sessions,
  currentSessionId,
  onSessionClick,
  onNewChat
}: ChatSidebarProps) {
  // Format date to relative time (e.g., "2 days ago")
  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    
    if (diffInDays > 6) {
      return date.toLocaleDateString();
    } else if (diffInDays > 0) {
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    } else if (diffInHours > 0) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else if (diffInMinutes > 0) {
      return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  };

  // Group chats by date
  const groupedSessions = sessions.reduce((groups, session) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const sessionDate = new Date(session.lastMessage);
    
    let groupKey = '';
    
    if (sessionDate.toDateString() === today.toDateString()) {
      groupKey = 'Today';
    } else if (sessionDate.toDateString() === yesterday.toDateString()) {
      groupKey = 'Yesterday';
    } else {
      const daysAgo = Math.floor((today.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24));
      if (daysAgo < 7) {
        groupKey = 'Previous 7 days';
      } else {
        groupKey = 'Older';
      }
    }
    
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    
    groups[groupKey].push(session);
    return groups;
  }, {} as Record<string, ChatSession[]>);

  return (
    <div className="w-72 flex-shrink-0 border-r border-border bg-secondary/30 flex flex-col h-full">
      <div className="p-4">
        <Button 
          variant="outline" 
          className="w-full justify-start gap-2 bg-white hover:bg-secondary"
          onClick={onNewChat}
        >
          <PlusCircle size={18} />
          New Chat
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="px-2 pb-4">
          {Object.entries(groupedSessions).map(([groupName, groupSessions]) => (
            <div key={groupName} className="mb-4">
              <h3 className="text-sm font-medium text-muted-foreground px-3 mb-2">
                {groupName}
              </h3>
              <div className="space-y-1">
                {groupSessions.map((session) => (
                  <button
                    key={session.id}
                    className={cn(
                      "w-full text-left px-3 py-2 rounded-lg flex items-start gap-2 hover:bg-secondary",
                      currentSessionId === session.id ? "bg-secondary" : "bg-transparent"
                    )}
                    onClick={() => onSessionClick(session.id)}
                  >
                    <MessageSquare 
                      size={16} 
                      className={cn(
                        "mt-0.5 flex-shrink-0",
                        currentSessionId === session.id ? "text-primary" : "text-muted-foreground"
                      )} 
                    />
                    <div className="flex-1 overflow-hidden">
                      <div className="font-medium truncate">
                        {session.title}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatRelativeTime(session.lastMessage)}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

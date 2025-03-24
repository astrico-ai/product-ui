
import { Bell, ChevronRight } from "lucide-react";

interface AnnouncementProps {
  title: string;
  description: string;
  isHighlighted?: boolean;
}

const Announcement = ({ title, description, isHighlighted }: AnnouncementProps) => {
  return (
    <div className={`p-4 rounded-lg transition-all ${isHighlighted ? 'bg-primary/5 border border-primary/10' : 'hover:bg-secondary/80'}`}>
      <h4 className="font-medium flex items-center gap-2 text-navy-800">
        {isHighlighted && <span className="text-red-500">🔔</span>}
        {title}
      </h4>
      <p className="text-muted-foreground text-sm mt-1">{description}</p>
    </div>
  );
};

export function AnnouncementCard() {
  return (
    <div className="rounded-xl border bg-card shadow-subtle overflow-hidden animate-fade-in">
      <div className="p-5 border-b flex items-center justify-between">
        <h3 className="text-lg font-semibold">Announcements</h3>
        <button className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
          <span>View All</span>
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
      <div className="p-4 space-y-4">
        <Announcement 
          title="New Spinny leads assigned! Please check"
          description="Exciting news! New vehicle loan leads have been assigned to you."
          isHighlighted
        />
        <Announcement 
          title="Quarterly targets updated"
          description="Your quarterly targets have been updated in the dashboard."
        />
        <Announcement 
          title="New training session: Customer Engagement"
          description="Join us for a new training session on effective customer engagement techniques."
        />
      </div>
    </div>
  );
}

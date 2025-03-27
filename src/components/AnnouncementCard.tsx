import { Bell, ArrowRight } from "lucide-react";

interface AnnouncementItemProps {
  title: string;
  date: string;
  isNew?: boolean;
}

const AnnouncementItem = ({ title, date, isNew }: AnnouncementItemProps) => (
  <div className="flex items-center justify-between py-2">
    <div className="flex items-center gap-2">
      <span className="font-medium">{title}</span>
      {isNew && (
        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
          New
        </span>
      )}
    </div>
    <span className="text-sm text-muted-foreground">{date}</span>
  </div>
);

export function AnnouncementCard() {
  const announcements = [
    {
      title: "New Product Launch Meeting",
      date: "Today, 2:00 PM",
      isNew: true,
    },
    {
      title: "Q1 Performance Review",
      date: "Tomorrow, 10:00 AM",
      isNew: true,
    },
    {
      title: "Team Building Event",
      date: "Mar 28, 2024",
    },
  ];

  return (
    <div className="rounded-xl border bg-card shadow-subtle p-4 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="bg-primary/10 p-2 rounded-full">
            <Bell className="h-5 w-5 text-primary" />
          </div>
          <h3 className="font-semibold">Recent Announcements</h3>
        </div>
        <button className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
          <span>View All</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
      <div className="space-y-2 divide-y">
        {announcements.map((announcement) => (
          <AnnouncementItem key={announcement.title} {...announcement} />
        ))}
      </div>
    </div>
  );
}

import { Play, Download, Users } from "lucide-react";

interface VideoCardProps {
  title: string;
  description: string;
  thumbnailUrl: string;
}

export function VideoCard({ title, description, thumbnailUrl }: VideoCardProps) {
  return (
    <div className="rounded-xl border bg-card shadow-subtle overflow-hidden animate-fade-in">
      <div className="relative aspect-video w-full bg-slate-100">
        <img
          src={thumbnailUrl || "https://images.unsplash.com/photo-1551836022-d5d88e9218df?q=80&w=2070"}
          alt={title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <button className="rounded-full bg-primary/90 backdrop-blur-sm p-3 text-white hover:bg-primary transition-colors">
            <Play className="h-6 w-6 fill-current" />
          </button>
        </div>
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-muted-foreground mt-1">{description}</p>
        <div className="mt-4 flex items-center justify-between">
          <span className="text-sm text-primary font-medium flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>@Team</span>
          </span>
          <button className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
            <span>Connect</span>
          </button>
        </div>
      </div>
    </div>
  );
}

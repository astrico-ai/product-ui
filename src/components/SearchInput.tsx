
import { useState } from "react";
import { Search, Paperclip, Send } from "lucide-react";

export function SearchInput() {
  const [query, setQuery] = useState("");

  return (
    <div className="rounded-xl border bg-card shadow-subtle p-4 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="bg-primary/10 p-2 rounded-full">
          <Search className="h-5 w-5 text-primary flex-shrink-0" />
        </div>
        <input
          type="text"
          placeholder="Search for information, documents, people, and more..."
          className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground outline-none text-lg"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button className="rounded-full p-1.5 hover:bg-secondary transition-colors">
          <Paperclip className="h-5 w-5 text-muted-foreground" />
        </button>
        <button 
          className="rounded-full bg-primary p-2.5 text-primary-foreground hover:bg-primary/90 transition-colors"
          disabled={!query.trim()}
        >
          <Send className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}

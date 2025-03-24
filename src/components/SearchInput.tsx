
import { useState } from "react";
import { Search, Paperclip, Send } from "lucide-react";

export function SearchInput() {
  const [query, setQuery] = useState("");

  return (
    <div className="rounded-xl border bg-card shadow-subtle p-3 animate-fade-in">
      <div className="flex items-center gap-3">
        <Search className="h-5 w-5 text-muted-foreground flex-shrink-0" />
        <input
          type="text"
          placeholder="Your service assistant is here. What can I help you find?"
          className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground outline-none"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button className="rounded-full p-1.5 hover:bg-secondary transition-colors">
          <Paperclip className="h-4 w-4 text-muted-foreground" />
        </button>
        <button 
          className="rounded-full bg-primary p-2 text-primary-foreground hover:bg-primary/90 transition-colors"
          disabled={!query.trim()}
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

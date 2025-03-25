import { useState, useEffect } from "react";
import { Search, Paperclip, Send } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface SearchInputProps {
  onSearch?: (query: string) => void;
  autoFocus?: boolean;
}

export function SearchInput({ onSearch, autoFocus }: SearchInputProps) {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    if (onSearch) {
      onSearch(query.trim());
    } else {
      // Default behavior - navigate to chat page
      navigate("/chat", { 
        state: { 
          initialQuery: query.trim(),
          fromSearch: true 
        } 
      });
    }
    setQuery("");
  };

  useEffect(() => {
    if (autoFocus) {
      const timer = setTimeout(() => {
        const input = document.querySelector<HTMLInputElement>('input[type="text"]');
        if (input) {
          input.focus();
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [autoFocus]);

  return (
    <div className="rounded-xl border bg-card shadow-sm p-4 animate-fade-in">
      <form onSubmit={handleSubmit} className="flex items-center gap-3">
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
        <button 
          type="button" 
          className="rounded-full p-1.5 hover:bg-secondary transition-colors"
        >
          <Paperclip className="h-5 w-5 text-muted-foreground" />
        </button>
        <button 
          type="submit"
          className="rounded-full bg-primary p-2.5 text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
          disabled={!query.trim()}
        >
          <Send className="h-5 w-5" />
        </button>
      </form>
    </div>
  );
}

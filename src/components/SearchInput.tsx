import { useState, useEffect, useRef } from "react";
import { Search, Paperclip, Send, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PaperclipIcon, SearchIcon } from "lucide-react";

interface SearchInputProps {
  onSearch?: (query: string) => void;
  autoFocus?: boolean;
}

export function SearchInput({ onSearch, autoFocus = false }: SearchInputProps) {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    setIsLoading(true);
    try {
      if (onSearch) {
        await onSearch(query.trim());
      } else {
        // Default behavior - navigate to chat page
        await navigate("/chat", { 
          state: { 
            initialQuery: query.trim(),
            fromSearch: true 
          } 
        });
      }
      setQuery("");
    } catch (error) {
      console.error('Error submitting query:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (autoFocus) {
      try {
        inputRef.current?.focus();
      } catch (error) {
        console.error('Error focusing input:', error);
      }
    }
  }, [autoFocus]);

  return (
    <div className="rounded-xl border bg-card shadow-sm p-4 animate-fade-in">
      <form onSubmit={handleSubmit} className="flex items-center gap-3">
        <div className="bg-primary/10 p-2 rounded-full">
          <Search className="h-5 w-5 text-primary flex-shrink-0" />
        </div>
        <Input
          ref={inputRef}
          type="text"
          placeholder="Search for information, documents, people, and more..."
          className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground outline-none text-lg pr-24"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search input"
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          aria-label="Attach file"
        >
          <PaperclipIcon className="h-4 w-4" />
        </Button>
        <Button
          type="submit"
          size="icon"
          className="h-8 w-8"
          disabled={!query.trim() || isLoading}
          aria-label="Submit search"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-5 w-5" />
          )}
        </Button>
      </form>
    </div>
  );
}

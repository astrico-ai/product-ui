import { useState } from "react";
import { Search, Paperclip, Send } from "lucide-react";
import { Input } from "@/components/ui/input";

export function SearchInput({ onSearch }) {
  const [query, setQuery] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim() && onSearch) {
      onSearch(query);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && query.trim()) {
      handleSearch(e);
    }
  };

  return (
    <div className="relative">
      <div className="relative flex items-center bg-white rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <Input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search for information, documents, people, and more..."
          className="w-full pl-12 pr-28 h-[52px] text-base bg-transparent border-0 rounded-full focus:ring-0 focus:border-0 placeholder:text-gray-500"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          <button 
            type="button"
            className={`p-2 rounded-full transition-all ${
              query 
                ? 'text-gray-500 hover:bg-gray-50' 
                : 'text-gray-300 cursor-not-allowed'
            }`}
            disabled={!query}
          >
            <Paperclip className="w-5 h-5" />
          </button>
          <button 
            type="button"
            onClick={handleSearch}
            className={`p-2 rounded-full bg-gray-100 transition-all ${
              query 
                ? 'text-gray-700 hover:bg-gray-200' 
                : 'text-gray-400 cursor-not-allowed'
            }`}
            disabled={!query}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
} 
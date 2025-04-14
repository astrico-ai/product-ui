import { useState, useRef } from "react";
import { Search, Paperclip, Send, X } from "lucide-react";
import { Input } from "@/components/ui/input";

export function SearchInput({ onSearch }) {
  const [query, setQuery] = useState("");
  const [attachments, setAttachments] = useState([]);
  const fileInputRef = useRef(null);
  const [isFocused, setIsFocused] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if ((query.trim() || attachments.length > 0) && onSearch) {
      onSearch(query, attachments);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && (query.trim() || attachments.length > 0)) {
      handleSearch(e);
    }
  };

  const handleAttachmentClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      const newAttachments = files.map(file => ({
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        size: file.size,
        type: file.type,
        file: file
      }));
      setAttachments(prev => [...prev, ...newAttachments]);
    }
    // Reset the file input
    e.target.value = null;
  };

  const removeAttachment = (id) => {
    setAttachments(prev => prev.filter(file => file.id !== id));
  };

  return (
    <div className="relative w-full">
      <div className={`relative flex items-center bg-white rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.08)] w-full ${isFocused ? 'ring-1 ring-[#3551F3]/20' : ''}`}>
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        
        <div className="flex-1 flex items-center pl-12 h-[52px] overflow-x-auto hide-scrollbar">
          <div className="flex items-center gap-2 flex-shrink-0">
            {attachments.map(file => (
              <div key={file.id} className="flex items-center bg-blue-50 rounded-full px-3 py-1 text-xs text-blue-700">
                <span className="max-w-[150px] truncate">{file.name}</span>
                <button 
                  type="button" 
                  onClick={() => removeAttachment(file.id)}
                  className="ml-1.5 hover:text-blue-900"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
          
          <Input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Search for information, documents, people, and more..."
            className="border-0 focus:ring-0 outline-none focus:outline-none placeholder:text-gray-500 bg-transparent h-full w-full flex-grow pr-28"
            style={{ boxShadow: 'none' }}
          />
        </div>
        
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            multiple
          />
          <button 
            type="button"
            onClick={handleAttachmentClick}
            className="p-2 rounded-full text-gray-500 hover:bg-gray-50 transition-all"
          >
            <Paperclip className="w-5 h-5" />
          </button>
          <button 
            type="button"
            onClick={handleSearch}
            className="p-2 rounded-full bg-[#3551F3] text-white hover:bg-[#2B41D9] transition-all"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>

      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
} 
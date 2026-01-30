import { useState } from "react"
import { Command, ArrowRight, Loader2, RefreshCw, Crown, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

interface SearchBarProps {
  onSearch?: (query: string) => void
}

const suggestions = [
  {
    text: "What are the most recurring customer issues?",
    icon: RefreshCw,
    highlight: "recurring",
    color: "text-slate-600 bg-slate-50 border-slate-200",
  },
  {
    text: "Which high-value customers have the most complaints?",
    icon: Crown,
    highlight: "high-value",
    color: "text-slate-600 bg-slate-50 border-slate-200",
  },
]

export function SearchBar({ onSearch }: SearchBarProps) {
  const [query, setQuery] = useState("")
  const [isFocused, setIsFocused] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return

    setIsLoading(true)
    onSearch?.(query)

    // Simulate search
    setTimeout(() => {
      setIsLoading(false)
    }, 1000)
  }

  const highlightText = (text: string, highlight: string) => {
    const parts = text.split(new RegExp(`(${highlight})`, "gi"))
    return parts.map((part, i) =>
      part.toLowerCase() === highlight.toLowerCase() ? (
        <span key={i} className="font-semibold">{part}</span>
      ) : (
        part
      )
    )
  }

  return (
    <div className="w-full max-w-3xl mx-auto">
      <form onSubmit={handleSubmit}>
        <div
          className={cn(
            "relative flex items-center transition-all duration-200",
            "bg-white border rounded-lg shadow-sm",
            isFocused
              ? "border-foreground/20 shadow-md ring-4 ring-foreground/5"
              : "border-border hover:border-foreground/10 hover:shadow"
          )}
        >
          <div className="flex items-center justify-center pl-3 pr-1 h-12">
            {isLoading ? (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-violet-100 text-violet-600">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span className="text-xs font-semibold tracking-tight">Asking...</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-gradient-to-r from-violet-500 to-indigo-500 text-white shadow-sm">
                <Sparkles className="h-3.5 w-3.5" />
                <span className="text-xs font-semibold tracking-tight">Ask Astrico</span>
              </div>
            )}
          </div>

          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Ask a question about your customers..."
            className="flex-1 h-12 bg-transparent text-[15px] text-foreground placeholder:text-muted-foreground focus:outline-none"
          />

          <div className="flex items-center gap-2 pr-2">
            <kbd className="hidden sm:inline-flex h-6 items-center gap-1 rounded border bg-muted px-2 text-[11px] font-medium text-muted-foreground">
              <Command className="h-3 w-3" />K
            </kbd>
            <button
              type="submit"
              disabled={!query.trim() || isLoading}
              className={cn(
                "flex items-center justify-center h-8 w-8 rounded-md transition-all",
                query.trim()
                  ? "bg-foreground text-background hover:bg-foreground/90"
                  : "bg-muted text-muted-foreground cursor-not-allowed"
              )}
            >
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </form>

      {/* Quick suggestions */}
      <div className="flex items-center justify-center gap-2 mt-5">
        <span className="text-xs text-muted-foreground mr-1">Try asking:</span>
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => setQuery(suggestion.text)}
            className={cn(
              "inline-flex items-center gap-1.5 text-[13px] px-3 py-1.5 rounded-full border transition-all duration-200",
              "hover:shadow-sm hover:-translate-y-0.5",
              suggestion.color
            )}
          >
            <suggestion.icon className="h-3.5 w-3.5" />
            <span>{highlightText(suggestion.text, suggestion.highlight)}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

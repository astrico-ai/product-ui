
import { useState, useRef, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Paperclip, RefreshCcw, File, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChatMessage } from "@/pages/ChatPage";
import { cn } from "@/lib/utils";

interface ChatInterfaceProps {
  messages: ChatMessage[];
  isLoading: boolean;
  loadingSteps: string[];
  currentStep: number;
  onSendMessage: (message: string) => void;
}

export function ChatInterface({
  messages,
  isLoading,
  loadingSteps,
  currentStep,
  onSendMessage
}: ChatInterfaceProps) {
  const [inputValue, setInputValue] = useState("");
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current;
      scrollContainer.scrollTop = scrollContainer.scrollHeight;
    }
  }, [messages, currentStep]);

  // Focus input when component mounts
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isLoading) {
      onSendMessage(inputValue);
      setInputValue("");
    }
  };

  // Format message content with line breaks
  const formatMessageContent = (content: string) => {
    return content.split('\n').map((line, i) => (
      <p key={i} className={line.trim() === "" ? "h-4" : ""}>
        {line}
      </p>
    ));
  };

  return (
    <div className="flex flex-col h-full">
      <div 
        ref={scrollAreaRef}
        className="flex-1 overflow-y-auto"
      >
        <div className="p-4 space-y-6 max-w-4xl mx-auto">
          {messages.map((message) => (
            <div 
              key={message.id} 
              className={cn(
                "flex flex-col",
                message.type === "user" ? "items-end" : "items-start"
              )}
            >
              <div 
                className={cn(
                  "max-w-3xl rounded-xl p-4",
                  message.type === "user" 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-secondary border border-border"
                )}
              >
                <div className="prose prose-sm">
                  {formatMessageContent(message.content)}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="max-w-3xl rounded-xl p-4 bg-secondary border border-border">
              <div className="mb-3">
                <div className="flex items-center gap-3 mb-4">
                  <div className="text-sm font-medium">Using:</div>
                  <div className="flex gap-2">
                    <div className="inline-flex items-center gap-1.5 bg-slate-200 px-2 py-1 rounded text-xs">
                      <File size={14} />
                      SOP Documents
                    </div>
                    <div className="inline-flex items-center gap-1.5 bg-slate-200 px-2 py-1 rounded text-xs">
                      <Video size={14} />
                      RBL Video Files
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  {loadingSteps.map((step, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="text-sm">
                        {index + 1}. {step}
                      </div>
                      {index <= currentStep && (
                        <div className="relative h-1.5 w-1.5 rounded-full bg-primary">
                          <div className="absolute inset-0 rounded-full bg-primary animate-ping opacity-75"></div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="border-t p-4">
        <form 
          onSubmit={handleSubmit} 
          className="flex gap-2 items-center max-w-4xl mx-auto"
        >
          <Button 
            type="button" 
            variant="ghost" 
            size="icon" 
            className="rounded-full"
            onClick={() => onSendMessage("New conversation")}
            title="New conversation"
          >
            <RefreshCcw size={18} />
          </Button>
          <Button 
            type="button" 
            variant="ghost" 
            size="icon" 
            className="rounded-full"
          >
            <Paperclip size={18} />
          </Button>
          <input
            ref={inputRef}
            type="text"
            placeholder="Type your question..."
            className="flex-1 border rounded-xl px-4 py-2 bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isLoading}
          />
          <Button 
            type="submit" 
            variant="default" 
            size="icon" 
            className="rounded-full aspect-square w-10 h-10"
            disabled={!inputValue.trim() || isLoading}
          >
            <Send size={18} />
          </Button>
        </form>
      </div>
    </div>
  );
}

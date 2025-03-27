import { useState, useEffect } from "react";
import { Plus, Send, Trash2, MessageSquare, ThumbsUp, ThumbsDown, Copy, Share2, Paperclip, ChevronRight, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useLocation } from "react-router-dom";
import { SearchInput } from "@/components/SearchInput";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { MainLayout } from "@/components/MainLayout";
import { LoadingSteps } from "@/components/LoadingSteps";
import { DataVisualization } from "@/components/DataVisualization";
import { TypewriterText } from "@/components/TypewriterText";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  feedback?: "up" | "down";
}

interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
}

// Add new interface for grouped sessions
interface GroupedSessions {
  today: ChatSession[];
  yesterday: ChatSession[];
  previousWeek: ChatSession[];
  previousMonth: ChatSession[];
}

interface LocationState {
  initialQuery?: string;
  fromSearch?: boolean;
}

export default function ChatPage() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [input, setInput] = useState("");
  const [isChatSidebarCollapsed, setIsChatSidebarCollapsed] = useState(false);
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [pendingResponse, setPendingResponse] = useState<string | null>(null);
  const [showVisualization, setShowVisualization] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const savedSessions = localStorage.getItem("chatSessions");
      const dummyData: ChatSession[] = [
        {
          id: "1",
          title: "AI Trends Discussion",
          messages: [{
            role: "user",
            content: "What are the latest trends in AI?",
            timestamp: Date.now()
          }, {
            role: "assistant",
            content: "Some key AI trends include large language models, multimodal AI, and AI governance.",
            timestamp: Date.now()
          }],
          createdAt: Date.now(),
        },
        {
          id: "2",
          title: "Python Programming Help",
          messages: [{
            role: "user",
            content: "How do I use Python decorators?",
            timestamp: Date.now() - 2 * 3600000
          }],
          createdAt: Date.now() - 2 * 3600000,
        },
        {
          id: "3",
          title: "Database Query Optimization",
          messages: [{
            role: "user",
            content: "Best practices for SQL query optimization?",
            timestamp: Date.now() - 86400000
          }],
          createdAt: Date.now() - 86400000,
        },
        {
          id: "4",
          title: "React Components Discussion",
          messages: [{
            role: "user",
            content: "How to implement custom hooks?",
            timestamp: Date.now() - 90000000
          }],
          createdAt: Date.now() - 90000000,
        },
        {
          id: "5",
          title: "Cloud Architecture Planning",
          messages: [{
            role: "user",
            content: "Microservices vs Monolithic",
            timestamp: Date.now() - 4 * 86400000
          }],
          createdAt: Date.now() - 4 * 86400000,
        },
        {
          id: "6",
          title: "Machine Learning Fundamentals",
          messages: [{
            role: "user",
            content: "Explain neural networks",
            timestamp: Date.now() - 20 * 86400000
          }],
          createdAt: Date.now() - 20 * 86400000,
        },
      ];

      if (!savedSessions || JSON.parse(savedSessions).length === 0) {
        setSessions(dummyData);
        localStorage.setItem("chatSessions", JSON.stringify(dummyData));
      } else {
        setSessions(JSON.parse(savedSessions));
      }

      const state = location.state as LocationState;
      if (state?.initialQuery && state?.fromSearch) {
        createNewChat(state.initialQuery);
      }
    } catch (error) {
      console.error('Error loading sessions:', error);
      setError('Failed to load chat sessions');
      setSessions([]);
    }
  }, []);

  // Save sessions to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem("chatSessions", JSON.stringify(sessions));
    } catch (error) {
      console.error('Error saving sessions:', error);
      setError('Failed to save chat sessions');
    }
  }, [sessions]);

  const handleNewChat = () => {
    // Clear current session to show welcome screen
    setCurrentSession(null);
  };

  const createNewChat = async (query: string) => {
    setIsLoading(true);
    setPendingResponse(null);
    setShowVisualization(false);
    setError(null);
    
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: query,
      messages: [
        {
          role: "user",
          content: query,
          timestamp: Date.now()
        }
      ],
      createdAt: Date.now()
    };

    // Update sessions
    setSessions(prev => [newSession, ...prev]);
    setCurrentSession(newSession);
    
    try {
      // Simulate API call with sample response
      const response = await new Promise<string>((resolve, reject) => {
        const timeoutId = setTimeout(() => {
          resolve(`Based on the analysis of your Customer Acquisition Cost (CAC) data across different marketing channels over the past 6 months, here are the key insights:

1. LinkedIn consistently shows the highest CAC, ranging from $63-70, indicating it's the most expensive channel but might be justified for B2B targeting.
2. Facebook maintains the lowest CAC, averaging around $39, making it the most cost-effective channel.
3. YouTube and Google show moderate CAC values with slight fluctuations, suggesting stable performance.

Below is a detailed breakdown of CAC metrics across all channels:`);
        }, 2000);

        // Cleanup timeout if component unmounts
        return () => clearTimeout(timeoutId);
      });
      
      setPendingResponse(response);
      
    } catch (error) {
      console.error("Error:", error);
      setError('Failed to generate response');
      setIsLoading(false);
    }
  };

  const handleLoadingComplete = () => {
    if (pendingResponse && currentSession) {
      const newMessage: ChatMessage = {
        role: "assistant",
        content: pendingResponse,
        timestamp: Date.now(),
      };
      
      const updatedSession = {
        ...currentSession,
        messages: [...currentSession.messages, newMessage],
      };
      
      setCurrentSession(updatedSession);
      setSessions(prev =>
        prev.map(s => (s.id === updatedSession.id ? updatedSession : s))
      );
      
      localStorage.setItem("chatSessions", JSON.stringify(
        sessions.map(s => (s.id === updatedSession.id ? updatedSession : s))
      ));
      
      setIsLoading(false);
      setPendingResponse(null);
    }
  };

  const deleteSession = (sessionId: string) => {
    const updatedSessions = sessions.filter((s) => s.id !== sessionId);
    setSessions(updatedSessions);
    if (currentSession?.id === sessionId) {
      setCurrentSession(null);
    }
    localStorage.setItem("chatSessions", JSON.stringify(updatedSessions));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const chatContent = input;
    setInput("");
    
    if (currentSession) {
      setIsLoading(true);
      
      // Add user message immediately
      const userMessage: ChatMessage = {
        role: "user",
        content: chatContent,
        timestamp: Date.now(),
      };

      const updatedSession = {
        ...currentSession,
        messages: [...currentSession.messages, userMessage],
      };

      setCurrentSession(updatedSession);
      setSessions(prev => 
        prev.map(s => s.id === currentSession.id ? updatedSession : s)
      );

      // Simulate API delay with loading steps
      await new Promise(resolve => setTimeout(resolve, 4500));
      
      // Add AI response after loading
      const aiMessage: ChatMessage = {
        role: "assistant",
        content: "Here's what I found based on your query...\n\nSources: Salesforce, Freshdesk",
        timestamp: Date.now(),
      };

      const finalSession = {
        ...updatedSession,
        messages: [...updatedSession.messages, aiMessage],
      };

      setCurrentSession(finalSession);
      setSessions(prev => 
        prev.map(s => s.id === currentSession.id ? finalSession : s)
      );
      localStorage.setItem("chatSessions", JSON.stringify(
        sessions.map(s => s.id === currentSession.id ? finalSession : s)
      ));
      
      setIsLoading(false);
    } else {
      // Create new chat
      await createNewChat(chatContent);
    }
  };

  const handleFeedback = (messageIndex: number, feedback: "up" | "down") => {
    if (!currentSession) return;
    
    const updatedMessages = [...currentSession.messages];
    updatedMessages[messageIndex] = {
      ...updatedMessages[messageIndex],
      feedback,
    };

    const updatedSession = {
      ...currentSession,
            messages: updatedMessages,
    };

    setCurrentSession(updatedSession);
    setSessions(sessions.map((s) => (s.id === currentSession.id ? updatedSession : s)));
    localStorage.setItem("chatSessions", JSON.stringify(sessions.map((s) => (s.id === currentSession.id ? updatedSession : s))));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  // Function to group sessions by date
  const groupSessionsByDate = (sessions: ChatSession[]): GroupedSessions => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const yesterday = today - 86400000;
    const weekAgo = today - 7 * 86400000;
    const monthAgo = today - 30 * 86400000;

    return {
      today: sessions.filter(s => s.createdAt >= today),
      yesterday: sessions.filter(s => s.createdAt >= yesterday && s.createdAt < today),
      previousWeek: sessions.filter(s => s.createdAt >= weekAgo && s.createdAt < yesterday),
      previousMonth: sessions.filter(s => s.createdAt >= monthAgo && s.createdAt < weekAgo),
    };
  };

  const WelcomeScreen = () => (
    <div className="flex flex-col items-center justify-center h-full max-w-3xl mx-auto px-4">
      <div className="w-full space-y-8">
        <div className="space-y-2 text-center">
          <h1 className="text-5xl font-bold tracking-tight text-foreground animate-fade-in">
            Hello, Sanuj
          </h1>
          <p className="text-lg text-muted-foreground animate-fade-in-up">
            Ask me anything or search through your knowledge base
          </p>
        </div>
        <div className="w-full animate-fade-in-up [--tw-animate-delay:200ms]">
          <SearchInput 
            onSearch={(query) => {
              if (query.trim()) {
                createNewChat(query);
              }
            }}
            autoFocus
          />
        </div>
      </div>
    </div>
  );

  const chatContent = (
    <div className="flex h-[calc(100vh-5rem)] bg-background relative">
      {/* Chat History Sidebar */}
      <div className={cn(
        "border-r bg-background transition-all duration-300 ease-in-out z-30 flex flex-col h-full",
        isChatSidebarCollapsed ? "w-[70px]" : "w-[260px]"
      )}>
        <div className="flex h-14 items-center justify-between px-4 border-b">
          <div className={cn(
            "flex items-center gap-2 transition-opacity duration-200",
            isChatSidebarCollapsed && "opacity-0 pointer-events-none"
          )}>
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold">C</span>
            </div>
            <span className="font-semibold">Chats</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setIsChatSidebarCollapsed(!isChatSidebarCollapsed)}
          >
            {isChatSidebarCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>

        <div className="p-3">
          <Button
            variant="default"
            className={cn(
              "w-full bg-primary transition-all duration-200",
              isChatSidebarCollapsed ? "justify-center px-0" : "justify-start gap-2"
            )}
            onClick={handleNewChat}
          >
            <Plus className="h-4 w-4" />
            {!isChatSidebarCollapsed && "New Chat"}
          </Button>
        </div>

        <ScrollArea className="flex-1">
          <div className="space-y-4 p-2">
            {Object.entries(groupSessionsByDate(sessions)).map(([period, groupedSessions]) => (
              groupedSessions.length > 0 && (
                <div key={period} className="space-y-1">
                  {!isChatSidebarCollapsed && (
                    <h3 className="px-2 text-sm font-medium text-muted-foreground capitalize">
                      {period === "previousWeek" ? "Previous 7 Days" :
                       period === "previousMonth" ? "Previous 30 Days" :
                       period}
                    </h3>
                  )}
                  {groupedSessions.map((session) => (
                    <TooltipProvider key={session.id} delayDuration={0}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className={cn(
                            "group flex items-center rounded-lg cursor-pointer hover:bg-accent transition-colors px-2",
                            currentSession?.id === session.id && "bg-accent"
                          )}>
                            <Button
                              variant="ghost"
                              className={cn(
                                "flex-1 justify-start h-9 px-2",
                                isChatSidebarCollapsed && "justify-center"
                              )}
                              onClick={() => setCurrentSession(session)}
                            >
                              {!isChatSidebarCollapsed && (
                                <span className="truncate">{session.title}</span>
                              )}
                            </Button>
                            {!isChatSidebarCollapsed && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteSession(session.id);
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TooltipTrigger>
                        {isChatSidebarCollapsed && (
                          <TooltipContent side="right">
                            <p>{session.title}</p>
                          </TooltipContent>
                        )}
                      </Tooltip>
                    </TooltipProvider>
                  ))}
                </div>
              )
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1">
        {currentSession ? (
          <div className="flex flex-col h-full">
            <ScrollArea className="flex-1 px-4">
              <div className="max-w-4xl mx-auto py-4 space-y-6">
                {currentSession.messages.map((message, index) => (
                  <div
                    key={index}
                    className={cn(
                      "flex w-full",
                      message.role === "user" ? "justify-end" : "justify-start"
                    )}
                  >
                    <div className={cn(
                      "max-w-[85%] px-4 py-3",
                      message.role === "user" && "bg-primary/10 rounded-lg"
                    )}>
                      {message.role === "user" ? (
                        <p className="text-foreground whitespace-pre-wrap">
                          {message.content}
                        </p>
                      ) : (
                        <>
                          <TypewriterText 
                            content={message.content} 
                            speed={10}
                            onComplete={() => {
                              if (message === currentSession?.messages[currentSession.messages.length - 1]) {
                                setShowVisualization(true);
                              }
                            }}
                          />
                          {showVisualization && (
                            <>
                              {message === currentSession?.messages[currentSession.messages.length - 1] && 
                               showVisualization && <DataVisualization />}
                              
                              <div className="flex items-center gap-2 mt-4 text-muted-foreground">
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6 hover:text-primary"
                                        onClick={() => handleFeedback(index, "up")}
                                      >
                                        <ThumbsUp className="h-4 w-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Helpful</p>
                                    </TooltipContent>
                                  </Tooltip>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6 hover:text-primary"
                                        onClick={() => handleFeedback(index, "down")}
                                      >
                                        <ThumbsDown className="h-4 w-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Not helpful</p>
                                    </TooltipContent>
                                  </Tooltip>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6 hover:text-primary"
                                        onClick={() => copyToClipboard(message.content)}
                                      >
                                        <Copy className="h-4 w-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Copy to clipboard</p>
                                    </TooltipContent>
                                  </Tooltip>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6 hover:text-primary"
                                      >
                                        <Share2 className="h-4 w-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Share</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </div>
                              
                              {message === currentSession?.messages[currentSession.messages.length - 1] && (
                                <div className="flex gap-2 mt-2 flex-wrap">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="rounded-full text-sm text-[#0000ff] hover:text-[#0000ff] bg-[#0000ff17] hover:bg-[#0000ff17] border-0"
                                    onClick={() => {
                                      const query = "Can you explain the CAC trends for LinkedIn in more detail?";
                                      setInput(query);
                                      handleSubmit(new Event('submit') as any);
                                    }}
                                  >
                                    Explain LinkedIn CAC trends
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="rounded-full text-sm text-[#0000ff] hover:text-[#0000ff] bg-[#0000ff17] hover:bg-[#0000ff17] border-0"
                                    onClick={() => {
                                      const query = "What strategies would you recommend to optimize CAC across channels?";
                                      setInput(query);
                                      handleSubmit(new Event('submit') as any);
                                    }}
                                  >
                                    Recommend optimization strategies
                                  </Button>
                                </div>
                              )}
                            </>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="mt-4">
                    <LoadingSteps onComplete={handleLoadingComplete} />
                  </div>
                )}
              </div>
            </ScrollArea>

            <div className="border-t p-4">
              <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
                <div className="flex items-center gap-2 bg-background rounded-xl border shadow-sm p-2">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                    disabled={isLoading}
                  />
                  <Button type="button" variant="ghost" size="icon" className="text-muted-foreground" disabled={isLoading}>
                    <Paperclip className="h-5 w-5" />
                  </Button>
                  <Button type="submit" size="icon" disabled={!input.trim() || isLoading}>
                    <Send className="h-5 w-5" />
                  </Button>
                </div>
              </form>
            </div>
          </div>
        ) : (
          <WelcomeScreen />
        )}
      </div>
    </div>
  );

  return (
    <MainLayout userName="Sanuj" greeting="Good evening" autoCollapse={true}>
      {chatContent}
    </MainLayout>
  );
} 
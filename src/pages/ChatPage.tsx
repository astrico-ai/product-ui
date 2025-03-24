
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/MainLayout";
import { ChatSidebar } from "@/components/ChatSidebar";
import { ChatInterface } from "@/components/ChatInterface";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Types for chat messages
export interface ChatMessage {
  id: string;
  content: string;
  type: "user" | "assistant";
  timestamp: Date;
}

export interface ChatSession {
  id: string;
  title: string;
  lastMessage: Date;
  messages: ChatMessage[];
}

const ChatPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingSteps, setLoadingSteps] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);

  // Loading states
  const steps = [
    "Understanding your query...",
    "Scanning SOP documents for key insights...",
    "Analyzing video content for relevant context...",
    "Compiling structured recommendations...",
    "Generating response and next best actions..."
  ];

  // Function to generate a unique ID
  const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  };

  // Create a new chat session
  const createNewChat = (initialQuery?: string) => {
    const newSession: ChatSession = {
      id: generateId(),
      title: initialQuery?.substring(0, 30) || "New conversation",
      lastMessage: new Date(),
      messages: initialQuery ? [
        {
          id: generateId(),
          content: initialQuery,
          type: "user",
          timestamp: new Date()
        }
      ] : []
    };
    
    setChatSessions(prev => [newSession, ...prev]);
    setCurrentSession(newSession);
    
    if (initialQuery) {
      simulateResponse(newSession.id, initialQuery);
    }
  };

  // Simulate fetching a response
  const simulateResponse = (sessionId: string, query: string) => {
    setIsLoading(true);
    setLoadingSteps(steps);
    setCurrentStep(0);
    
    // Simulate the steps with increasing delays
    const intervalTime = 800;
    const stepInterval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev >= steps.length - 1) {
          clearInterval(stepInterval);
          return prev;
        }
        return prev + 1;
      });
    }, intervalTime);
    
    // After all steps, add the response to the chat
    setTimeout(() => {
      setChatSessions(prev => {
        return prev.map(session => {
          if (session.id === sessionId) {
            const updatedMessages = [...session.messages];
            
            // Sample responses based on query content
            let responseText = "";
            if (query.toLowerCase().includes("car loan")) {
              responseText = "There are two sets of documents that you'll need to take for a new car loan for a Pvt Ltd company.\n\n" +
                "💠 General documents are:\n\n" +
                "1. Application Form\n" +
                "2. Performa Invoice\n" +
                "3. Passport size photo\n" +
                "4. KYC proof\n\n" +
                "📋 Apart from these, you'll also need:\n\n" +
                "1. Audited balance sheet for last two years\n" +
                "2. Shareholding pattern\n" +
                "3. Bank statements for the last 6 months";
            } else if (query.toLowerCase().includes("tool") || query.toLowerCase().includes("available")) {
              responseText = "We have several tools available for enterprise knowledge management:\n\n" +
                "1. Document Search - Search across all company documents\n" +
                "2. Video Indexing - Find specific moments in company videos\n" +
                "3. Knowledge Graph - See relationships between people and documents\n" +
                "4. Automated Tagging - AI-powered document organization";
            } else {
              responseText = "I've searched our knowledge base and compiled the following information based on your query.\n\n" +
                "The most relevant resources I found are:\n" +
                "1. Company handbook (Section 3.2)\n" +
                "2. Recent team presentation from July 15th\n" +
                "3. Product documentation\n\n" +
                "Would you like me to provide more specific details from any of these sources?";
            }
            
            updatedMessages.push({
              id: generateId(),
              content: responseText,
              type: "assistant",
              timestamp: new Date()
            });
            
            return {
              ...session,
              messages: updatedMessages,
              lastMessage: new Date()
            };
          }
          return session;
        });
      });
      
      setIsLoading(false);
    }, steps.length * intervalTime + 1000);
  };

  // Handle sending a new message
  const handleSendMessage = (message: string) => {
    if (!message.trim()) return;
    
    if (!currentSession) {
      createNewChat(message);
      return;
    }
    
    // Add user message to current session
    setChatSessions(prev => {
      return prev.map(session => {
        if (session.id === currentSession.id) {
          const updatedMessages = [...session.messages, {
            id: generateId(),
            content: message,
            type: "user",
            timestamp: new Date()
          }];
          
          return {
            ...session,
            messages: updatedMessages,
            lastMessage: new Date()
          };
        }
        return session;
      });
    });
    
    // Simulate response
    simulateResponse(currentSession.id, message);
  };

  // Handle click on chat session
  const handleSessionClick = (sessionId: string) => {
    const session = chatSessions.find(s => s.id === sessionId);
    if (session) {
      setCurrentSession(session);
    }
  };

  // New chat button handler
  const handleNewChat = () => {
    createNewChat();
    toast({
      title: "New chat created",
      description: "Enter your query in the search box below",
    });
  };

  // Process query from the search if coming from home page
  useEffect(() => {
    if (location.state?.query) {
      const query = location.state.query;
      setSearchQuery(query);
      
      // Check if we have any existing sessions
      if (chatSessions.length === 0) {
        createNewChat(query);
      } else {
        handleSendMessage(query);
      }
      
      // Clear the location state to prevent reprocessing on navigation
      navigate(location.pathname, { replace: true });
    } else if (!currentSession && chatSessions.length > 0) {
      // Set the first session as current if none is selected
      setCurrentSession(chatSessions[0]);
    }
  }, [location.state, chatSessions.length]);

  return (
    <MainLayout userName="Vraj" greeting="Good evening">
      <div className="flex h-[calc(100vh-120px)]">
        <ChatSidebar 
          sessions={chatSessions}
          currentSessionId={currentSession?.id || ""}
          onSessionClick={handleSessionClick}
          onNewChat={handleNewChat}
        />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          {currentSession ? (
            <ChatInterface 
              messages={currentSession.messages}
              isLoading={isLoading}
              loadingSteps={loadingSteps}
              currentStep={currentStep}
              onSendMessage={handleSendMessage}
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8">
              <h2 className="text-2xl font-bold text-glean-800 mb-4">Start a new conversation</h2>
              <p className="text-muted-foreground mb-8 text-center max-w-md">
                Search for information across your enterprise knowledge base by typing a query.
              </p>
              <Button onClick={handleNewChat} size="lg" className="gap-2">
                <PlusCircle className="h-5 w-5" />
                New Chat
              </Button>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default ChatPage;

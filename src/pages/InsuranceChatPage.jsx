import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Send, ChevronLeft, Plus, Link2, Send as SendIcon, FileText, Video, Search, Paperclip, ChevronDown, ChevronUp, ChevronRight, ThumbsUp, ThumbsDown, Copy, Share2, X, CheckCircle2 } from "lucide-react";
import { MainLayout } from "@/components/MainLayout";
import { TypewriterText } from "@/components/TypewriterText";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { LoadingSteps } from "@/components/LoadingSteps";
import { useLocation } from "react-router-dom";
import { InsuranceDataVisualization } from "@/components/InsuranceDataVisualization";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/components/ui/use-toast";
import ErrorBoundary from '../components/ErrorBoundary';

// Mock chat history data
const chatHistory = {
  today: [
    { id: 1, title: "Compare average policy prem..." },
    { id: 2, title: "Get me the total policies sold..." }
  ],
  yesterday: [
    { id: 3, title: "Which policy has the highest claim ratio?" },
  ],
  previousWeek: [
    { id: 4, title: "Renewal rates in Borivali branch" }
  ],
  previousMonth: [
    { id: 5, title: "Life insurance coverage options" }
  ]
};

// Mock chat messages for each chat
const mockChatMessages = {
  1: [
    { id: 1, text: "Show me the conversion rates by location", sender: 'user' },
    { 
      id: 2, 
      text: "Here's the conversion rate analysis for our Mumbai branches over the last 6 months:\n\n1. Andheri branch leads with the highest conversion rate at 22.5%\n2. Fort branch shows consistent performance at 20.0%\n3. Bandra branch maintains steady growth\n4. Borivali and Ghatkopar show potential for improvement", 
      sender: 'assistant',
      showVisualization: true
    }
  ],
  2: [
    { id: 1, text: "What are the benefits of whole life insurance?", sender: 'user' },
    { id: 2, text: "Whole life insurance offers several key benefits...", sender: 'assistant' }
  ]
};

export default function InsuranceChatPage() {
  const location = useLocation();
  const { toast } = useToast();
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [chatHistorySearch, setChatHistorySearch] = useState("");
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [showVisualization, setShowVisualization] = useState(false);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [showSteps, setShowSteps] = useState({});
  const [attachments, setAttachments] = useState([]);
  const [showToast, setShowToast] = useState(false);
  const fileInputRef = useRef(null);
  const [attachedFiles, setAttachedFiles] = useState([]);

  const loadingSteps = [
    {
      title: "Understanding your query..."
    },
    {
      title: "Scanning insurance data for key insights..."
    },
    {
      title: "Analyzing data for relevant context..."
    },
    {
      title: "Compiling structured insights..."
    },
    {
      title: "Generating response and next best actions..."
    }
  ];

  // Handle initial message from search
  useEffect(() => {
    const initialMessage = location.state?.initialMessage;
    if (initialMessage) {
      const searchMessage = {
        id: Date.now(),
        text: initialMessage,
        sender: 'user'
      };

      const newChat = {
        id: Date.now(),
        title: initialMessage.length > 30 ? `${initialMessage.slice(0, 30)}...` : initialMessage
      };

      // Set initial state
      setCurrentChat(newChat);
      setMessages([searchMessage]);

      // Clear location state immediately
      window.history.replaceState({}, document.title, window.location.pathname);

      // Process the search
      handleSearch(initialMessage);
    }
  }, []);

  const startNewChat = () => {
    setCurrentChat(null);
    setMessages([]);
    setInputValue("");
    setChatHistorySearch("");
  };

  const selectChat = (chat) => {
    setCurrentChat(chat);
    setInputValue("");
    setChatHistorySearch("");
  };

  const handleSearch = async (query) => {
    if (!query.trim()) return;
    
    setIsLoading(true);
    setLoadingProgress(0);
    setCurrentStep(0);
    setShowVisualization(false);
    setCompletedSteps([]);
    
    try {
      const progressInterval = setInterval(() => {
        setLoadingProgress(prev => Math.min(prev + 1, 100));
      }, 50);

      const stepInterval = setInterval(() => {
        setCurrentStep(prev => {
          if (prev >= loadingSteps.length - 1) {
            clearInterval(stepInterval);
            return prev;
          }
          setCompletedSteps(current => [...current, prev]);
          return prev + 1;
        });
      }, 1000);

      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Hardcoded queries and their responses
      const queries = {
        "Show me the conversion rates by location": {
          text: "Here's the conversion rate analysis for our Mumbai branches over the last 6 months:\n\n1. Andheri branch leads with the highest conversion rate at 22.5%\n2. Fort branch shows consistent performance at 20.0%\n3. Bandra branch maintains steady growth\n4. Borivali and Ghatkopar show potential for improvement",
          showVisualization: true,
          showFollowUp: true,
          showFeedback: true
        },
        "I spoke with Mr John Doe and he was interested in getting a health insurance policy with 5L coverage. He wants a family floater plan for 4 members. Please push this to @SFDC": {
          text: "I'll help you create this lead in SFDC. Before that, I need a few more details:\n\n1. Age of all family members\n2. Any pre-existing conditions\n3. Preferred payment frequency (monthly/quarterly/yearly)",
          showFollowUp: false,
          showFeedback: true
        },
        "Ages: 35, 32, 8, 4. No conditions. Yearly payment": {
          text: "Perfect. I have created a lead in the funnel **Insurance Opportunities Feb 2025** with the following details:\n\n**SDFC ID** - INS2345632\n**Status** - Open\n**Policy Type** - Family Floater Health Insurance\n**Coverage** - ₹5,00,000\n**Members** - 4\n**Payment** - Yearly\n**Primary Holder** - John Doe\n**Agent ID** - 246\n\nAccess the lead here:\n@https://rbl.salesforce.com/lightning/r/Opportunity/0065G00000XYZ123/view",
          showFollowUp: false,
          showFeedback: true
        }
      };
      
      let searchResponse;
      const matchedQuery = Object.keys(queries).find(key => query.trim() === key.trim());
      
      if (matchedQuery) {
        const response = queries[matchedQuery];
        searchResponse = {
          id: Date.now() + 1,
          text: response.text,
          sender: 'assistant',
          showVisualization: response.showVisualization,
          showFollowUp: response.showFollowUp,
          showFeedback: response.showFeedback
        };
      } else {
        searchResponse = {
          id: Date.now() + 1,
          text: `**Over the last 6 months, the Lead-to-Policy Conversion Rate across Mumbai branches has been varied.**\n\n**📈 Branch-wise 6 Month Average Conversion Rates:**\n- **Andheri:** 18.9%\n- **Bandra:** 14.6%\n- **Fort:** 16.7%\n- **Borivali:** 10.8%\n- **Ghatkopar:** 9.5%\n\n**🔎 Insights:**\n1. **Andheri** maintains the highest average conversion rate at **18.9%**, showing strong lead management.\n2. **Borivali** and **Ghatkopar** have significantly lower conversion rates (below **11%**), which highlights potential issues in lead quality, customer engagement, or sales training effectiveness.`,
          sender: 'assistant',
          showVisualization: true,
          showFollowUp: true,
          showFeedback: true
        };
      }
      
      setIsTyping(true);
      
      // Add response after a delay
      await new Promise(resolve => setTimeout(resolve, 500));
      setMessages(prev => {
        // Only add response if it's not already in the messages
        const isDuplicate = prev.some(msg => 
          msg.sender === 'assistant' && msg.text === searchResponse.text
        );
        return isDuplicate ? prev : [...prev, searchResponse];
      });
      
      setIsTyping(false);
      setShowVisualization(true);
      setCurrentStep(loadingSteps.length - 1);
      setCompletedSteps(loadingSteps.map((_, index) => index));
      
      // Clean up intervals
      clearInterval(progressInterval);
      clearInterval(stepInterval);
      
    } catch (error) {
      console.error('Error processing search:', error);
    } finally {
      setIsLoading(false);
      setLoadingProgress(100);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!inputValue.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: inputValue,
      sender: 'user'
    };

    // If no current chat, create a new one
    if (!currentChat) {
      const newChat = {
        id: Date.now(),
        title: inputValue.length > 30 ? `${inputValue.slice(0, 30)}...` : inputValue
      };
      setCurrentChat(newChat);
    }

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    
    handleSearch(userMessage.text);
  };

  const handleFileUpload = (e) => {
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

  const handleRemoveFile = (fileToRemove) => {
    setAttachedFiles(prev => prev.filter(file => file !== fileToRemove));
  };

  const filteredHistory = Object.entries(chatHistory).reduce((acc, [key, chats]) => {
    const filtered = chats.filter(chat => 
      chat.title.toLowerCase().includes(chatHistorySearch.toLowerCase())
    );
    if (filtered.length > 0) {
      acc[key] = filtered;
    }
    return acc;
  }, {});

  const handleFollowUpClick = (query) => {
    const newMessage = {
      id: Date.now(),
      text: query,
      sender: 'user'
    };

    setMessages(prev => [...prev, newMessage]);
    setInputValue("");
    setIsLoading(true);
    setLoadingProgress(0);
    setCurrentStep(0);
    setShowVisualization(false);
    setCompletedSteps([]);

    // Specific response for the Andheri conversion rate question
    if (query === "What caused the sharp increase in Andheri's conversion rate?") {
      const progressInterval = setInterval(() => {
        setLoadingProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            return 100;
          }
          return prev + 1;
        });
      }, 50);

      const stepInterval = setInterval(() => {
        setCurrentStep(prev => {
          if (prev >= loadingSteps.length - 1) {
            clearInterval(stepInterval);
            return prev;
          }
          setCompletedSteps(current => [...current, prev]);
          return prev + 1;
        });
      }, 1000);

      setTimeout(() => {
        const response = {
          id: Date.now() + 1,
          text: "The sharp increase in Andheri's conversion rate was primarily due to three factors:\n\n1. **Improved Lead Quality:** Implementation of a new lead scoring system that better identifies high-intent prospects.\n2. **Enhanced RM Training:** A specialized training program focused on need-based selling and objection handling.\n3. **Localized Marketing:** Targeted campaigns that resonated well with the local demographic, resulting in more qualified leads.",
          sender: 'assistant',
          showVisualization: true
        };

        setIsTyping(true);
        setMessages(prev => [...prev, response]);

        setTimeout(() => {
          setIsTyping(false);
          setShowVisualization(true);
          setCurrentStep(loadingSteps.length - 1);
          setCompletedSteps(loadingSteps.map((_, index) => index));
        }, 500);

        clearInterval(progressInterval);
        clearInterval(stepInterval);
        setIsLoading(false);
      }, 5000);
    }
    // Specific response for the Borivali and Ghatkopar optimization question
    else if (query === "How can we optimize conversion rates at Borivali and Ghatkopar?") {
      const progressInterval = setInterval(() => {
        setLoadingProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            return 100;
          }
          return prev + 1;
        });
      }, 50);

      const stepInterval = setInterval(() => {
        setCurrentStep(prev => {
          if (prev >= loadingSteps.length - 1) {
            clearInterval(stepInterval);
            return prev;
          }
          setCompletedSteps(current => [...current, prev]);
          return prev + 1;
        });
      }, 1000);

      setTimeout(() => {
        const response = {
          id: Date.now() + 1,
          text: `**Analysis of Lower Conversion Rates at Borivali and Ghatkopar:**\n\n**🔍 Observations:**\n- **Lead Quality:** A significant portion of leads at these branches come from low-intent digital campaigns and cold walk-ins, resulting in lower conversions.\n- **Follow-up Efficiency:** Follow-up rates by Relationship Managers (RMs) are 15–20% lower compared to other branches, leading to missed opportunities.\n- **Customer Profile:** These branches cater to a more price-sensitive customer segment, making upselling and policy closures more challenging.\n\n**✅ Recommended Actions:**\n- Improve lead filtering at the source to prioritize high-intent prospects.\n- Conduct focused RM training on objection handling and need-based selling.\n- Launch localized marketing campaigns targeted at higher-value customer segments.`,
          sender: 'assistant',
          showVisualization: true
        };

        setIsTyping(true);
        setMessages(prev => [...prev, response]);

        setTimeout(() => {
          setIsTyping(false);
          setShowVisualization(true);
          setCurrentStep(loadingSteps.length - 1);
          setCompletedSteps(loadingSteps.map((_, index) => index));
        }, 500);

        clearInterval(progressInterval);
        clearInterval(stepInterval);
        setIsLoading(false);
      }, 5000);
    }
    // Specific response for why Borivali and Ghatkopar have lower conversion rates
    else if (query === "Why are Borivali and Ghatkopar branches showing lower conversion rates compared to others?") {
      const progressInterval = setInterval(() => {
        setLoadingProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            return 100;
          }
          return prev + 1;
        });
      }, 50);

      const stepInterval = setInterval(() => {
        setCurrentStep(prev => {
          if (prev >= loadingSteps.length - 1) {
            clearInterval(stepInterval);
            return prev;
          }
          setCompletedSteps(current => [...current, prev]);
          return prev + 1;
        });
      }, 1000);

      setTimeout(() => {
        const response = {
          id: Date.now() + 1,
          text: `**Analysis of Lower Conversion Rates at Borivali and Ghatkopar:**\n\n**🔍 Observations:**\n- **Lead Quality:** A significant portion of leads at these branches come from low-intent digital campaigns and cold walk-ins, resulting in lower conversions.\n- **Follow-up Efficiency:** Follow-up rates by Relationship Managers (RMs) are 15–20% lower compared to other branches, leading to missed opportunities.\n- **Customer Profile:** These branches cater to a more price-sensitive customer segment, making upselling and policy closures more challenging.\n\n**✅ Recommended Actions:**\n- Improve lead filtering at the source to prioritize high-intent prospects.\n- Conduct focused RM training on objection handling and need-based selling.\n- Launch localized marketing campaigns targeted at higher-value customer segments.`,
          sender: 'assistant',
          showVisualization: false
        };

        setIsTyping(true);
        setMessages(prev => [...prev, response]);

        setTimeout(() => {
          setIsTyping(false);
          setShowVisualization(false);
          setCurrentStep(loadingSteps.length - 1);
          setCompletedSteps(loadingSteps.map((_, index) => index));
        }, 500);

        clearInterval(progressInterval);
        clearInterval(stepInterval);
        setIsLoading(false);
      }, 5000);
    }
    else {
      // Handle other queries with the default search behavior
      handleSearch(query);
    }
  };

  const handlePin = () => {
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  return (
    <MainLayout>
      <div className="h-[calc(100vh-4rem)] flex overflow-hidden relative">
        {/* Custom Toast */}
        <div
          className={`
            fixed top-4 right-4 z-50
            flex items-center gap-2 
            bg-white text-gray-900 
            px-4 py-3 rounded-lg shadow-lg
            transform transition-all duration-300 ease-in-out
            ${showToast ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0 pointer-events-none'}
          `}
        >
          <CheckCircle2 className="w-5 h-5 text-green-500" />
          <span className="font-medium">Chart is pinned to the dashboard</span>
        </div>

        {/* Chat Sidebar */}
        <div className="w-[280px] bg-white border-r flex flex-col">
          {/* Sidebar Header */}
          <div className="p-6 border-b">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Chats</h2>
              <p className="text-sm text-gray-500">Your conversation history</p>
            </div>
            <button 
              onClick={startNewChat}
              className="w-full bg-[#3551F3] hover:bg-[#2B41D9] text-white rounded-xl py-2.5 flex items-center justify-center gap-2 text-sm font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Chat
            </button>
          </div>

          {/* Chat History */}
          <ScrollArea className="flex-1 px-3 py-2">
            <div className="space-y-4">
              {/* Today's Chats */}
              <div className="space-y-0.5">
                <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider px-3 mb-1">Today</h3>
                {chatHistory.today.map(chat => (
                  <button
                    key={chat.id}
                    onClick={() => selectChat(chat)}
                    className={`w-full text-left py-2 px-4 text-sm transition-all rounded-xl ${
                      currentChat?.id === chat.id 
                        ? 'bg-[#EEF2FF] text-gray-900 font-medium' 
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {chat.title}
                  </button>
                ))}
              </div>

              {/* Yesterday's Chats */}
              <div className="space-y-0.5">
                <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider px-3 mb-1">Yesterday</h3>
                {chatHistory.yesterday.map(chat => (
                  <button
                    key={chat.id}
                    onClick={() => selectChat(chat)}
                    className={`w-full text-left py-2 px-4 text-sm transition-all rounded-xl ${
                      currentChat?.id === chat.id 
                        ? 'bg-[#EEF2FF] text-gray-900 font-medium' 
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {chat.title}
                  </button>
                ))}
              </div>

              {/* Previous Week */}
              <div className="space-y-0.5">
                <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider px-3 mb-1">Previous 7 Days</h3>
                {chatHistory.previousWeek.map(chat => (
                  <button
                    key={chat.id}
                    onClick={() => selectChat(chat)}
                    className={`w-full text-left py-2 px-4 text-sm transition-all rounded-xl ${
                      currentChat?.id === chat.id 
                        ? 'bg-[#EEF2FF] text-gray-900 font-medium' 
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {chat.title}
                  </button>
                ))}
              </div>

              {/* Previous Month */}
              <div className="space-y-0.5">
                <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider px-3 mb-1">Previous 30 Days</h3>
                {chatHistory.previousMonth.map(chat => (
                  <button
                    key={chat.id}
                    onClick={() => selectChat(chat)}
                    className={`w-full text-left py-2 px-4 text-sm transition-all rounded-xl ${
                      currentChat?.id === chat.id 
                        ? 'bg-[#EEF2FF] text-gray-900 font-medium' 
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {chat.title}
                  </button>
                ))}
              </div>
            </div>
          </ScrollArea>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col bg-[#FAFBFD]">
          {!currentChat ? (
            // New Chat View
            <div className="h-full flex flex-col items-center justify-center max-w-[800px] mx-auto px-6">
              <h1 className="text-4xl font-bold text-gray-900 mb-3">Hello, Vraj</h1>
              <p className="text-lg text-gray-500 mb-8 text-center">Ask me anything about insurance or search through your knowledge base</p>
              <div className="w-full">
                <div className="relative flex flex-col gap-3">
                  <div className="relative flex items-center">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <div className="w-full flex items-center gap-2 pl-12 pr-24 py-2 bg-white border border-gray-200 rounded-xl focus-within:ring-2 focus-within:ring-[#3551F3] focus-within:border-transparent transition-all">
                      {attachments.map((file) => (
                        <div
                          key={file.id}
                          className="flex items-center gap-1.5 bg-[#EEF2FF] text-[#3551F3] px-2 py-1 rounded-full text-sm"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span className="max-w-[100px] truncate">{file.name}</span>
                          <button
                            onClick={() => removeAttachment(file.id)}
                            className="hover:bg-[#3551F3] hover:text-white p-0.5 rounded-full transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                      <input
                        type="text"
                        value={chatHistorySearch}
                        onChange={(e) => setChatHistorySearch(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && chatHistorySearch.trim()) {
                            const newMessage = {
                              id: Date.now(),
                              text: chatHistorySearch.trim(),
                              sender: 'user',
                              attachments: attachments
                            };
                            const newChat = {
                              id: Date.now(),
                              title: chatHistorySearch.length > 30 ? `${chatHistorySearch.slice(0, 30)}...` : chatHistorySearch
                            };
                            setCurrentChat(newChat);
                            setMessages([newMessage]);
                            handleSearch(chatHistorySearch);
                            setAttachments([]);
                          }
                        }}
                        placeholder="Search for information about insurance, policies, claims, and more..."
                        className="flex-1 text-base text-gray-900 placeholder-gray-500 focus:outline-none bg-transparent"
                      />
                    </div>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        className="hidden"
                        multiple
                      />
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="p-2 rounded-lg transition-colors text-[#3551F3] hover:bg-[#EEF2FF]"
                      >
                        <Paperclip className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => {
                          if (chatHistorySearch.trim()) {
                            const newMessage = {
                              id: Date.now(),
                              text: chatHistorySearch.trim(),
                              sender: 'user',
                              attachments: attachments
                            };
                            const newChat = {
                              id: Date.now(),
                              title: chatHistorySearch.length > 30 ? `${chatHistorySearch.slice(0, 30)}...` : chatHistorySearch
                            };
                            setCurrentChat(newChat);
                            setMessages([newMessage]);
                            handleSearch(chatHistorySearch);
                            setAttachments([]);
                          }
                        }}
                        className="p-2 rounded-lg transition-colors bg-[#3551F3] text-white hover:bg-[#2B41D9]"
                      >
                        <Send className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Chat View
            <>
              {/* Messages */}
              <ScrollArea className="flex-1 p-6">
                <div className="space-y-4 max-w-5xl mx-auto">
                  {messages.map((msg, index) => (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                    >
                      {msg.sender === 'assistant' && messages[index - 1]?.sender === 'user' && completedSteps.length > 0 && (
                        <button
                          onClick={() => setShowSteps(prev => ({ ...prev, [msg.id]: !prev[msg.id] }))}
                          className="flex items-center gap-1.5 mb-2 px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                          {showSteps[msg.id] ? (
                            <ChevronUp className="w-3.5 h-3.5" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5" />
                          )}
                          View Processing Steps
                        </button>
                      )}
                      {showSteps[msg.id] && (
                        <div className="w-full mb-3 bg-white rounded-2xl p-6 space-y-5 border border-gray-100 shadow-sm">
                          <div className="flex items-center gap-3">
                            <h3 className="text-base font-semibold text-gray-900">Sources:</h3>
                            <div className="flex gap-3">
                              <div className="flex items-center gap-2 bg-[#3551F3] text-white px-4 py-2 rounded-xl text-sm font-medium">
                                <FileText className="w-4 h-4" />
                                Insurance Data
                              </div>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <h3 className="text-base font-semibold text-gray-900">Request processed</h3>
                              <span className="text-sm text-gray-500 font-medium">{Math.round(loadingProgress)}%</span>
                            </div>
                            <Progress value={loadingProgress} className="h-1.5" />
                          </div>
                          
                          <LoadingSteps steps={loadingSteps} currentStep={currentStep} />
                        </div>
                      )}
                      <div
                        className={`max-w-[85%] rounded-2xl py-2.5 px-4 ${
                          msg.sender === 'user'
                            ? 'bg-[#EEF2FF] text-gray-900'
                            : 'text-gray-900'
                        }`}
                      >
                        {msg.sender === 'assistant' ? (
                          <div className="w-full space-y-4">
                            <div className="whitespace-pre-wrap leading-relaxed">
                              <TypewriterText 
                                text={msg.text} 
                                delay={5} 
                                onComplete={() => {
                                  if (msg.showVisualization) {
                                    const vizElement = document.querySelector(`#viz-${msg.id}`);
                                    if (vizElement) {
                                      vizElement.style.opacity = '1';
                                      vizElement.style.transform = 'translateY(0)';
                                    }
                                  }
                                }}
                              />
                            </div>
                            {msg.showVisualization ? (
                              <div 
                                id={`viz-${msg.id}`}
                                className="transition-all duration-500"
                                style={{ opacity: 0, transform: 'translateY(20px)' }}
                              >
                                <ErrorBoundary>
                                  <InsuranceDataVisualization 
                                    show={true}
                                    onFollowUpClick={handleFollowUpClick}
                                    onPin={handlePin}
                                  />
                                </ErrorBoundary>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                                  <ThumbsUp className="w-4 h-4 text-gray-600" />
                                </button>
                                <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                                  <ThumbsDown className="w-4 h-4 text-gray-600" />
                                </button>
                                <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                                  <Copy className="w-4 h-4 text-gray-600" />
                                </button>
                                <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                                  <Share2 className="w-4 h-4 text-gray-600" />
                                </button>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="whitespace-pre-wrap leading-relaxed">
                            {msg.text}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {isLoading && (
                    <div className="bg-white rounded-2xl p-6 space-y-5 border border-gray-100">
                      <div className="flex items-center gap-3">
                        <h3 className="text-base font-semibold text-gray-900">Sources:</h3>
                        <div className="flex gap-3">
                          <div className="flex items-center gap-2 bg-[#3551F3] text-white px-4 py-2 rounded-xl text-sm font-medium">
                            <FileText className="w-4 h-4" />
                            Insurance Data
                          </div>                         
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <h3 className="text-base font-semibold text-gray-900">Processing your request</h3>
                          <span className="text-sm text-gray-500 font-medium">{Math.round(loadingProgress)}%</span>
                        </div>
                        <Progress value={loadingProgress} className="h-1.5" />
                      </div>
                      
                      <LoadingSteps steps={loadingSteps} currentStep={currentStep} />
                    </div>
                  )}

                  {isTyping && !isLoading && (
                    <div className="flex justify-start">
                      <div className="max-w-[85%] rounded-2xl p-4">
                        <div className="flex gap-1.5">
                          <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                          <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                          <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>

              {/* Input Area */}
              <div className="border-t p-6">
                <div className="max-w-5xl mx-auto relative flex items-center">
                  <div className="w-full flex items-center bg-white border border-gray-200 rounded-xl pr-24">
                    <div className="flex items-center gap-2 flex-shrink-0 py-2 px-3">
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
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSubmit(e)}
                      placeholder="Type your message..."
                      className="border-0 shadow-none focus:ring-0 text-base bg-transparent h-[52px]"
                      disabled={isLoading}
                    />
                  </div>
                  
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      className="hidden"
                      multiple
                    />
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="p-2 rounded-lg text-gray-500 hover:bg-gray-50 transition-colors"
                      disabled={isLoading}
                    >
                      <Paperclip className="w-5 h-5" />
                    </button>
                    <button
                      onClick={handleSubmit}
                      className="p-2 rounded-lg bg-[#3551F3] text-white hover:bg-[#2B41D9] transition-colors"
                      disabled={isLoading}
                    >
                      <Send className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      <Toaster />

      {/* File attachments */}
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {attachments.map((file, index) => (
            <div
              key={index}
              className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-lg"
            >
              <span className="text-sm text-gray-600">{file.name}</span>
              <button
                onClick={() => handleRemoveFile(file)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </MainLayout>
  );
} 
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Send, ChevronLeft, Plus, Link2, Send as SendIcon, FileText, Video, Search, Paperclip, ChevronDown, ChevronUp, ThumbsUp, ThumbsDown, Copy, Share2, X, CheckCircle2 } from "lucide-react";
import { MainLayout } from "@/components/MainLayout";
import { TypewriterText } from "@/components/TypewriterText";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { LoadingSteps } from "@/components/LoadingSteps";
import { useLocation } from "react-router-dom";
import { DataVisualization } from "@/components/DataVisualization";
import { MarketingDataVisualization } from '@/components/MarketingDataVisualization';
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/components/ui/use-toast";

// Mock chat history data for marketing
const chatHistory = {
  today: [
    { id: 1, title: "CAC Analysis for Q1" },
    { id: 2, title: "Social Media Campaign Performance" }
  ],
  yesterday: [
    { id: 3, title: "Email Marketing Strategy" },
    { id: 4, title: "Google Ads Budget Planning" }
  ],
  previousWeek: [
    { id: 5, title: "Content Calendar Review" }
  ],
  previousMonth: [
    { id: 6, title: "Brand Guidelines Discussion" }
  ]
};

// Mock chat messages for marketing
const mockChatMessages = {
  1: [
    { id: 1, text: "Show me the CAC analysis for the last 6 months", sender: 'user' },
    { 
      id: 2, 
      text: "CAC Analysis for the last 6 months\n\n1. Volatile Channel: 'Instagram Ads' showed the highest fluctuations in CAC, suggesting inconsistent performance and potential inefficiencies in campaign strategy. This indicates that audience behavior or ad effectiveness may be unpredictable.\n\n2. Biggest Monthly Spike: 'Nov'24' saw the largest month-over-month CAC increase (210.80), likely due to increased competition, seasonality, or budget shifts. This could suggest a rise in advertising costs or ineffective budget allocation during that period.\n\n3. Consistent Channel: 'Email Campaigns' maintained a relatively stable CAC, making it a predictable and reliable acquisition source. This suggests that email marketing delivers a steady return on investment without extreme cost variations.\n\n4. Most Improved Channel: 'Facebook Ads' saw the largest CAC drop from Jun'24 to Dec'24 (-246), indicating optimization efforts or better targeting strategies. This could mean better ad placements, audience refinements, or improved creative performance over time.", 
      sender: 'assistant',
      showVisualization: true
    }
  ],
  2: [
    { id: 1, text: "How is our social media campaign performing?", sender: 'user' },
    { id: 2, text: "Here's a breakdown of our social media performance:\n\n1. Engagement rates have increased by 25% across all platforms\n2. Instagram leads with the highest conversion rate at 3.2%\n3. LinkedIn shows strong B2B lead generation results", sender: 'assistant' }
  ]
};

// Add new loading steps for the November CAC question
const novemberCacLoadingSteps = [
  {
    title: "Understanding your query..."
  },
  {
    title: "Retrieving CAC data from all marketing channels..."
  },
  {
    title: "Comparing month-over-month changes for November 2024..."
  },
  {
    title: "Identifying the largest cost spikes across channels..."
  },
  {
    title: "Analyzing campaign performance, competition trends, and spend allocation shifts..."
  },
  {
    title: "Compiling insights into a structured response..."
  }
];

// Add new loading steps for the ROI question
const roiLoadingSteps = [
  {
    title: "Understanding your query..."
  },
  {
    title: "Connecting to all marketing channels..."
  },
  {
    title: "Fetching revenue and CAC data for each platform..."
  },
  {
    title: "Calculating ROI across different ad channels..."
  },
  {
    title: "Identifying the most profitable marketing source..."
  },
  {
    title: "Compiling insights into a structured response..."
  }
];

export default function MarketingChatPage() {
  const location = useLocation();
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
  const fileInputRef = useRef(null);
  const { toast } = useToast();
  const [showToast, setShowToast] = useState(false);

  const loadingSteps = [
    {
      title: "Understanding your query..."
    },
    {
      title: "Connecting to Google Ads, Facebook Ads, Email Campaigns..."
    },
    {
      title: "Fetching CAC data from June 2024 to December 2024..."
    },
    {
      title: "Calculating customer acquisition cost trends..."
    },
    {
      title: "Deriving key takeaways for performance optimization..."
    },
    {
      title: "Compiling results into a structured response..."
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

      setCurrentChat(newChat);
      setMessages([searchMessage]);
      handleSearch(initialMessage, searchMessage, newChat);
    }
  }, [location.state]);

  // Load chat messages when a chat is selected
  useEffect(() => {
    if (currentChat) {
      setIsLoading(true);
      setLoadingProgress(0);
      setCurrentStep(0);
      
      const progressInterval = setInterval(() => {
        setLoadingProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            return 100;
          }
          return prev + 5;
        });
      }, 100);

      const stepInterval = setInterval(() => {
        setCurrentStep(prev => {
          if (prev >= loadingSteps.length - 1) {
            clearInterval(stepInterval);
            return prev;
          }
          return prev + 1;
        });
      }, 1000);

      setTimeout(() => {
        const chatMessages = mockChatMessages[currentChat.id] || [];
        setMessages(chatMessages);
        setIsLoading(false);
        setCurrentStep(0);
        clearInterval(progressInterval);
        clearInterval(stepInterval);
      }, 5000);

      return () => {
        clearInterval(progressInterval);
        clearInterval(stepInterval);
      };
    }
  }, [currentChat]);

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

  const handleSearch = async (query, searchMessage, newChat) => {
    setIsLoading(true);
    setLoadingProgress(0);
    setCurrentStep(0);
    setShowVisualization(false);
    setCompletedSteps([]);
    
    try {
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

      await new Promise(resolve => setTimeout(resolve, 5000));
      
      const searchResponse = {
        id: Date.now() + 1,
        text: "CAC Analysis for the last 6 months\n\n1. Volatile Channel: 'Instagram Ads' showed the highest fluctuations in CAC, suggesting inconsistent performance and potential inefficiencies in campaign strategy. This indicates that audience behavior or ad effectiveness may be unpredictable.\n\n2. Biggest Monthly Spike: 'Nov'24' saw the largest month-over-month CAC increase (210.80), likely due to increased competition, seasonality, or budget shifts. This could suggest a rise in advertising costs or ineffective budget allocation during that period.\n\n3. Consistent Channel: 'Email Campaigns' maintained a relatively stable CAC, making it a predictable and reliable acquisition source. This suggests that email marketing delivers a steady return on investment without extreme cost variations.\n\n4. Most Improved Channel: 'Facebook Ads' saw the largest CAC drop from Jun'24 to Dec'24 (-246), indicating optimization efforts or better targeting strategies. This could mean better ad placements, audience refinements, or improved creative performance over time.",
        sender: 'assistant',
        showVisualization: true
      };
      
      setIsTyping(true);
      setMessages(prev => [...prev, searchResponse]);
      
      chatHistory.today.unshift(newChat);
      mockChatMessages[newChat.id] = [searchMessage, searchResponse];

      setTimeout(() => {
        setIsTyping(false);
        setShowVisualization(true);
        setCurrentStep(loadingSteps.length - 1);
        setCompletedSteps(loadingSteps.map((_, index) => index));
      }, 500);
      
      clearInterval(progressInterval);
      clearInterval(stepInterval);
      
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
      setChatHistorySearch("");
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

  const handleSendMessage = async () => {
    if (!inputValue.trim() && attachments.length === 0) return;

    const newMessage = {
      id: Date.now(),
      text: inputValue.trim(),
      sender: 'user',
      attachments: [...attachments]
    };

    setMessages(prev => [...prev, newMessage]);
    setInputValue("");
    setAttachments([]);
    setIsLoading(true);
    setLoadingProgress(0);
    setCurrentStep(0);
    setCompletedSteps([]);
    
    try {
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

      await new Promise(resolve => setTimeout(resolve, 5000));
      
      // For demonstration: use inputValue to create a response
      let responseText = `Thank you for your query: "${inputValue.trim()}"\n\n`;
      
      if (inputValue.toLowerCase().includes('cac')) {
        responseText += "CAC Analysis for the last 6 months\n\n1. Volatile Channel: 'Instagram Ads' showed the highest fluctuations in CAC, suggesting inconsistent performance and potential inefficiencies in campaign strategy. This indicates that audience behavior or ad effectiveness may be unpredictable.\n\n2. Biggest Monthly Spike: 'Nov'24' saw the largest month-over-month CAC increase (210.80), likely due to increased competition, seasonality, or budget shifts. This could suggest a rise in advertising costs or ineffective budget allocation during that period.\n\n3. Consistent Channel: 'Email Campaigns' maintained a relatively stable CAC, making it a predictable and reliable acquisition source. This suggests that email marketing delivers a steady return on investment without extreme cost variations.\n\n4. Most Improved Channel: 'Facebook Ads' saw the largest CAC drop from Jun'24 to Dec'24 (-246), indicating optimization efforts or better targeting strategies. This could mean better ad placements, audience refinements, or improved creative performance over time.";
      } else if (inputValue.toLowerCase().includes('roi')) {
        responseText += "ROI Analysis by Marketing Channel:\n\n1. Email Marketing: 487% ROI, making it our highest performing channel with the lowest cost and highest conversion rate.\n\n2. Paid Search: 315% ROI, delivering consistent performance with moderate costs and good targeting precision.\n\n3. Social Media: 210% ROI, showing strong growth but with higher customer acquisition costs.\n\n4. Display Ads: 143% ROI, providing brand awareness but with lower direct conversion rates.\n\nRecommendation: Increase investment in email campaigns by 15% and reallocate budget from display ads to targeted paid search campaigns for optimal ROI.";
      } else {
        responseText += "Based on your request, I've analyzed our marketing data and found the following insights:\n\n1. Our customer engagement has increased by 23% over the last quarter\n\n2. The average conversion rate across all channels is 2.7%, with email performing best at 3.8%\n\n3. CTR has improved on all platforms, with the most significant gains on LinkedIn (+1.2 percentage points)\n\nLet me know if you'd like more specific information about any of these metrics.";
      }
      
      const searchResponse = {
        id: Date.now() + 1,
        text: responseText,
        sender: 'assistant',
        showVisualization: inputValue.toLowerCase().includes('cac')
      };
      
      setMessages(prev => [...prev, searchResponse]);
      
      if (!currentChat) {
        const newChat = {
          id: Date.now(),
          title: inputValue.length > 30 ? `${inputValue.slice(0, 30)}...` : inputValue
        };
        setCurrentChat(newChat);
        chatHistory.today.unshift(newChat);
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error("Error sending message:", error);
      setIsLoading(false);
    }
  };

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

    // Specific response for the November CAC question
    if (query === "What caused the sharp CAC increase in Nov'24?") {
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
          if (prev >= novemberCacLoadingSteps.length - 1) {
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
          text: "Organic Search saw the biggest CAC spike (+660), likely due to a drop in website conversion rates caused by an increase in low-intent traffic. This could have been driven by:\n\n1. A change in content strategy – If new content or landing pages attracted visitors who were not the right audience, it could have led to higher traffic but lower conversions, increasing the CAC.\n\n2. Technical issues on the website – A sudden rise in bounce rates due to slow page load times, broken links, or tracking errors could have resulted in missed conversions, making the cost per acquisition seem higher than usual.",
          sender: 'assistant',
          isNovemberQuery: true
        };

        setIsTyping(true);
        setMessages(prev => [...prev, response]);

        setTimeout(() => {
          setIsTyping(false);
          setShowVisualization(true);
          setCurrentStep(novemberCacLoadingSteps.length - 1);
          setCompletedSteps(novemberCacLoadingSteps.map((_, index) => index));
        }, 500);

        clearInterval(progressInterval);
        clearInterval(stepInterval);
        setIsLoading(false);
      }, 5000);
    } 
    // Add specific response for the ROI question
    else if (query === "Which channel had the highest ROI despite CAC variations?") {
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
          if (prev >= roiLoadingSteps.length - 1) {
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
          text: "The channel with the highest ROI was Google Ads, with an ROI of 35.38. This indicates that despite CAC variations, it generated the best returns relative to its cost.",
          sender: 'assistant',
          isRoiQuery: true
        };

        setIsTyping(true);
        setMessages(prev => [...prev, response]);

        setTimeout(() => {
          setIsTyping(false);
          setShowVisualization(true);
          setCurrentStep(roiLoadingSteps.length - 1);
          setCompletedSteps(roiLoadingSteps.map((_, index) => index));
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
              <h2 className="text-lg font-semibold text-gray-900">Chat</h2>
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
              <p className="text-lg text-gray-500 mb-8 text-center">Ask me anything about marketing campaigns, performance, and analytics</p>
              <div className="w-full">
                {/* New Chat Search with attachments */}
                <div className="relative flex items-center">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  
                  <div className="flex-1 flex items-center pl-12 bg-white border border-gray-200 rounded-xl">
                    <div className="flex items-center gap-2 flex-shrink-0 py-2 px-2">
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
                    
                    <input
                      type="text"
                      value={chatHistorySearch}
                      onChange={(e) => setChatHistorySearch(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && (chatHistorySearch.trim() || attachments.length > 0)) {
                          const newMessage = {
                            id: Date.now(),
                            text: chatHistorySearch.trim(),
                            sender: 'user',
                            attachments: [...attachments]
                          };
                          const newChat = {
                            id: Date.now(),
                            title: chatHistorySearch.length > 30 ? `${chatHistorySearch.slice(0, 30)}...` : chatHistorySearch
                          };
                          setCurrentChat(newChat);
                          setMessages([newMessage]);
                          setAttachments([]);
                          handleSearch(chatHistorySearch, newMessage, newChat);
                        }
                      }}
                      placeholder="Ask about campaign performance, ROI analysis, or marketing strategies..."
                      className="w-full h-[52px] bg-transparent border-0 focus:outline-none focus:ring-0 text-base text-gray-900 placeholder-gray-500 pr-24"
                    />
                    
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      className="hidden"
                      multiple
                    />
                  </div>
                  
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    <button 
                      type="button"
                      onClick={handleAttachmentClick}
                      className="p-2 rounded-lg text-gray-500 hover:bg-gray-50 transition-colors"
                    >
                      <Paperclip className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => {
                        if (chatHistorySearch.trim() || attachments.length > 0) {
                          const newMessage = {
                            id: Date.now(),
                            text: chatHistorySearch.trim(),
                            sender: 'user',
                            attachments: [...attachments]
                          };
                          const newChat = {
                            id: Date.now(),
                            title: chatHistorySearch.length > 30 ? `${chatHistorySearch.slice(0, 30)}...` : chatHistorySearch
                          };
                          setCurrentChat(newChat);
                          setMessages([newMessage]);
                          setAttachments([]);
                          handleSearch(chatHistorySearch, newMessage, newChat);
                        }
                      }}
                      className="p-2 rounded-lg bg-[#3551F3] text-white hover:bg-[#2B41D9] transition-colors"
                    >
                      <Send className="w-5 h-5" />
                    </button>
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
                      {msg.sender === 'user' ? (
                        <div className="max-w-[85%] rounded-2xl py-2.5 px-4 bg-[#EEF2FF] text-gray-900">
                          <div className="whitespace-pre-wrap leading-relaxed">
                            {msg.text}
                          </div>
                        </div>
                      ) : (
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
                              <MarketingDataVisualization 
                                show={true}
                                onFollowUpClick={handleFollowUpClick}
                                onPin={handlePin}
                              />
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
                      )}
                    </div>
                  ))}
                  
                  {/* Loading UI */}
                  {isLoading && (
                    <div className="w-full">
                      <div className="bg-white rounded-2xl p-6 space-y-5 border border-gray-100 shadow-sm">
                        {/* Sources section */}
                        <div>
                          <h3 className="text-base font-medium text-gray-900 mb-3">Sources:</h3>
                          <div className="flex flex-wrap gap-3">
                            <div className="flex items-center gap-2 bg-[#3551F3] text-white px-4 py-2.5 rounded-xl text-sm font-medium">
                              <FileText className="w-4 h-4" />
                              Google Ads
                            </div>
                            <div className="flex items-center gap-2 bg-[#3551F3] text-white px-4 py-2.5 rounded-xl text-sm font-medium">
                              <FileText className="w-4 h-4" />
                              Facebook Ads
                            </div>
                            <div className="flex items-center gap-2 bg-[#3551F3] text-white px-4 py-2.5 rounded-xl text-sm font-medium">
                              <FileText className="w-4 h-4" />
                              Email Campaign Data
                            </div>
                          </div>
                        </div>

                        {/* Progress bar */}
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <h3 className="text-base font-medium text-gray-900">Processing your request</h3>
                            <span className="text-sm text-gray-500 font-medium">{loadingProgress}%</span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-2">
                            <div 
                              className="bg-[#3551F3] h-2 rounded-full transition-all duration-300 ease-in-out" 
                              style={{ width: `${loadingProgress}%` }} 
                            />
                          </div>
                        </div>

                        {/* Steps */}
                        <div className="space-y-4">
                          {loadingSteps.map((step, index) => {
                            const isCompleted = index < currentStep;
                            const isCurrent = index === currentStep;
                            
                            return (
                              <div key={index} className="flex items-center gap-3">
                                {isCompleted ? (
                                  <div className="w-6 h-6 rounded-full bg-[#3551F3] flex items-center justify-center text-white">
                                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                      <path d="M11.6667 3.5L5.25001 9.91667L2.33334 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                  </div>
                                ) : isCurrent ? (
                                  <div className="w-6 h-6 rounded-full bg-white border-2 border-[#3551F3] flex items-center justify-center text-[#3551F3] font-bold text-xs">
                                    {index + 1}
                                  </div>
                                ) : (
                                  <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold text-xs">
                                    {index + 1}
                                  </div>
                                )}
                                <span className={`text-sm ${isCurrent ? 'text-gray-900 font-medium' : isCompleted ? 'text-gray-900' : 'text-gray-500'}`}>
                                  {step.title}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>

              {/* Message input */}
              {currentChat && (
                <div className="border-t p-4 bg-white">
                  <div className="max-w-5xl mx-auto">
                    <div className="relative flex items-center">
                      <div className="flex-1 flex items-center bg-white border border-gray-200 rounded-xl pr-24">
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
                          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                          placeholder="Type your message..."
                          className="border-0 shadow-none focus:ring-0 text-base bg-transparent h-[52px]"
                          disabled={isLoading}
                        />
                        
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileChange}
                          className="hidden"
                          multiple
                        />
                      </div>
                      
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                        <button 
                          type="button"
                          onClick={handleAttachmentClick}
                          className="p-2 rounded-lg text-gray-500 hover:bg-gray-50 transition-colors"
                          disabled={isLoading}
                        >
                          <Paperclip className="w-5 h-5" />
                        </button>
                        <button
                          onClick={handleSendMessage}
                          className="p-2 rounded-lg bg-[#3551F3] text-white hover:bg-[#2B41D9] transition-colors"
                          disabled={isLoading}
                        >
                          <Send className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <Toaster />
    </MainLayout>
  );
}
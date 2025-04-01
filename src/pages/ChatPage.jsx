import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Send, ChevronLeft, Plus, Link2, Send as SendIcon, FileText, Video, Search, Paperclip, ChevronDown, ChevronUp } from "lucide-react";
import { MainLayout } from "@/components/MainLayout";
import { TypewriterText } from "@/components/TypewriterText";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { LoadingSteps } from "@/components/LoadingSteps";
import { useLocation } from "react-router-dom";
import { DataVisualization } from "@/components/DataVisualization";

// Mock chat history data
const chatHistory = {
  today: [
    { id: 1, title: "AI Trends Discussion" },
    { id: 2, title: "Python Programming Help" }
  ],
  yesterday: [
    { id: 3, title: "Database Query Optimization" },
    { id: 4, title: "React Components Discussion" }
  ],
  previousWeek: [
    { id: 5, title: "Cloud Architecture Planning" }
  ],
  previousMonth: [
    { id: 6, title: "Machine Learning Fundamentals" }
  ]
};

// Mock chat messages for each chat
const mockChatMessages = {
  1: [
    { id: 1, text: "What are the latest trends in AI?", sender: 'user' },
    { id: 2, text: "The latest trends in AI include large language models, generative AI, and autonomous systems.", sender: 'assistant' }
  ],
  2: [
    { id: 1, text: "How do I implement a binary search in Python?", sender: 'user' },
    { id: 2, text: "Here's an example of binary search implementation in Python...", sender: 'assistant' }
  ]
};

export default function ChatPage() {
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

  const loadingSteps = [
    {
      title: "Understanding your query..."
    },
    {
      title: "Scanning SOP documents for key insights..."
    },
    {
      title: "Analyzing video content for relevant context..."
    },
    {
      title: "Compiling structured recommendations..."
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
        text: `Based on the analysis of your Customer Acquisition Cost (CAC) data across different marketing channels over the past 6 months, here are the key insights:\n\n1. LinkedIn consistently shows the highest CAC, ranging from $63-70, indicating it's the most expensive channel but might be justified for B2B targeting.\n\n2. Facebook maintains the lowest CAC, averaging around $39, making it the most cost-effective channel.\n\n3. YouTube and Google show moderate CAC values with slight fluctuations, suggesting stable performance.\n\nBelow is a detailed breakdown of CAC metrics across all channels:`,
        sender: 'assistant'
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

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const newMessage = {
      id: Date.now(),
      text: inputValue.trim(),
      sender: 'user'
    };

    setMessages(prev => [...prev, newMessage]);
    setInputValue("");
    setIsLoading(true);
    setLoadingProgress(0);
    setShowVisualization(false);

    try {
      const interval = setInterval(() => {
        setLoadingProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 5;
        });
      }, 50);

      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const responseText = `Based on the analysis of your Customer Acquisition Cost (CAC) data across different marketing channels over the past 6 months, here are the key insights:\n\n1. LinkedIn consistently shows the highest CAC, ranging from $63-70, indicating it's the most expensive channel but might be justified for B2B targeting.\n\n2. Facebook maintains the lowest CAC, averaging around $39, making it the most cost-effective channel.\n\n3. YouTube and Google show moderate CAC values with slight fluctuations, suggesting stable performance.\n\nBelow is a detailed breakdown of CAC metrics across all channels:`;
      
      setIsTyping(true);
      
      const response = {
        id: Date.now() + 1,
        text: responseText,
        sender: 'assistant'
      };
      
      setMessages(prev => [...prev, response]);
      
      if (currentChat) {
        mockChatMessages[currentChat.id] = [
          ...(mockChatMessages[currentChat.id] || []),
          newMessage,
          response
        ];
      }

      setTimeout(() => {
        setIsTyping(false);
        setShowVisualization(true);
      }, 500);
      clearInterval(interval);
      
    } catch (error) {
      console.error('Error:', error);
    } finally {
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
    setShowVisualization(false);

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
          return prev + 1;
        });
      }, 1000);

      // Simulate API delay
      setTimeout(async () => {
        const responseText = `Based on the analysis of your Customer Acquisition Cost (CAC) data across different marketing channels over the past 6 months, here are the key insights:\n\n1. LinkedIn consistently shows the highest CAC, ranging from $63-70, indicating it's the most expensive channel but might be justified for B2B targeting.\n\n2. Facebook maintains the lowest CAC, averaging around $39, making it the most cost-effective channel.\n\n3. YouTube and Google show moderate CAC values with slight fluctuations, suggesting stable performance.\n\nBelow is a detailed breakdown of CAC metrics across all channels:`;
        
        setIsTyping(true);
        
        const response = {
          id: Date.now() + 1,
          text: responseText,
          sender: 'assistant'
        };
        
        setMessages(prev => [...prev, response]);
        
        if (currentChat) {
          mockChatMessages[currentChat.id] = [
            ...(mockChatMessages[currentChat.id] || []),
            newMessage,
            response
          ];
        }

        setTimeout(() => {
          setIsTyping(false);
          setShowVisualization(true);
        }, 500);

        clearInterval(progressInterval);
        clearInterval(stepInterval);
        setIsLoading(false);
      }, 5000);
      
    } catch (error) {
      console.error('Error:', error);
      setIsLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="h-[calc(100vh-4rem)] flex">
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
              <h1 className="text-4xl font-bold text-gray-900 mb-3">Hello, Sanuj</h1>
              <p className="text-lg text-gray-500 mb-8 text-center">Ask me anything or search through your knowledge base</p>
              <div className="w-full">
                <div className="relative flex items-center">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={chatHistorySearch}
                    onChange={(e) => setChatHistorySearch(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && chatHistorySearch.trim()) {
                        const newMessage = {
                          id: Date.now(),
                          text: chatHistorySearch.trim(),
                          sender: 'user'
                        };
                        const newChat = {
                          id: Date.now(),
                          title: chatHistorySearch.length > 30 ? `${chatHistorySearch.slice(0, 30)}...` : chatHistorySearch
                        };
                        setCurrentChat(newChat);
                        setMessages([newMessage]);
                        handleSearch(chatHistorySearch, newMessage, newChat);
                      }
                    }}
                    placeholder="Search for information, documents, people, and more..."
                    className="w-full pl-12 pr-24 py-4 bg-white border border-gray-200 rounded-xl text-base text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#3551F3] focus:border-transparent transition-all"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    <button 
                      className={`p-2 rounded-lg transition-colors ${
                        chatHistorySearch 
                          ? 'text-[#3551F3] hover:bg-[#EEF2FF]' 
                          : 'text-gray-300 cursor-not-allowed'
                      }`}
                      disabled={!chatHistorySearch}
                    >
                      <Paperclip className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => {
                        if (chatHistorySearch.trim()) {
                          const newMessage = {
                            id: Date.now(),
                            text: chatHistorySearch.trim(),
                            sender: 'user'
                          };
                          const newChat = {
                            id: Date.now(),
                            title: chatHistorySearch.length > 30 ? `${chatHistorySearch.slice(0, 30)}...` : chatHistorySearch
                          };
                          setCurrentChat(newChat);
                          setMessages([newMessage]);
                          handleSearch(chatHistorySearch, newMessage, newChat);
                        }
                      }}
                      className={`p-2 rounded-lg transition-colors ${
                        chatHistorySearch 
                          ? 'bg-[#3551F3] text-white hover:bg-[#2B41D9]' 
                          : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      }`}
                      disabled={!chatHistorySearch}
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
                                SOP Documents
                              </div>
                              <div className="flex items-center gap-2 bg-[#3551F3] text-white px-4 py-2 rounded-xl text-sm font-medium">
                                <Video className="w-4 h-4" />
                                RBL Video Files
                              </div>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <h3 className="text-base font-semibold text-gray-900">Request processed</h3>
                              <span className="text-sm text-gray-500 font-medium">100%</span>
                            </div>
                            <Progress value={100} className="h-1.5" />
                          </div>
                          
                          <LoadingSteps steps={loadingSteps} currentStep={loadingSteps.length - 1} />
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
                          <div>
                            <div className="whitespace-pre-wrap leading-relaxed">
                              <TypewriterText 
                                text={msg.text} 
                                delay={20} 
                                onComplete={() => {
                                  setTimeout(() => {
                                    const vizElement = document.querySelector(`#viz-${msg.id}`);
                                    if (vizElement) {
                                      vizElement.style.opacity = '1';
                                      vizElement.style.transform = 'translateY(0)';
                                    }
                                  }, 500);
                                }}
                              />
                            </div>
                            <div 
                              id={`viz-${msg.id}`} 
                              style={{ 
                                opacity: '0', 
                                transform: 'translateY(10px)',
                                transition: 'opacity 0.3s ease, transform 0.3s ease'
                              }}
                            >
                              <DataVisualization 
                                show={showVisualization} 
                                onFollowUpClick={handleFollowUpClick}
                              />
                            </div>
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
                            SOP Documents
                          </div>
                          <div className="flex items-center gap-2 bg-[#3551F3] text-white px-4 py-2 rounded-xl text-sm font-medium">
                            <Video className="w-4 h-4" />
                            RBL Video Files
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
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                    placeholder="Type your message..."
                    className="w-full pl-4 pr-24 py-4 text-base rounded-xl bg-white border-gray-200 focus:ring-[#3551F3]"
                    disabled={isLoading}
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    <button 
                      className={`p-2 rounded-lg transition-colors ${
                        inputValue 
                          ? 'text-[#3551F3] hover:bg-[#EEF2FF]' 
                          : 'text-gray-300 cursor-not-allowed'
                      }`}
                      disabled={!inputValue || isLoading}
                    >
                      <Paperclip className="w-5 h-5" />
                    </button>
                    <button
                      onClick={handleSendMessage}
                      className={`p-2 rounded-lg transition-colors ${
                        inputValue 
                          ? 'bg-[#3551F3] text-white hover:bg-[#2B41D9]' 
                          : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      }`}
                      disabled={!inputValue || isLoading}
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
    </MainLayout>
  );
} 
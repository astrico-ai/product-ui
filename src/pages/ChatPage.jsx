import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Send, ChevronLeft, Plus, Link2, Send as SendIcon, FileText, Video, Search, Paperclip, ChevronDown, ChevronUp, ChevronRight, ThumbsUp, ThumbsDown, Copy, Share2, X } from "lucide-react";
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
    { id: 1, title: "Show me today's loan leads" },
    { id: 2, title: "Documents for home loan" }
  ],
  yesterday: [
    { id: 3, title: "Business loan eligibility" },
    { id: 4, title: "Processing fees for car loan" }
  ],
  previousWeek: [
    { id: 5, title: "Pending loan approvals" }
  ],
  previousMonth: [
    { id: 6, title: "Interest rates comparison" }
  ]
};

// Mock chat messages for each chat
const mockChatMessages = {
  1: [
    { id: 1, text: "Show me the loan leads assigned to me today", sender: 'user' },
    { id: 2, text: "Here are your assigned loan leads for today...", sender: 'assistant' }
  ],
  2: [
    { id: 1, text: "What documents are needed for home loan?", sender: 'user' },
    { id: 2, text: "Here's the list of required documents for home loan...", sender: 'assistant' }
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
  const [attachments, setAttachments] = useState([]);
  const fileInputRef = useRef(null);

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
        "I spoke with Mr John Doe and he was interested in getting 5L loan for a new Maruti Suzuki Car Swift Desire. He will put a down payment of 2L and he wants the loan for 5 years. Please push this to @SFDC": {
          text: "Great, I will push this to SFDC. Before that, I will need to know the interest at which you have agreed to the transaction. And, I will also need a few documents:\n\n1. Pan card of the owner\n2. Income proof",
          showFollowUp: false,
          showFeedback: true
        },
        "9% and I don't have the documents right now": {
          text: "No worries. I have created a lead in the funnel **Opportunity Feb 2025** with the following details:\n\n**SDFC ID** - 2345632\n**Status** - Open\n**Car Details** - Maruti Suzuki Swift Desire\n**Interest** - 9% p.a\n**Years** - 4\n**Down Payment** - ₹2,00,000\n**Owner** - John Doe\n**Agent ID** - 246\n\nPlease use this link to access the lead:\n@https://rbl.salesforce.com/lightning/r/Opportunity/0065G00000XYZ123/view",
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
          showFollowUp: response.showFollowUp,
          showFeedback: response.showFeedback
        };
      } else {
        searchResponse = {
          id: Date.now() + 1,
          text: `**There are two sets of documents that you'll need to take for a new car loan for a Pvt Ltd company.**\n\n**📌 General documents are:**\n1. Application Form\n2. Performa Invoice\n3. Passport size photo\n4. KYC proof\n\n**📑 Apart from these, you'll also need:**\n1. Audited balance sheet for last two years\n2. Last three months' balance sheet\n3. MSME registration certificate / Establishment certificate\n4. Shareholding pattern`,
          sender: 'assistant',
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
      
      // Use the same query matching logic as handleSearch
      const queries = {
        "I spoke with Mr John Doe and he was interested in getting 5L loan for a new Maruti Suzuki Car Swift Desire. He will put a down payment of 2L and he wants the loan for 5 years. Please push this to @SFDC": {
          text: "Great, I will push this to SFDC. Before that, I will need to know the interest at which you have agreed to the transaction. And, I will also need a few documents:\n\n1. Pan card of the owner\n2. Income proof",
          showFollowUp: false,
          showFeedback: true
        },
        "9% and I don't have the documents right now": {
          text: "No worries. I have created a lead in the funnel **Opportunity Feb 2025** with the following details:\n\n**SDFC ID** - 2345632\n**Status** - Open\n**Car Details** - Maruti Suzuki Swift Desire\n**Interest** - 9% p.a\n**Years** - 4\n**Down Payment** - ₹2,00,000\n**Owner** - John Doe\n**Agent ID** - 246\n\nPlease use this link to access the lead:\n@https://rbl.salesforce.com/lightning/r/Opportunity/0065G00000XYZ123/view",
          showFollowUp: false,
          showFeedback: true
        }
      };
      
      let response;
      const matchedQuery = Object.keys(queries).find(key => inputValue.trim() === key.trim());
      
      if (matchedQuery) {
        const matchedResponse = queries[matchedQuery];
        response = {
          id: Date.now() + 1,
          text: matchedResponse.text,
          sender: 'assistant',
          showFollowUp: matchedResponse.showFollowUp,
          showFeedback: matchedResponse.showFeedback
        };
      } else {
        response = {
          id: Date.now() + 1,
          text: `**There are two sets of documents that you'll need to take for a new car loan for a Pvt Ltd company.**\n\n**📌 General documents are:**\n1. Application Form\n2. Performa Invoice\n3. Passport size photo\n4. KYC proof\n\n**📑 Apart from these, you'll also need:**\n1. Audited balance sheet for last two years\n2. Last three months' balance sheet\n3. MSME registration certificate / Establishment certificate\n4. Shareholding pattern`,
          sender: 'assistant',
          showFollowUp: true,
          showFeedback: true
        };
      }
      
      setIsTyping(true);
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
        setShowVisualization(false);
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
        const responseText = `Yes but one additional document is also required in the case of partnership firms: **Board resolution for Trust.**`;
        
        setIsTyping(true);
        
        const response = {
          id: Date.now() + 1,
          text: responseText,
          sender: 'assistant',
          showFollowUp: true,
          hideFollowUpQuery: true
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

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setAttachments(prev => [...prev, ...files]);
    // Reset file input
    e.target.value = '';
  };

  const removeAttachment = (fileName) => {
    setAttachments(prev => prev.filter(file => file.name !== fileName));
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
              <h1 className="text-4xl font-bold text-gray-900 mb-3">Hello, Vraj</h1>
              <p className="text-lg text-gray-500 mb-8 text-center">Ask me anything or search through your knowledge base</p>
              <div className="w-full">
                <div className="relative flex flex-col gap-3">
                  <div className="relative flex items-center">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <div className="w-full flex items-center gap-2 pl-12 pr-24 py-2 bg-white border border-gray-200 rounded-xl focus-within:ring-2 focus-within:ring-[#3551F3] focus-within:border-transparent transition-all">
                      {attachments.map((file) => (
                        <div
                          key={file.name}
                          className="flex items-center gap-1.5 bg-[#EEF2FF] text-[#3551F3] px-2 py-1 rounded-full text-sm"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span className="max-w-[100px] truncate">{file.name}</span>
                          <button
                            onClick={() => removeAttachment(file.name)}
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
                        placeholder="Search for information, documents, people, and more..."
                        className="flex-1 text-base text-gray-900 placeholder-gray-500 focus:outline-none bg-transparent"
                      />
                    </div>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileSelect}
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
                          <div>
                            <div className="whitespace-pre-wrap leading-relaxed">
                              <TypewriterText 
                                text={msg.text} 
                                delay={5} 
                                onComplete={() => {
                                  setTimeout(() => {
                                    const followUpElement = document.querySelector(`#followup-${msg.id}`);
                                    const feedbackElement = document.querySelector(`#feedback-${msg.id}`);
                                    if (msg.showFollowUp && followUpElement) {
                                      followUpElement.style.opacity = '1';
                                      followUpElement.style.transform = 'translateY(0)';
                                    }
                                    if (feedbackElement) {
                                      feedbackElement.style.opacity = '1';
                                    }
                                  }, 500);
                                }}
                              />
                            </div>
                            <div 
                              id={`feedback-${msg.id}`} 
                              className="mt-4 flex items-center gap-2"
                              style={{ opacity: '0', transition: 'opacity 0.3s ease' }}
                            >
                              <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                                <ThumbsUp className="w-4 h-4 text-gray-500" />
                              </button>
                              <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                                <ThumbsDown className="w-4 h-4 text-gray-500" />
                              </button>
                              <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                                <Copy className="w-4 h-4 text-gray-500" />
                              </button>
                              <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                                <Share2 className="w-4 h-4 text-gray-500" />
                              </button>
                            </div>
                            {msg.showFollowUp && !msg.hideFollowUpQuery && (
                              <div 
                                id={`followup-${msg.id}`} 
                                className="mt-4 flex flex-wrap gap-2"
                                style={{ 
                                  opacity: '0', 
                                  transform: 'translateY(10px)',
                                  transition: 'opacity 0.3s ease, transform 0.3s ease'
                                }}
                              >
                                <button
                                  onClick={() => handleFollowUpClick("Are the documents same for partnership firms?")}
                                  className="bg-[#EEF2FF] text-[#3551F3] px-4 py-2 rounded-full text-sm font-medium hover:bg-[#EFF6FF] transition-colors"
                                >
                                  Are the documents same for partnership firms?
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
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileSelect}
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
                      onClick={handleSendMessage}
                      className="p-2 rounded-lg transition-colors bg-[#3551F3] text-white hover:bg-[#2B41D9]"
                    >
                      <Send className="w-5 h-5" />
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
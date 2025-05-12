import React, { useState } from 'react';
import { Search, Calendar, Clock, MessageSquare, Database, ChevronRight, ThumbsUp, ThumbsDown, List, MessageCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// Dummy data
const users = [
  {
    id: 'user1',
    email: 'alice@example.com',
    avatar: null,
    initials: 'AE',
    lastActive: '2024-06-01T10:10:00Z',
    chats: [
      {
        sessionId: 'sess1',
        startedAt: '2024-06-01T10:00:00Z',
        endedAt: '2024-06-01T10:10:00Z',
        queryCount: 3,
        sources: ['Documents', 'Website'],
        messages: [
          {
            messageId: 'm1',
            sender: 'user',
            content: 'Hi, how do I reset my password?',
            timestamp: '2024-06-01T10:01:00Z',
            feedback: 'thumbs_up',
          },
          {
            messageId: 'm2',
            sender: 'ai',
            content: 'To reset your password, click on "Forgot Password" at the login screen.',
            timestamp: '2024-06-01T10:01:10Z',
            feedback: null,
            sources: ['Documents'],
          },
          {
            messageId: 'm3',
            sender: 'user',
            content: 'Thanks!',
            timestamp: '2024-06-01T10:01:20Z',
            feedback: null,
          },
        ],
      },
    ],
  },
  {
    id: 'user2',
    email: 'bob@example.com',
    avatar: null,
    initials: 'BE',
    lastActive: '2024-06-02T11:05:00Z',
    chats: [
      {
        sessionId: 'sess2',
        startedAt: '2024-06-02T11:00:00Z',
        endedAt: '2024-06-02T11:05:00Z',
        queryCount: 2,
        sources: ['Website'],
        messages: [
          {
            messageId: 'm1',
            sender: 'user',
            content: 'What are your support hours?',
            timestamp: '2024-06-02T11:01:00Z',
            feedback: null,
          },
          {
            messageId: 'm2',
            sender: 'ai',
            content: 'Our support is available 24/7.',
            timestamp: '2024-06-02T11:01:10Z',
            feedback: 'thumbs_up',
            sources: ['Website'],
          },
        ],
      },
    ],
  },
];

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatTime(dateString) {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function ViewToggle({ viewMode, setViewMode }) {
  return (
    <div className="inline-flex items-center p-1 bg-gray-100 rounded-lg">
      <button
        onClick={() => setViewMode('chat')}
        className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
          viewMode === 'chat' 
            ? "bg-white shadow-sm text-primary" 
            : "text-gray-600 hover:text-gray-900"
        )}
      >
        <MessageCircle size={16} />
        <span>Chat View</span>
      </button>
      <button
        onClick={() => setViewMode('queryList')}
        className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
          viewMode === 'queryList' 
            ? "bg-white shadow-sm text-primary" 
            : "text-gray-600 hover:text-gray-900"
        )}
      >
        <List size={16} />
        <span>Query List</span>
      </button>
    </div>
  );
}

function UserListSidebar({ users, selectedUserId, onSelect, search, setSearch }) {
  const filteredUsers = users.filter(u => u.email.toLowerCase().includes(search.toLowerCase()));
  
  return (
    <Card className="w-80 h-full overflow-y-auto border-0 rounded-none shadow-none">
      <CardHeader className="px-4 py-3 border-b">
        <CardTitle className="text-base font-medium text-gray-800">Users</CardTitle>
      </CardHeader>
      
      <div className="px-4 py-2 border-b">
        <div className="relative">
          <input
            type="text"
            placeholder="Search by email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full px-9 py-2 rounded-md border border-gray-200 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm bg-white"
          />
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
        </div>
      </div>
      
      <div className="divide-y divide-gray-100">
        {filteredUsers.length === 0 && (
          <div className="px-4 py-6 text-gray-400 text-sm text-center">No users found</div>
        )}
        
        {filteredUsers.map((user) => (
          <button
            key={user.id}
            onClick={() => onSelect(user.id)}
            className={cn(
              "w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors",
              selectedUserId === user.id ? "bg-gray-50" : ""
            )}
          >
            <Avatar className="h-9 w-9 border border-gray-200">
              {user.avatar && <AvatarImage src={user.avatar} alt={user.email} />}
              <AvatarFallback className="bg-primary/10 text-primary font-medium">{user.initials}</AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className={cn(
                  "text-sm truncate", 
                  selectedUserId === user.id ? "font-medium text-primary" : "text-gray-700"
                )}>
                  {user.email}
                </p>
                {selectedUserId === user.id && (
                  <ChevronRight className="h-4 w-4 text-primary flex-shrink-0" />
                )}
              </div>
              <p className="text-xs text-gray-500 truncate">
                Last active: {formatDate(user.lastActive)}
              </p>
            </div>
          </button>
        ))}
      </div>
    </Card>
  );
}

function SessionInfoCard({ chat }) {
  const duration = chat.endedAt && chat.startedAt
    ? Math.round((new Date(chat.endedAt) - new Date(chat.startedAt)) / 60000)
    : null;
    
  return (
    <Card className="bg-white shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium">Conversation Details</CardTitle>
          <Badge variant="outline" className="font-normal bg-primary/5 text-primary border-primary/20 px-2.5 py-1">
            Session #{chat.sessionId}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="grid sm:grid-cols-3 gap-4 pb-0">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
            <Calendar className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Started</p>
            <p className="text-sm font-medium">{formatDate(chat.startedAt)}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
            <Clock className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Duration</p>
            <p className="text-sm font-medium">{duration} min</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
            <MessageSquare className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Queries</p>
            <p className="text-sm font-medium">{chat.queryCount}</p>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="pt-4 pb-4 flex flex-wrap gap-1.5">
        <p className="text-xs text-gray-500 mr-1">Sources:</p>
        {chat.sources.map((source, idx) => (
          <Badge key={idx} variant="outline" className="font-normal bg-gray-50 px-2">
            <Database className="h-3 w-3 mr-1 text-gray-500" /> {source}
          </Badge>
        ))}
      </CardFooter>
    </Card>
  );
}

function Message({ message }) {
  const isUser = message.sender === 'user';
  
  return (
    <div className={cn(
      "flex gap-3",
      isUser ? "justify-start" : "justify-end"
    )}>
      {isUser && (
        <Avatar className="h-8 w-8 mt-1">
          <AvatarFallback className="bg-gray-200 text-gray-600 text-xs">U</AvatarFallback>
        </Avatar>
      )}
      
      <div className={cn(
        "max-w-[70%] rounded-2xl px-4 py-3",
        isUser 
          ? "bg-white border border-gray-100 shadow-sm text-gray-800" 
          : "bg-primary/10 text-gray-800"
      )}>
        <p className="text-sm whitespace-pre-line">{message.content}</p>
        
        <div className="flex items-center gap-2 mt-1.5">
          <span className="text-xs text-gray-400">{formatTime(message.timestamp)}</span>
          
          {message.feedback === 'thumbs_up' && (
            <span className="flex items-center text-xs text-green-500">
              <ThumbsUp size={12} className="mr-0.5" /> Helpful
            </span>
          )}
          
          {message.feedback === 'thumbs_down' && (
            <span className="flex items-center text-xs text-red-500">
              <ThumbsDown size={12} className="mr-0.5" /> Not helpful
            </span>
          )}
        </div>
        
        {!isUser && message.sources && message.sources.length > 0 && (
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {message.sources.map((source, idx) => (
              <Badge key={idx} variant="outline" className="text-xs font-normal bg-white/50 px-1.5 py-0.5">
                <Database className="h-2.5 w-2.5 mr-0.5 text-primary/70" /> {source}
              </Badge>
            ))}
          </div>
        )}
      </div>
      
      {!isUser && (
        <Avatar className="h-8 w-8 mt-1">
          <AvatarFallback className="bg-primary/20 text-primary text-xs">AI</AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}

function calculateResponseTime(userTimestamp, aiTimestamp) {
  const userTime = new Date(userTimestamp).getTime();
  const aiTime = new Date(aiTimestamp).getTime();
  const diffInSeconds = Math.round((aiTime - userTime) / 1000);
  return `${diffInSeconds}s`;
}

function QueryListView() {
  // Process all users' chats into a flat list of query-response pairs
  const queryResponsePairs = [];
  
  users.forEach(user => {
    user.chats.forEach(chat => {
      // Group messages into query-response pairs
      for (let i = 0; i < chat.messages.length - 1; i++) {
        const currentMsg = chat.messages[i];
        const nextMsg = chat.messages[i + 1];
        
        // Only process if current is user and next is AI
        if (currentMsg.sender === 'user' && nextMsg.sender === 'ai') {
          queryResponsePairs.push({
            sessionId: chat.sessionId,
            timestamp: currentMsg.timestamp,
            userId: user.email,
            query: currentMsg.content,
            response: nextMsg.content,
            sources: nextMsg.sources || [],
            feedback: nextMsg.feedback,
            responseTime: calculateResponseTime(currentMsg.timestamp, nextMsg.timestamp)
          });
          
          // Skip the next message as we've already processed it
          i++;
        }
      }
    });
  });

  // Sort by timestamp (newest first)
  queryResponsePairs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  return (
    <div className="flex-1 h-full overflow-hidden">
      <div className="h-full overflow-auto px-6 py-6">
        <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b text-xs text-gray-500 uppercase">
                  <th className="px-4 py-3 text-left font-medium">Session ID</th>
                  <th className="px-4 py-3 text-left font-medium">Timestamp</th>
                  <th className="px-4 py-3 text-left font-medium">User ID</th>
                  <th className="px-4 py-3 text-left font-medium">User Query</th>
                  <th className="px-4 py-3 text-left font-medium">AI Response</th>
                  <th className="px-4 py-3 text-left font-medium">Sources</th>
                  <th className="px-4 py-3 text-left font-medium">Feedback</th>
                  <th className="px-4 py-3 text-left font-medium">Response Time</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {queryResponsePairs.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-4 py-6 text-center text-gray-500">
                      No query data available
                    </td>
                  </tr>
                ) : (
                  queryResponsePairs.map((pair, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono text-xs text-gray-600">{pair.sessionId}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{formatDate(pair.timestamp)}</td>
                      <td className="px-4 py-3 text-primary">{pair.userId}</td>
                      <td className="px-4 py-3 max-w-[200px] truncate">{pair.query}</td>
                      <td className="px-4 py-3 max-w-[200px] truncate">{pair.response}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {pair.sources.map((source, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs font-normal bg-gray-50">
                              {source}
                            </Badge>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {pair.feedback === 'thumbs_up' && (
                          <span className="inline-flex items-center text-xs text-green-500">
                            <ThumbsUp size={12} className="mr-1" /> Helpful
                          </span>
                        )}
                        {pair.feedback === 'thumbs_down' && (
                          <span className="inline-flex items-center text-xs text-red-500">
                            <ThumbsDown size={12} className="mr-1" /> Not Helpful
                          </span>
                        )}
                        {!pair.feedback && (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs">{pair.responseTime}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function ChatHistoryPanel({ user, viewMode }) {
  if (viewMode === 'queryList') {
    return <QueryListView />;
  }

  if (!user) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-10 text-gray-400">
        <div className="h-20 w-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
          <MessageSquare className="h-10 w-10 text-gray-300" />
        </div>
        <p className="text-lg font-medium text-gray-500">Select a user to view chat history</p>
        <p className="text-sm text-gray-400 mt-1">Conversation details will appear here</p>
      </div>
    );
  }
  
  // For now, show only the first chat session
  const chat = user.chats[0];
  
  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <div className="px-6 pt-6 pb-4">
        <SessionInfoCard chat={chat} />
      </div>
      
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
        {chat.messages.map((msg) => (
          <Message key={msg.messageId} message={msg} />
        ))}
      </div>
    </div>
  );
}

export default function MessageHistoryPage() {
  const [selectedUserId, setSelectedUserId] = useState(users[0].id);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState('chat'); // 'chat' or 'queryList'
  const selectedUser = users.find((u) => u.id === selectedUserId);

  return (
    <div className="flex flex-col h-[calc(100vh-110px)] bg-white rounded-lg shadow-sm border overflow-hidden">
      <div className="p-6 border-b">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Message History</h1>
            <p className="text-sm text-gray-500 mt-1">View and analyze user conversations with the AI assistant</p>
          </div>
          <ViewToggle viewMode={viewMode} setViewMode={setViewMode} />
        </div>
      </div>
      
      <div className="flex flex-1 min-h-0 bg-gray-50/50">
        {viewMode === 'chat' && (
          <UserListSidebar 
            users={users} 
            selectedUserId={selectedUserId} 
            onSelect={setSelectedUserId} 
            search={search} 
            setSearch={setSearch} 
          />
        )}
        <ChatHistoryPanel user={selectedUser} viewMode={viewMode} />
      </div>
    </div>
  );
} 
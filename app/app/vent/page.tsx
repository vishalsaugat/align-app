"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Logo from "../../components/Logo";

type Message = {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: Date;
};

type VentSession = {
  id: number;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: { role: string; content: string }[];
};

function VentPageContent() {
  const { status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<number | null>(null);
  const [sessions, setSessions] = useState<VentSession[]>([]);
  const [showSessions, setShowSessions] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    } else if (status === "authenticated") {
      loadSessions();
      
      // Check if there's a sessionId in the URL
      const sessionIdParam = searchParams.get('sessionId');
      if (sessionIdParam) {
        const sessionId = parseInt(sessionIdParam);
        if (!isNaN(sessionId)) {
          // We'll load the specific session after sessions are loaded
          setCurrentSessionId(sessionId);
        }
      }
    }
  }, [status, router, searchParams]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load specific session when sessions are loaded and we have a sessionId from URL
  useEffect(() => {
    if (sessions.length > 0 && currentSessionId && messages.length === 0) {
      const session = sessions.find(s => s.id === currentSessionId);
      if (session) {
        loadSession(session);
      }
    }
  }, [sessions, currentSessionId, messages.length]);

  const loadSessions = async () => {
    try {
      const response = await fetch('/api/vent');
      if (response.ok) {
        const data = await response.json();
        setSessions(data.sessions || []);
      }
    } catch (error) {
      console.error('Failed to load sessions:', error);
    }
  };

  const loadSession = (session: VentSession) => {
    const formattedMessages = session.messages.map((msg: { role: string; content: string }) => ({
      id: `${Date.now()}-${Math.random()}`,
      role: msg.role === 'assistant' ? 'ai' as const : msg.role as 'user' | 'ai',
      content: msg.content,
      timestamp: new Date(),
    }));
    setMessages(formattedMessages);
    setCurrentSessionId(session.id);
    setShowSessions(false);
  };

  // Loading screen
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Logo size={48} animated />
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect if unauthenticated
  if (status === "unauthenticated") {
    return null;
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: currentMessage.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/vent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: currentMessage.trim(),
          conversationHistory: messages.map(m => ({
            role: m.role === 'user' ? 'user' : 'assistant',
            content: m.content
          })),
          sessionId: currentSessionId
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const data = await response.json();
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: data.response || 'I apologize, but I encountered an issue processing your message. Please try again.',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);
      
      // Update current session ID if this is a new session
      if (data.sessionId && !currentSessionId) {
        setCurrentSessionId(data.sessionId);
        loadSessions(); // Refresh sessions list
      }
    } catch (error) {
      console.error('Error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: 'I apologize, but I encountered an error. Please try again in a moment.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const startNewConversation = () => {
    setMessages([]);
    setCurrentMessage('');
    setCurrentSessionId(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex flex-col">
      {/* Header */}
      <header className="bg-white/70 backdrop-blur-sm border-b border-white/40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/dashboard" className="flex items-center">
                <Logo size={32} />
                <span className="ml-3 text-lg font-semibold text-gray-900">Align - Thinking Space</span>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              {messages.length > 0 && (
                <button
                  onClick={startNewConversation}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-medium rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-sm hover:shadow-md"
                >
                  + New Conversation
                </button>
              )}
              <Link 
                href="/dashboard"
                className="text-sm text-gray-600 hover:text-gray-700 transition"
              >
                ← Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 max-w-6xl mx-auto w-full py-8 px-4 sm:px-6 lg:px-8 flex">
        {/* Sessions Sidebar */}
        {showSessions && (
          <div className="w-80 mr-6">
            <div className="bg-white/70 backdrop-blur-sm border border-white/40 shadow-xl rounded-2xl p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
              <h3 className="font-semibold text-gray-900 mb-4">Previous Sessions</h3>
              <div className="space-y-3">
                {sessions.map((session) => (
                  <button
                    key={session.id}
                    onClick={() => loadSession(session)}
                    className="w-full text-left p-3 rounded-xl bg-white/50 hover:bg-white/80 border border-white/40 hover:border-blue-300 transition"
                  >
                    <div className="font-medium text-gray-900 text-sm mb-1 truncate">
                      {session.title || 'Untitled Session'}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(session.updatedAt).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {Array.isArray(session.messages) ? session.messages.length : 0} messages
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Chat Area */}
        <div className={`flex-1 flex flex-col ${showSessions ? 'max-w-4xl' : 'max-w-4xl mx-auto'}`}>
        
        {messages.length === 0 && (
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mb-6 mx-auto">
              <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent mb-4">
              Your Thinking Space
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-4">
              Share your thoughts about any conflict or situation. I&apos;ll help you think through it step by step, ask clarifying questions, and provide balanced perspective.
            </p>
            {sessions.length > 0 && (
              <p className="text-sm text-blue-600 bg-blue-50 rounded-lg px-4 py-2 inline-block">
                💡 You have {sessions.length} previous session{sessions.length !== 1 ? 's' : ''} available in your history
              </p>
            )}
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 space-y-4 mb-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  message.role === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white/70 border border-white/40 shadow-sm'
                }`}
              >
                {message.role === 'ai' ? (
                  <div className="prose prose-sm max-w-none">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        h1: ({children}) => <h1 className="text-lg font-bold text-gray-900 mt-3 mb-2">{children}</h1>,
                        h2: ({children}) => <h2 className="text-base font-semibold text-gray-900 mt-3 mb-2">{children}</h2>,
                        h3: ({children}) => <h3 className="text-sm font-semibold text-gray-900 mt-2 mb-1">{children}</h3>,
                        p: ({children}) => <p className="mb-2 text-gray-700">{children}</p>,
                        ul: ({children}) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
                        ol: ({children}) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
                        li: ({children}) => <li className="text-gray-700">{children}</li>,
                        strong: ({children}) => <strong className="font-semibold text-gray-900">{children}</strong>,
                        em: ({children}) => <em className="italic">{children}</em>,
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <div className="whitespace-pre-wrap">{message.content}</div>
                )}
                <div className={`text-xs mt-2 ${message.role === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white/70 border border-white/40 shadow-sm rounded-2xl px-4 py-3">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span className="text-gray-600">AI is thinking...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input form */}
        <form onSubmit={handleSendMessage} className="bg-white/70 backdrop-blur-sm border border-white/40 shadow-xl rounded-2xl p-4">
          <div className="flex space-x-4">
            <textarea
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              placeholder={messages.length === 0 ? "Share what's on your mind about any conflict or situation..." : "Continue the conversation..."}
              className="flex-1 rounded-xl border border-gray-300 bg-white/80 px-4 py-3 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition resize-none"
              rows={3}
              disabled={isLoading}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(e);
                }
              }}
            />
            <button
              type="submit"
              disabled={!currentMessage.trim() || isLoading}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition self-end"
            >
              Send
            </button>
          </div>
          <div className="mt-2 text-xs text-gray-500">
            Press Enter to send, Shift+Enter for new line
          </div>
        </form>
        </div>
      </main>
      
      {/* Floating History Button - Bottom Left */}
      {sessions.length > 0 && (
        <button
          onClick={() => setShowSessions(!showSessions)}
          className="fixed bottom-6 left-6 z-50 bg-white/90 backdrop-blur-sm border border-white/40 shadow-lg rounded-full p-3 text-gray-700 hover:bg-white hover:shadow-xl transition-all duration-300 flex items-center space-x-2 group"
          title={`${showSessions ? 'Hide' : 'Show'} History (${sessions.length} sessions)`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <span className="absolute -top-2 -right-2 bg-blue-100 text-blue-700 text-xs px-1.5 py-0.5 rounded-full min-w-[1.25rem] text-center">
            {sessions.length}
          </span>
          {/* Expandable text on hover */}
          <span className="absolute left-full ml-3 bg-gray-900 text-white text-sm px-3 py-1 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            {showSessions ? 'Hide' : 'Show'} History
          </span>
        </button>
      )}
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center">
      <div className="text-center">
        <Logo size={48} animated />
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    </div>
  );
}

export default function VentPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <VentPageContent />
    </Suspense>
  );
}
"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Logo from "../../components/Logo";
import { PageLoading, InlineLoading } from "../../components/Loading";

type Message = {
  id: string;
  role: 'user' | 'other' | 'mediator';
  content: string;
  timestamp: Date;
  sender: string;
};

type MediationSession = {
  id: number;
  title: string;
  participantUser: string;
  participantOther: string;
  createdAt: string;
  updatedAt: string;
  messages: Message[];
};

export default function MediatePage() {
  const { status } = useSession();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [participantNames, setParticipantNames] = useState({ user: '', other: '' });
  const [currentSessionId, setCurrentSessionId] = useState<number | null>(null);
  const [sessions, setSessions] = useState<MediationSession[]>([]);
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
    }
  }, [status, router]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadSessions = async () => {
    try {
      const response = await fetch('/api/mediate');
      if (response.ok) {
        const data = await response.json();
        setSessions(data.sessions || []);
      }
    } catch (error) {
      console.error('Failed to load sessions:', error);
    }
  };

  const loadSession = (session: MediationSession) => {
    const formattedMessages = session.messages.map((msg: { role: string; content: string; sender: string }) => ({
      id: `${Date.now()}-${Math.random()}`,
      role: msg.role as 'user' | 'other' | 'mediator',
      content: msg.content,
      timestamp: new Date(),
      sender: msg.sender,
    }));
    setMessages(formattedMessages);
    setParticipantNames({ user: session.participantUser, other: session.participantOther });
    setCurrentSessionId(session.id);
    setSessionStarted(true);
    setShowSessions(false);
  };

  if (status === "loading") {
    return <PageLoading />;
  }

  if (status === "unauthenticated") {
    return null; // Will redirect in useEffect
  }

  const startSession = () => {
    if (!participantNames.user || !participantNames.other) return;
    
    setSessionStarted(true);
    const welcomeMessage: Message = {
      id: 'welcome',
      role: 'mediator',
      content: `Welcome to this mediated conversation between ${participantNames.user} and ${participantNames.other}. I'm here to help facilitate clear, constructive communication. 

Ground rules:
• Speak from your perspective using "I" statements
• Listen to understand, not to respond
• Keep the focus on resolving the issue together
• I'll help translate and clarify messages when needed

${participantNames.user}, would you like to start by sharing your perspective?`,
      timestamp: new Date(),
      sender: 'AI Mediator'
    };
    setMessages([welcomeMessage]);
  };

  const sendMessage = async () => {
    if (!currentMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: currentMessage,
      timestamp: new Date(),
      sender: participantNames.user
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/mediate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: currentMessage,
          conversation: messages,
          participants: participantNames,
          sessionId: currentSessionId
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get mediation response');
      }

      const data = await response.json();
      
      const mediatorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'mediator',
        content: data.response,
        timestamp: new Date(),
        sender: 'AI Mediator'
      };

      setMessages(prev => [...prev, mediatorMessage]);

      // Update current session ID if this is a new session
      if (data.sessionId && !currentSessionId) {
        setCurrentSessionId(data.sessionId);
        loadSessions(); // Refresh sessions list
      }

    } catch (error) {
      console.error('Error getting mediation response:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'mediator',
        content: 'I apologize, but I\'m having technical difficulties. Please continue your conversation and I\'ll try to help again in a moment.',
        timestamp: new Date(),
        sender: 'AI Mediator'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const simulateOtherPersonMessage = () => {
    const otherMessage: Message = {
      id: Date.now().toString(),
      role: 'other',
      content: "I understand your perspective, and I want to work together to resolve this.",
      timestamp: new Date(),
      sender: participantNames.other
    };
    setMessages(prev => [...prev, otherMessage]);
  };

  if (!sessionStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
        {/* Header */}
        <header className="bg-white/70 backdrop-blur-sm border-b border-white/40 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <Link href="/dashboard" className="flex items-center">
                  <Logo size={32} />
                  <span className="ml-3 text-lg font-semibold text-gray-900">Align</span>
                </Link>
              </div>
              <div className="flex items-center space-x-4">
                {sessions.length > 0 && (
                  <button
                    onClick={() => setShowSessions(!showSessions)}
                    className="text-sm text-gray-600 hover:text-gray-700 transition"
                  >
                    {showSessions ? 'Hide' : 'Show'} History ({sessions.length})
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

        <main className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8 flex">
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
                      className="w-full text-left p-3 rounded-xl bg-white/50 hover:bg-white/80 border border-white/40 hover:border-green-300 transition"
                    >
                      <div className="font-medium text-gray-900 text-sm mb-1 truncate">
                        {session.title}
                      </div>
                      <div className="text-xs text-gray-500 mb-1">
                        {session.participantUser} & {session.participantOther}
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

          {/* Main Content */}
          <div className={`flex-1 ${showSessions ? 'max-w-4xl' : 'max-w-2xl mx-auto'}`}>
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-teal-100 rounded-2xl flex items-center justify-center mb-6 mx-auto">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent mb-4">
              AI Mediation Session
            </h1>
            <p className="text-lg text-gray-600 mb-8 max-w-xl mx-auto">
              Set up a mediated conversation where AI helps facilitate clear, constructive communication between both parties.
            </p>
          </div>

          <div className="bg-white/70 backdrop-blur-sm border border-white/40 shadow-xl rounded-3xl p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Session Setup</h2>
            
            <div className="space-y-4 mb-6">
              <div>
                <label htmlFor="user-name" className="block text-sm font-medium text-gray-700 mb-2">
                  Your name
                </label>
                <input
                  id="user-name"
                  type="text"
                  value={participantNames.user}
                  onChange={(e) => setParticipantNames(prev => ({ ...prev, user: e.target.value }))}
                  placeholder="Enter your name"
                  className="w-full rounded-xl border border-gray-300 bg-white/80 px-4 py-3 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                />
              </div>

              <div>
                <label htmlFor="other-name" className="block text-sm font-medium text-gray-700 mb-2">
                  Other person&apos;s name
                </label>
                <input
                  id="other-name"
                  type="text"
                  value={participantNames.other}
                  onChange={(e) => setParticipantNames(prev => ({ ...prev, other: e.target.value }))}
                  placeholder="Enter the other person's name"
                  className="w-full rounded-xl border border-gray-300 bg-white/80 px-4 py-3 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                />
              </div>
            </div>

            <div className="bg-blue-50 rounded-xl p-4 mb-6">
              <h3 className="font-semibold text-blue-900 mb-2">How this works:</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• AI will help mediate your conversation in real-time</li>
                <li>• Messages will be clarified and translated for better understanding</li>
                <li>• The AI maintains neutrality and focuses on resolution</li>
                <li>• Both parties can participate (share this session with them)</li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={startSession}
                disabled={!participantNames.user || !participantNames.other}
                className="flex-1 bg-gradient-to-r from-green-600 to-teal-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-green-700 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Start Mediation Session
              </button>
              <Link
                href="/dashboard"
                className="flex-1 text-center bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-medium hover:bg-gray-200 transition"
              >
                Maybe later
              </Link>
            </div>
          </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex flex-col">
      {/* Header */}
      <header className="bg-white/70 backdrop-blur-sm border-b border-white/40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Logo size={32} />
              <span className="ml-3 text-lg font-semibold text-gray-900">Align - Mediation</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {participantNames.user} & {participantNames.other}
              </span>
              <button
                onClick={() => setSessionStarted(false)}
                className="text-sm text-red-600 hover:text-red-700 transition"
              >
                End Session
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <div className="flex-1 max-w-4xl mx-auto w-full py-6 px-4 sm:px-6 lg:px-8 flex flex-col">
        <div className="flex-1 bg-white/70 backdrop-blur-sm border border-white/40 shadow-xl rounded-3xl p-6 flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto space-y-4 mb-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                    message.role === 'user'
                      ? 'bg-blue-500 text-white'
                      : message.role === 'other'
                      ? 'bg-gray-200 text-gray-900'
                      : 'bg-green-100 text-green-900 border border-green-200'
                  }`}
                >
                  <div className="text-xs font-medium mb-1 opacity-75">
                    {message.sender}
                  </div>
                  {message.role === 'mediator' ? (
                    <div className="text-sm prose prose-sm max-w-none">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          h1: ({children}) => <h1 className="text-base font-bold mt-2 mb-1">{children}</h1>,
                          h2: ({children}) => <h2 className="text-sm font-semibold mt-2 mb-1">{children}</h2>,
                          h3: ({children}) => <h3 className="text-sm font-semibold mt-2 mb-1">{children}</h3>,
                          p: ({children}) => <p className="mb-2">{children}</p>,
                          ul: ({children}) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
                          ol: ({children}) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
                          li: ({children}) => <li>{children}</li>,
                          strong: ({children}) => <strong className="font-semibold">{children}</strong>,
                          em: ({children}) => <em className="italic">{children}</em>,
                        }}
                      >
                        {message.content}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <div className="whitespace-pre-wrap">{message.content}</div>
                  )}
                  <div className="text-xs mt-1 opacity-75">
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-green-100 text-green-900 border border-green-200 px-4 py-3 rounded-2xl">
                  <InlineLoading message="AI Mediator is thinking..." />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-200 pt-4">
            <div className="flex items-center space-x-3">
              <input
                type="text"
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder={`Type your message as ${participantNames.user}...`}
                className="flex-1 rounded-xl border border-gray-300 bg-white/80 px-4 py-3 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                disabled={isLoading}
              />
              <button
                onClick={sendMessage}
                disabled={!currentMessage.trim() || isLoading}
                className="bg-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Send
              </button>
            </div>
            
            {/* Demo helper button */}
            <div className="mt-3 text-center">
              <button
                onClick={simulateOtherPersonMessage}
                className="text-sm text-gray-500 hover:text-gray-700 underline"
              >
                Simulate {participantNames.other}&apos;s response (demo)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
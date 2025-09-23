"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Logo from "../../components/Logo";

type VentSession = {
  id: number;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: { role: string; content: string }[];
};

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [ventSessions, setVentSessions] = useState<VentSession[]>([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    } else if (status === "authenticated") {
      loadVentSessions();
    }
  }, [status, router]);

  const loadVentSessions = async () => {
    setIsLoadingSessions(true);
    try {
      const response = await fetch('/api/vent');
      if (response.ok) {
        const data = await response.json();
        setVentSessions(data.sessions || []);
      }
    } catch (error) {
      console.error('Failed to load vent sessions:', error);
    } finally {
      setIsLoadingSessions(false);
    }
  };

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  const handleModeSelect = (mode: 'vent' | 'mediate') => {
    // Navigate to the specific feature page
    if (mode === 'vent') {
      router.push('/vent');
    } else {
      router.push('/mediate');
    }
  };

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

  if (status === "unauthenticated") {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white/70 backdrop-blur-sm border-b border-white/40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Logo size={32} />
              <span className="ml-3 text-lg font-semibold text-gray-900">Align</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome back{session?.user?.name ? `, ${session.user.name}` : ''}!
              </span>
              <button 
                onClick={() => signOut({ callbackUrl: '/' })}
                className="text-sm text-gray-500 hover:text-gray-700 transition"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent mb-4">
            How can Align help you today?
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Choose how you&apos;d like to approach your conflict resolution. Whether you need space to think clearly or help facilitating a conversation.
          </p>
        </div>
        
        {/* Main options */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Vent & Structure Thoughts */}
          <div 
            onClick={() => handleModeSelect('vent')}
            className="group cursor-pointer bg-white/70 backdrop-blur-sm border border-white/40 shadow-xl rounded-3xl p-8 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300"
          >
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform">
                <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Vent & Clarify</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Need space to think clearly? Share your thoughts freely and let AI help you structure your perspective, identify biases, and gain clarity on the situation.
              </p>
              <div className="flex flex-wrap justify-center gap-2 text-sm text-gray-500 mb-6">
                <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full">Private space</span>
                <span className="bg-purple-50 text-purple-700 px-3 py-1 rounded-full">Bias detection</span>
                <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full">Thought structuring</span>
              </div>
              <div className="group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 bg-gray-100 text-gray-700 group-hover:text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300">
                Start venting safely →
              </div>
            </div>
          </div>

          {/* AI Mediation */}
          <div 
            onClick={() => handleModeSelect('mediate')}
            className="group cursor-pointer bg-white/70 backdrop-blur-sm border border-white/40 shadow-xl rounded-3xl p-8 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300"
          >
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-teal-100 rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform">
                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">AI Mediation</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Ready to have the conversation? Let AI help facilitate and mediate your discussion, summarizing complex emotions into clear, constructive communication.
              </p>
              <div className="flex flex-wrap justify-center gap-2 text-sm text-gray-500 mb-6">
                <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full">Neutral mediation</span>
                <span className="bg-teal-50 text-teal-700 px-3 py-1 rounded-full">Clear communication</span>
                <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full">Real-time help</span>
              </div>
              <div className="group-hover:bg-gradient-to-r group-hover:from-green-600 group-hover:to-teal-600 bg-gray-100 text-gray-700 group-hover:text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300">
                Start mediated conversation →
              </div>
            </div>
          </div>
        </div>

        {/* How it works section */}
        <div className="bg-white/50 backdrop-blur-sm rounded-3xl p-8 border border-white/40">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">How Align Works</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4 mx-auto">
                <span className="text-xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Choose Your Approach</h3>
              <p className="text-sm text-gray-600">Select whether you need private reflection or active mediation</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4 mx-auto">
                <span className="text-xl font-bold text-purple-600">2</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">AI-Powered Support</h3>
              <p className="text-sm text-gray-600">Get intelligent help to structure thoughts or mediate conversations</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4 mx-auto">
                <span className="text-xl font-bold text-green-600">3</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Achieve Clarity</h3>
              <p className="text-sm text-gray-600">Move forward with better understanding and clearer communication</p>
            </div>
          </div>
        </div>

        {/* Recent sessions */}
        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Vent Sessions</h2>
          {isLoadingSessions ? (
            <div className="bg-white/30 backdrop-blur-sm rounded-2xl p-8 border border-white/40 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading sessions...</p>
            </div>
          ) : ventSessions.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {ventSessions.slice(0, 6).map((session) => (
                <div
                  key={session.id}
                  onClick={() => router.push(`/vent?sessionId=${session.id}`)}
                  className="cursor-pointer bg-white/50 backdrop-blur-sm border border-white/40 rounded-2xl p-6 hover:shadow-lg hover:bg-white/70 transition-all duration-300 group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <span className="text-xs text-gray-400">
                      {new Date(session.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                    {session.title || 'Untitled Session'}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    {Array.isArray(session.messages) ? session.messages.length : 0} messages
                  </p>
                  <div className="flex items-center text-sm text-blue-600 group-hover:text-blue-700">
                    <span>Continue session</span>
                    <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white/30 backdrop-blur-sm rounded-2xl p-8 border border-white/40 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <p className="text-gray-600">No vent sessions yet. Start your first thinking session above.</p>
            </div>
          )}
          
          {ventSessions.length > 6 && (
            <div className="mt-6 text-center">
              <button
                onClick={() => router.push('/vent')}
                className="text-blue-600 hover:text-blue-700 font-medium transition"
              >
                View all {ventSessions.length} sessions →
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
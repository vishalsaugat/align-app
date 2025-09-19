"use client";

import { useState } from "react";
import Link from "next/link";
import Logo from "../../components/Logo";

export default function VentPage() {
  const [stage, setStage] = useState<'input' | 'analysis' | 'complete'>('input');
  const [userVent, setUserVent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<string>('');

  const handleVentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userVent.trim()) return;
    
    setStage('analysis');
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/vent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userVent }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to get analysis');
      }
      
      const data = await response.json();
      setAnalysis(data.analysis);
      setStage('complete');
    } catch (error) {
      console.error('Error getting analysis:', error);
      setAnalysis('Sorry, there was an error analyzing your thoughts. Please try again.');
      setStage('complete');
    } finally {
      setIsLoading(false);
    }
  };

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

      <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {stage === 'input' && (
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mb-6 mx-auto">
              <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent mb-4">
              Vent & Clarify
            </h1>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              This is your safe space. Share everything on your mind about the conflict. Be as detailed or emotional as you need to be.
            </p>
          </div>
        )}

        {stage === 'input' && (
          <div className="bg-white/70 backdrop-blur-sm border border-white/40 shadow-xl rounded-3xl p-8">
            <form onSubmit={handleVentSubmit} className="space-y-6">
              <div>
                <label htmlFor="vent" className="block text-lg font-medium text-gray-900 mb-4">
                  Tell me about the conflict you&apos;re experiencing
                </label>
                <textarea
                  id="vent"
                  value={userVent}
                  onChange={(e) => setUserVent(e.target.value)}
                  placeholder="Start writing... What happened? How are you feeling? What's bothering you most about this situation?"
                  className="w-full h-64 rounded-xl border border-gray-300 bg-white/80 px-4 py-3 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition resize-none"
                  required
                />
                <p className="mt-2 text-sm text-gray-500">
                  Don&apos;t worry about structure or grammar. Just let it all out.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  type="submit"
                  disabled={!userVent.trim()}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Help me think clearly
                </button>
                <Link
                  href="/dashboard"
                  className="flex-1 text-center bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-medium hover:bg-gray-200 transition"
                >
                  Maybe later
                </Link>
              </div>
            </form>
          </div>
        )}

        {(stage === 'analysis' || stage === 'complete') && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mb-4 mx-auto">
                {isLoading ? (
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                ) : (
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {isLoading ? 'Analyzing your thoughts...' : 'Analysis Complete'}
              </h2>
              <p className="text-gray-600">
                {isLoading ? 'AI is helping structure your perspective' : 'Here&apos;s your structured analysis'}
              </p>
            </div>

            <div className="bg-white/70 backdrop-blur-sm border border-white/40 shadow-xl rounded-3xl p-8">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Your thoughts:</h3>
                <div className="bg-blue-50 rounded-xl p-4 border-l-4 border-blue-400">
                  <p className="text-gray-700 italic">&quot;{userVent}&quot;</p>
                </div>
              </div>
            </div>

            {analysis && (
              <div className="bg-white/70 backdrop-blur-sm border border-white/40 shadow-xl rounded-3xl p-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Analysis & Suggestions:</h3>
                <div className="bg-green-50 rounded-xl p-4 border-l-4 border-green-400">
                  <div className="whitespace-pre-wrap text-gray-700">{analysis}</div>
                </div>
              </div>
            )}

            {(!isLoading && analysis) && (
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => {
                    setStage('input');
                    setUserVent('');
                  }}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition"
                >
                  Vent again
                </button>
                <Link
                  href="/mediate"
                  className="flex-1 text-center bg-green-100 text-green-700 px-6 py-3 rounded-xl font-semibold hover:bg-green-200 transition"
                >
                  Ready to mediate conversation
                </Link>
                <Link
                  href="/dashboard"
                  className="flex-1 text-center bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-medium hover:bg-gray-200 transition"
                >
                  Back to dashboard
                </Link>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
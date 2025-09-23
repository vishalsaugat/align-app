"use client";

import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Logo from "../components/Logo";

type LoginStatus = "idle" | "loading" | "error" | "success";

export default function LoginPage() {
  const { status: sessionStatus } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<LoginStatus>("idle");
  const [message, setMessage] = useState("");
  const router = useRouter();

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (sessionStatus === "authenticated") {
      router.push("/dashboard");
    }
  }, [sessionStatus, router]);

  // Show loading state while checking session
  if (sessionStatus === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 py-8 sm:px-10">
        <div className="text-center">
          <Logo size={60} animated className="justify-center" />
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render login form if already authenticated (will redirect)
  if (sessionStatus === "authenticated") {
    return null;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) return;
    
    setStatus("loading");
    setMessage("");
    
    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      
      if (result?.error) {
        throw new Error("Invalid credentials");
      }
      
      setStatus("success");
      setMessage("Login successful! Redirecting...");
      
      // Wait a moment and then redirect
      setTimeout(() => {
        router.push("/dashboard");
      }, 1000);
      
    } catch (err: unknown) {
      setStatus("error");
      const fallback = "Login failed. Please try again.";
      if (err instanceof Error) {
        setMessage(err.message || fallback);
      } else {
        setMessage(fallback);
      }
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-8 sm:px-10">
      <div className="w-full max-w-md">
        {/* Logo and branding */}
        <div className="text-center mb-8">
          <Logo size={60} withWordmark animated className="justify-center" />
          <h1 className="mt-6 text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent">
            Welcome back
          </h1>
          <p className="mt-2 text-gray-600">
            Sign in to your Align account
          </p>
        </div>

        {/* Login form */}
        <div className="bg-white/70 backdrop-blur-sm border border-white/40 shadow-xl rounded-2xl p-6 md:p-8">
          <form onSubmit={onSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="w-full rounded-xl border border-gray-300 bg-white/80 px-4 py-3 text-sm sm:text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                disabled={status === "loading" || status === "success"}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="w-full rounded-xl border border-gray-300 bg-white/80 px-4 py-3 text-sm sm:text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                disabled={status === "loading" || status === "success"}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium text-blue-600 hover:text-blue-500 transition">
                  Forgot your password?
                </a>
              </div>
            </div>

            <button
              type="submit"
              disabled={status === "loading" || status === "success"}
              className="w-full rounded-xl px-6 py-3 text-base font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 shadow hover:from-blue-700 hover:to-purple-700 disabled:opacity-60 disabled:cursor-not-allowed transition"
            >
              {status === "loading" ? "Signing in..." : status === "success" ? "Success!" : "Sign in"}
            </button>

            <div className="min-h-[20px] text-sm text-center" aria-live="polite" role="status">
              {status === "error" && (
                <p className="text-red-600">{message || "Error signing in. Please try again."}</p>
              )}
              {status === "success" && (
                <p className="text-green-600">{message}</p>
              )}
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">New to Align?</span>
              </div>
            </div>

            <div className="mt-6 text-center">
              <Link
                href="/"
                className="inline-flex items-center justify-center px-6 py-2.5 text-sm font-medium text-gray-700 bg-white/80 backdrop-blur-sm rounded-full shadow border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all"
              >
                Join the waitlist
              </Link>
            </div>
          </div>
        </div>

        {/* Footer links */}
        <div className="mt-8 text-center text-sm text-gray-600">
          <p>
            By signing in, you agree to our{" "}
            <a href="#" className="font-medium text-blue-600 hover:text-blue-500 transition">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="font-medium text-blue-600 hover:text-blue-500 transition">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
"use client";

import Logo from "./Logo";

interface LoadingProps {
  /** Loading message to display */
  message?: string;
  /** Size of the logo */
  logoSize?: number;
  /** Whether to show the animated logo */
  animated?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Variant for different loading styles */
  variant?: "default" | "minimal" | "inline";
}

export default function Loading({
  message = "Loading...",
  logoSize = 48,
  animated = true,
  className = "",
  variant = "default"
}: LoadingProps) {
  if (variant === "minimal") {
    return (
      <div className={`flex items-center justify-center space-x-2 ${className}`}>
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
        <span className="text-gray-600">{message}</span>
      </div>
    );
  }

  if (variant === "inline") {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        <span className="text-gray-600 text-sm">{message}</span>
      </div>
    );
  }

  // Default full-screen loading
  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center ${className}`}>
      <div className="text-center">
        <Logo size={logoSize} animated={animated} />
        <p className="mt-4 text-gray-600">{message}</p>
      </div>
    </div>
  );
}

// Convenience components for common use cases
export function PageLoading({ message }: { message?: string }) {
  return <Loading message={message} />;
}

export function InlineLoading({ message }: { message?: string }) {
  return <Loading variant="inline" message={message} />;
}

export function MinimalLoading({ message }: { message?: string }) {
  return <Loading variant="minimal" message={message} />;
}


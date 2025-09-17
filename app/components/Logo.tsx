"use client";
import Image from "next/image";
import { useEffect, useState } from "react";

interface LogoProps {
  size?: number;
  variant?: "auto" | "light" | "dark";
  withWordmark?: boolean;
  animated?: boolean;
  className?: string;
}

export default function Logo({
  size = 80,
  variant = "auto",
  withWordmark = false,
  animated = true,
  className = "",
}: LogoProps) {
  const [resolved, setResolved] = useState<"light" | "dark">("light");

  useEffect(() => {
    if (variant === "auto") {
      const m = window.matchMedia("(prefers-color-scheme: dark)");
      const update = () => setResolved(m.matches ? "dark" : "light");
      update();
      m.addEventListener("change", update);
      return () => m.removeEventListener("change", update);
    } else if (variant === "dark") {
      setResolved("dark");
    } else {
      setResolved("light");
    }
  }, [variant]);

  const src = resolved === "dark" ? "/align-logo-dark.svg" : "/align-logo.svg";

  return (
    <div className={`inline-flex flex-col items-center gap-2 select-none ${animated ? "logo-fade-in" : ""} ${className}`}>      
      <Image
        src={src}
        alt="Align logo"
        width={size}
        height={size}
        priority
        className={animated ? "animate-logo-pop" : ""}
      />
      {withWordmark && (
        <span className="text-[11px] tracking-[0.28em] font-medium text-gray-500 dark:text-gray-400">ALIGN</span>
      )}
    </div>
  );
}

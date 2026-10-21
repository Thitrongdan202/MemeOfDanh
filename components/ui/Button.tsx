"use client";

import React from "react";
import { useMagnetic } from "@/lib/motion/useMagnetic";
import { useSettings } from "@/lib/settings/SettingsContext";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "accent";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
  magnetic?: boolean;
  cursorLabel?: string;
  icon?: React.ReactNode;
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  isLoading = false,
  magnetic = false,
  cursorLabel,
  icon,
  className = "",
  onClick,
  disabled,
  ...props
}: ButtonProps) {
  const { playSound } = useSettings();
  const magneticRef = useMagnetic<HTMLButtonElement>(magnetic ? 0.25 : 0);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || isLoading) return;
    playSound("click");
    if (onClick) onClick(e);
  };

  // Base variants
  const variantStyles = {
    primary:
      "bg-accent hover:bg-accent-hover text-white shadow-sm border border-transparent",
    accent:
      "bg-accent hover:bg-accent-hover text-white shadow-sm border border-transparent",
    secondary:
      "bg-museum-muted hover:bg-museum-border text-museum-text border border-museum-border",
    outline:
      "bg-museum-surface hover:bg-museum-muted text-museum-text border border-museum-border hover:border-accent",
    ghost:
      "bg-transparent hover:bg-museum-muted text-museum-secondary hover:text-museum-text border border-transparent",
  };

  const sizeStyles = {
    sm: "px-2.5 py-1 text-xs rounded-md space-x-1.5",
    md: "px-3.5 py-1.5 text-xs font-semibold rounded-lg space-x-2",
    lg: "px-5 py-2.5 text-sm font-semibold rounded-lg space-x-2.5",
    icon: "p-2 rounded-lg text-museum-secondary hover:text-museum-text",
  };

  return (
    <button
      ref={magneticRef}
      onClick={handleClick}
      disabled={disabled || isLoading}
      data-cursor={cursorLabel}
      className={`relative inline-flex items-center justify-center font-medium transition-all duration-200 active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
        variantStyles[variant]
      } ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : (
        <>
          {icon && <span className="shrink-0 transition-transform duration-200 group-hover:scale-110">{icon}</span>}
          {children && <span>{children}</span>}
        </>
      )}
    </button>
  );
}

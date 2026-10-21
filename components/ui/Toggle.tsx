"use client";

import React from "react";
import { useSettings } from "@/lib/settings/SettingsContext";

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
}

export function Toggle({
  checked,
  onChange,
  label,
  description,
  disabled = false,
}: ToggleProps) {
  const { playSound } = useSettings();

  const handleToggle = () => {
    if (disabled) return;
    playSound("toggle");
    onChange(!checked);
  };

  return (
    <div
      onClick={handleToggle}
      className={`flex items-center justify-between cursor-pointer select-none py-1.5 group ${
        disabled ? "opacity-40 cursor-not-allowed" : ""
      }`}
    >
      {(label || description) && (
        <div className="pr-4 space-y-0.5">
          {label && (
            <div className="text-xs font-semibold text-museum-text group-hover:text-accent transition-colors">
              {label}
            </div>
          )}
          {description && (
            <div className="text-[11px] text-museum-subtle leading-snug">
              {description}
            </div>
          )}
        </div>
      )}

      {/* Switch Track */}
      <div
        role="switch"
        aria-checked={checked}
        tabIndex={disabled ? -1 : 0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleToggle();
          }
        }}
        className={`relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 ${
          checked ? "bg-accent" : "bg-museum-muted border-museum-border"
        }`}
      >
        {/* Switch Thumb */}
        <span
          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
            checked ? "translate-x-4" : "translate-x-0 bg-museum-secondary/60"
          }`}
        />
      </div>
    </div>
  );
}

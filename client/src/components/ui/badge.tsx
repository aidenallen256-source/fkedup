// components/ui/badge.tsx
"use client";
import React from "react";

export function Badge({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`inline-block px-2 py-1 text-xs font-medium bg-blue-500 text-white rounded ${className}`}>
      {children}
    </span>
  );
}

// components/ui/dialog.tsx
"use client";
import React, { useState } from "react";

export function Dialog({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>;
}

export function DialogTrigger({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return <button onClick={onClick}>{children}</button>;
}

export function DialogContent({ children }: { children: React.ReactNode }) {
  return <div className="fixed inset-0 bg-black/50 flex items-center justify-center">{children}</div>;
}

export function DialogHeader({ children }: { children: React.ReactNode }) {
  return <div className="mb-2 font-bold">{children}</div>;
}

export function DialogTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-xl font-semibold">{children}</h2>;
}

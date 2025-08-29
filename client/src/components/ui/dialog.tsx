// components/ui/dialog.tsx
"use client";
import React, { useCallback, useEffect, useMemo } from "react";

type DialogRootProps = {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export function Dialog({ children, open, onOpenChange }: DialogRootProps) {
  // Provide context for Trigger/Content to coordinate
  const ctx = useMemo(() => ({ open, onOpenChange }), [open, onOpenChange]);
  return (
    <DialogContext.Provider value={ctx}>
      {children}
    </DialogContext.Provider>
  );
}

type DialogContextType = {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

const DialogContext = React.createContext<DialogContextType>({});

export function DialogTrigger({ children, onClick, asChild }: { children: React.ReactNode; onClick?: () => void; asChild?: boolean }) {
  const { onOpenChange } = React.useContext(DialogContext);
  const handleClick = () => {
    onOpenChange?.(true);
    onClick?.();
  };
  if (asChild) return <span onClick={handleClick}>{children}</span>;
  return <button onClick={handleClick}>{children}</button>;
}

export function DialogContent({ children, className }: { children: React.ReactNode; className?: string }) {
  const { open, onOpenChange } = React.useContext(DialogContext);

  const onKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") onOpenChange?.(false);
  }, [onOpenChange]);

  useEffect(() => {
    if (!open) return;
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onKeyDown]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50" onClick={() => onOpenChange?.(false)} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className={`w-full max-w-xl rounded-lg bg-card text-foreground shadow-lg border border-border ${className ?? ""}`}>
          <div className="p-4">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

export function DialogHeader({ children }: { children: React.ReactNode }) {
  return <div className="mb-4">{children}</div>;
}

export function DialogTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-xl font-semibold">{children}</h2>;
}

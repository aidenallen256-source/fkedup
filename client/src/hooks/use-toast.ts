import { useState } from "react";

type ToastVariant = "default" | "destructive";

interface ToastOptions {
  title: string;
  description?: string;
  variant?: ToastVariant;
}

export function useToast() {
  const [messages, setMessages] = useState<ToastOptions[]>([]);

  const toast = (options: ToastOptions) => {
    setMessages((prev) => [...prev, options]);
    // For now just log it (you can later build a real Toast UI component)
    console.log("TOAST:", options.title, options.description);
  };

  return { toast, messages };
}

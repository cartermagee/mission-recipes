"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

type Toast = {
  id: string;
  title?: string;
  description?: React.ReactNode;
  variant?: "default" | "destructive" | "success";
  durationMs?: number;
};

type ToastContextValue = {
  toast: (toast: Omit<Toast, "id">) => string;
  dismiss: (id: string) => void;
};

const ToastContext = React.createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const dismiss = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = React.useCallback(
    ({ durationMs = 4000, ...rest }: Omit<Toast, "id">) => {
      const id = Math.random().toString(36).slice(2);
      setToasts((prev) => [...prev, { id, durationMs, ...rest }]);
      if (durationMs > 0) {
        setTimeout(() => dismiss(id), durationMs);
      }
      return id;
    },
    [dismiss]
  );

  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      {children}
      <div className="pointer-events-none fixed bottom-0 right-0 z-[100] flex w-full max-w-md flex-col gap-2 p-4">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              "pointer-events-auto flex items-start gap-3 rounded-md border bg-background p-4 shadow-lg animate-in slide-in-from-bottom-5",
              t.variant === "destructive" &&
                "border-destructive/50 bg-destructive text-destructive-foreground",
              t.variant === "success" &&
                "border-success/50 bg-success text-success-foreground"
            )}
          >
            <div className="flex-1 space-y-1">
              {t.title ? (
                <div className="text-sm font-semibold">{t.title}</div>
              ) : null}
              {t.description ? (
                <div className="text-sm opacity-90">{t.description}</div>
              ) : null}
            </div>
            <button
              className="opacity-70 transition-opacity hover:opacity-100"
              onClick={() => dismiss(t.id)}
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = React.useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

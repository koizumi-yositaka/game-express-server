import { createContext, useContext, useMemo, useState } from "react";

type LoadingContextValue = {
  isLoading: boolean;
  message?: string;
  show: (message?: string) => void;
  hide: () => void;
};

const LoadingContext = createContext<LoadingContextValue | undefined>(undefined);

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | undefined>(undefined);

  const value = useMemo<LoadingContextValue>(() => ({
    isLoading,
    message,
    show: (msg?: string) => {
      setMessage(msg);
      setIsLoading(true);
    },
    hide: () => {
      setIsLoading(false);
      setMessage(undefined);
    },
  }), [isLoading, message]);

  return (
    <LoadingContext.Provider value={value}>
      {children}
      {isLoading && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3 rounded-lg bg-white px-6 py-5 shadow-lg">
            <svg className="h-8 w-8 animate-spin text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
            </svg>
            {message && <div className="text-sm text-gray-700">{message}</div>}
          </div>
        </div>
      )}
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  const ctx = useContext(LoadingContext);
  if (!ctx) throw new Error("useLoading must be used within LoadingProvider");
  return ctx;
}



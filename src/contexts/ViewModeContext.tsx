import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

type ViewMode = "guest" | "admin";

interface ViewModeContextValue {
  mode: ViewMode;
  toggle: () => void;
  setMode: (m: ViewMode) => void;
}

const ViewModeContext = createContext<ViewModeContextValue | null>(null);

export function ViewModeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ViewMode>("guest");

  useEffect(() => {
    const stored =
      typeof window !== "undefined" ? localStorage.getItem("viewMode") : null;
    if (stored === "admin" || stored === "guest") setMode(stored);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") localStorage.setItem("viewMode", mode);
  }, [mode]);

  return (
    <ViewModeContext.Provider
      value={{
        mode,
        setMode,
        toggle: () => setMode(mode === "guest" ? "admin" : "guest"),
      }}
    >
      {children}
    </ViewModeContext.Provider>
  );
}

export function useViewMode() {
  const ctx = useContext(ViewModeContext);
  if (!ctx) throw new Error("useViewMode must be used within ViewModeProvider");
  return ctx;
}

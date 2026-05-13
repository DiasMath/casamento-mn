import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import "./styles.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ViewModeProvider } from "@/contexts/ViewModeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from "@/components/ui/sonner";

import { Index } from "./routes/index";
import { ChaDePanela } from "./routes/cha-de-panela";
import { AdminLogin } from "./routes/admin.login";
import { AdminPainel } from "./routes/admin.painel";

const queryClient = new QueryClient();

function AppLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ViewModeProvider>
          <Outlet />
          <Toaster position="top-center" />
        </ViewModeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Página não encontrada</h2>
      </div>
    </div>
  );
}

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Root element not found");

createRoot(rootElement).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Index />} />
          <Route path="/cha-de-panela" element={<ChaDePanela />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/painel" element={<AdminPainel />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
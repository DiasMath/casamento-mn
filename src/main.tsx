import { StrictMode, lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import {
  BrowserRouter,
  Routes,
  Route,
  Outlet,
  Navigate,
} from "react-router-dom";
import "./styles.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ViewModeProvider } from "@/contexts/ViewModeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from "@/components/ui/sonner";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { ErrorBoundary } from "@/components/ErrorBoundary";

const Index = lazy(() => import("./routes/index").then((m) => ({ default: m.Index })));
const PresentList = lazy(() => import("./routes/present-list").then((m) => ({ default: m.PresentList })));
const AdminLogin = lazy(() => import("./routes/admin.login").then((m) => ({ default: m.AdminLogin })));
const AdminPainel = lazy(() => import("./routes/admin.painel").then((m) => ({ default: m.AdminPainel })));
const ChaDePanela = lazy(() => import("./routes/cha-de-panela").then((m) => ({ default: m.ChaDePanela })));

const queryClient = new QueryClient();

function LoadingSpinner() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function AppLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ViewModeProvider>
          <ErrorBoundary>
            <Suspense fallback={<LoadingSpinner />}>
              <Outlet />
            </Suspense>
          </ErrorBoundary>
          <Toaster position="top-center" />
        </ViewModeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

function HomeRoute() {
  const { settings, loading } = useSiteSettings();
  if (loading) return null;
  if (settings.chaDePanelaEnabled) {
    return <Navigate to="/cha-de-panela" replace />;
  }
  return <Index />;
}

function ChaRoute() {
  const { settings, loading } = useSiteSettings();
  if (loading) return null;
  if (!settings.chaDePanelaEnabled) {
    return <Navigate to="/" replace />;
  }
  return <ChaDePanela />;
}

function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">
          Página não encontrada
        </h2>
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
          <Route path="/" element={<HomeRoute />} />
          <Route path="/present-list" element={<PresentList />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/painel" element={<AdminPainel />} />
          <Route path="/cha-de-panela" element={<ChaRoute />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);

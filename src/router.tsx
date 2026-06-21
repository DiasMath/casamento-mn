import { lazy, Suspense } from "react";
import {
  createBrowserRouter,
  RouterProvider,
  Outlet,
  Link,
} from "react-router-dom";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ViewModeProvider } from "@/contexts/ViewModeContext";
import { Toaster } from "@/components/ui/sonner";
import { ErrorBoundary } from "@/components/ErrorBoundary";

const Index = lazy(() =>
  import("./routes/index").then((m) => ({ default: m.Index })),
);
const PresentList = lazy(() =>
  import("./routes/present-list").then((m) => ({ default: m.PresentList })),
);
const AdminLogin = lazy(() =>
  import("./routes/admin.login").then((m) => ({ default: m.AdminLogin })),
);
const AdminPainel = lazy(() =>
  import("./routes/admin.painel").then((m) => ({ default: m.AdminPainel })),
);
const ChaDePanela = lazy(() =>
  import("./routes/cha-de-panela").then((m) => ({ default: m.ChaDePanela })),
);

export const queryClient = new QueryClient();

function PageLoader() {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  );
}

function AppLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <ViewModeProvider>
        <ErrorBoundary>
          <Suspense fallback={<PageLoader />}>
            <Outlet />
          </Suspense>
        </ErrorBoundary>
        <Toaster position="top-center" />
      </ViewModeProvider>
    </QueryClientProvider>
  );
}

function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">
          Página não encontrada
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          A página que você procura não existe.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Voltar ao início
          </Link>
        </div>
      </div>
    </div>
  );
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      { path: "/", element: <Index /> },
      { path: "/present-list", element: <PresentList /> },
      { path: "/admin/login", element: <AdminLogin /> },
      { path: "/admin/painel", element: <AdminPainel /> },
      { path: "/cha-de-panela", element: <ChaDePanela /> },
    ],
  },
  { path: "*", element: <NotFound /> },
]);

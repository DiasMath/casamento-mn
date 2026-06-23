import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { devLog } from "@/lib/devLog";
import { Heart, Lock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, ADMIN_EMAIL } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export function AdminLogin() {
  // ALL HOOKS MUST BE CALLED HERE, IN THE SAME ORDER ON EVERY RENDER
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formLoading, setFormLoading] = useState(false);
  const [redirectToAdmin, setRedirectToAdmin] = useState(false);

  // Handle redirect after auth check (useEffect for side effects)
  useEffect(() => {
    if (!loading && user?.email === ADMIN_EMAIL) {
      setRedirectToAdmin(true);
    }
  }, [loading, user]);

  // Handle actual redirect (useEffect to avoid render-time navigation)
  useEffect(() => {
    if (redirectToAdmin) {
      navigate("/admin/painel");
    }
  }, [redirectToAdmin, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);

    if (!auth) {
      toast.error("Erro de conexão. Tente novamente.");
      setFormLoading(false);
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );

      // Verify this is an admin user (checks against .env ADMIN_EMAIL)
      if (userCredential.user.email !== ADMIN_EMAIL) {
        throw new Error(
          "Acesso não autorizado - este e-mail não tem permissão de admin",
        );
      }

      toast.success("Bem-vindo(a) ao painel!");
      // The redirect will happen via the useEffect above when user changes
    } catch (error: any) {
      devLog.error("Login error:", error);
      if (
        error.code === "auth/invalid-email" ||
        error.code === "auth/user-disabled" ||
        error.code === "auth/user-not-found" ||
        error.code === "auth/wrong-password"
      ) {
        toast.error("E-mail ou senha incorretos");
      } else {
        toast.error(error.message || "Erro ao fazer login. Tente novamente.");
      }
    } finally {
      setFormLoading(false);
    }
  };

  // NOW WE CAN USE CONDITIONAL LOGIC FOR RETURN VALUES
  // (All hooks have been called, so this is safe)

  let JSXtoReturn;

  if (loading) {
    JSXtoReturn = (
      <div className="min-h-screen flex items-center justify-center px-4">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  } else if (redirectToAdmin) {
    JSXtoReturn = (
      <div className="min-h-screen flex items-center justify-center px-4">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  } else {
    JSXtoReturn = (
      <div className="min-h-screen flex items-center justify-center px-4 bg-pastel-gradient">
        <div className="w-full max-w-md bg-card rounded-3xl shadow-[var(--shadow-soft)] border border-border/60 p-8">
          <div className="flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-full bg-primary/30 flex items-center justify-center">
              <Lock className="w-6 h-6 text-primary-foreground" />
            </div>
            <h1 className="font-script text-3xl mt-4">Painel Administrativo</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Entre para gerenciar a lista de presentes
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div>
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12 rounded-xl mt-2"
                placeholder="voce@email.com"
              />
            </div>
            <div>
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-12 rounded-xl mt-2"
                placeholder="••••••••"
              />
            </div>
            <Button
              type="submit"
              disabled={formLoading}
              className="w-full h-12 rounded-full bg-primary text-primary-foreground hover:opacity-90"
            >
              {formLoading ? "Entrando..." : "Entrar"}
            </Button>
          </form>

          <Link
            to="/"
            className="mt-6 flex items-center justify-center gap-1 text-xs text-muted-foreground hover:text-foreground py-3 px-2"
          >
            <Heart className="w-3 h-3" /> voltar ao site
          </Link>
        </div>
      </div>
    );
  }

  return JSXtoReturn;
}

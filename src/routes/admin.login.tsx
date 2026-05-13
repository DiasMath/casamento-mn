import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Heart, Lock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, ADMIN_EMAIL, ADMIN_PASSWORD } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export function AdminLogin() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  if (user?.email === ADMIN_EMAIL) {
    navigate("/admin/painel");
    return null;
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
        throw new Error("Credenciais inválidas");
      }

      await signInWithEmailAndPassword(auth, email, password);
      toast.success("Bem-vindo(a) ao painel!");
      navigate("/admin/painel");
    } catch (error) {
      toast.error("E-mail ou senha incorretos");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-pastel-gradient">
      <div className="w-full max-w-md bg-card rounded-3xl shadow-[var(--shadow-soft)] border border-border/60 p-8">
        <div className="flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-full bg-primary/30 flex items-center justify-center">
            <Lock className="w-6 h-6 text-primary-foreground" />
          </div>
          <h1 className="font-script text-3xl mt-4">Painel Administrativo</h1>
          <p className="text-sm text-muted-foreground mt-1">Entre para gerenciar a lista de presentes</p>
        </div>

        <form onSubmit={submit} className="mt-8 space-y-4">
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
            disabled={loading}
            className="w-full h-12 rounded-full bg-primary text-primary-foreground hover:opacity-90"
          >
            {loading ? "Entrando..." : "Entrar"}
          </Button>
        </form>

        <Link to="/" className="mt-6 flex items-center justify-center gap-1 text-xs text-muted-foreground hover:text-foreground">
          <Heart className="w-3 h-3" /> voltar ao site
        </Link>
      </div>
    </div>
  );
}
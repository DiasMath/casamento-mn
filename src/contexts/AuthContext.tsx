import { createContext, useContext, useEffect, useState, type ReactNode, useCallback } from "react";
import { onAuthStateChanged, signOut, type User } from "firebase/auth"; // Importamos o signOut estaticamente
import { auth, ADMIN_EMAIL } from "@/lib/firebase";

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Removido o useNavigate daqui, pois não era usado e poderia causar conflitos

  const logout = useCallback(async () => {
    try {
      if (auth) {
        await signOut(auth); // Usamos a função estática
      }
    } catch (error) {
      console.error("Logout error:", error);
    }
  }, []);

  useEffect(() => {
    // Garantimos que não quebra caso o Firebase falhe na inicialização
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    
    return unsubscribe;
  }, []);

  const isAdmin = user?.email === ADMIN_EMAIL;

  const value = {
    user,
    isAdmin,
    loading,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
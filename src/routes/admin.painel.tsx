import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Gift, TrendingUp, Users, ArrowRight, LogOut, Plus } from "lucide-react";
import { Gift as FirestoreGift } from "../lib/firestoreService";
import { brl } from "@/lib/format";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { AddGiftForm } from "./AddGiftForm";
import { EditGiftDialog } from "@/components/gifts/EditGiftDialog";
import { DeleteGiftDialog } from "@/components/gifts/DeleteGiftDialog";

export function AdminPainel() {
  const { user, isAdmin, loading, logout } = useAuth();
  const navigate = useNavigate();
  const [gifts, setGifts] = useState<FirestoreGift[]>([]);
  const [loadingGifts, setLoadingGifts] = useState(true);
  const [editingGift, setEditingGift] = useState<FirestoreGift | null>(null);
  const [deletingGift, setDeletingGift] = useState<{ id: string; title: string } | null>(null);

  useEffect(() => {
    if (!loading && !isAdmin) {
      navigate("/admin/login");
    }
  }, [loading, isAdmin, navigate]);

  useEffect(() => {
    const loadGifts = async () => {
      try {
        setLoadingGifts(true);
        const giftList = await import("../lib/firestoreService").then(
          (mod) => mod.getGifts()
        );
        setGifts(giftList);
      } catch (error) {
        console.error("Error loading gifts:", error);
      } finally {
        setLoadingGifts(false);
      }
    };

    loadGifts();
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/admin/login");
  };

  const handleEditGift = (gift: FirestoreGift) => {
    setEditingGift(gift);
  };

  const handleDeleteGift = (id: string) => {
    const gift = gifts.find(g => g.id === id);
    if (gift) {
      setDeletingGift({ id: gift.id, title: gift.title });
    }
  };

  const handleGiftUpdated = async () => {
    try {
      await loadGifts(); // Reload gifts
    } finally {
      setEditingGift(null);
    }
  };

  const handleGiftDeleted = async () => {
    try {
      await loadGifts(); // Reload gifts
    } finally {
      setDeletingGift(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  if (!isAdmin) return null;

  const totalRaised = gifts.reduce((s, g) => s + g.raised, 0);
  const totalValue = gifts.reduce((s, g) => s + g.total, 0);
  const completed = gifts.filter((g) => g.raised >= g.total).length;

  const stats = [
    { label: "Total arrecadado", value: brl(totalRaised), icon: TrendingUp },
    { label: "Meta da lista", value: brl(totalValue), icon: Gift },
    { label: "Presentes garantidos", value: `${completed} / ${gifts.length}`, icon: Users },
  ];

  return (
    <>
      <section className="px-4 pt-10 pb-20 max-w-5xl mx-auto">
        <div>
          <p className="font-script text-3xl text-primary">olá, noivos</p>
          <h1 className="text-3xl sm:text-4xl font-semibold mt-1">Painel Administrativo</h1>
          <p className="text-foreground/70 mt-2">Acompanhe os presentes e contribuições.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
          {stats.map((s) => (
            <div key={s.label} className="bg-card rounded-2xl p-5 border border-border/60 shadow-[var(--shadow-card)]">
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">{s.label}</p>
                <s.icon className="w-4 h-4 text-primary" />
              </div>
              <p className="text-2xl font-semibold mt-2">{s.value}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 bg-card rounded-2xl p-6 border border-border/60 shadow-[var(--shadow-card)] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="font-medium text-lg">Gerenciar presentes</h2>
            <p className="text-sm text-muted-foreground">Editar, excluir ou adicionar novos itens à lista.</p>
          </div>
          <div className="flex-1">
            <Link
              to="/cha-de-panela"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground font-medium hover:opacity-90 transition"
            >
              Ir para a lista <ArrowRight className="w-4 h-4" />
            </Link>
            <Button
              onClick={() => navigate("/admin/add-gift")}
              className="ml-2 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground font-medium hover:opacity-90 transition"
            >
              Novo Presente <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {gifts.length > 0 && (
          <div className="mt-8 bg-card rounded-2xl border border-border/60 shadow-[var(--shadow-card)] overflow-hidden">
            <div className="px-5 py-4 border-b border-border bg-secondary/40">
              <h2 className="font-medium">Últimas contribuições</h2>
            </div>
            <ul className="divide-y divide-border">
              {gifts
                .slice(0, 5)
                .map((g, i) => (
                  <li key={g.id} className="px-5 py-4 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{g.title}</p>
                      <p className="text-xs text-muted-foreground">Convidado #{i + 1}</p>
                    </div>
                    <span className="text-sm font-medium tabular-nums">{brl(Math.round(g.raised / 2))}</span>
                  </li>
                ))}
            </ul>
          </div>
        )}

        {!loadingGifts && gifts.length === 0 && (
          <div className="mt-8 text-center py-8">
            <p className="text-sm text-muted-foreground">
              Nenhum presente encontrado. Clique em "Novo Presente" para adicionar o primeiro item.
            </p>
          </div>
        )}
      </section>

      {editingGift && (
        <EditGiftDialog
          gift={editingGift}
          open={editingGift !== null}
          onOpenChange={(open) => {
            if (!open) setEditingGift(null);
            else if (open && editingGift) setEditingGift(editingGift);
          }}
          onGiftUpdated={handleGiftUpdated}
        />
      )}

      {deletingGift && (
        <DeleteGiftDialog
          giftId={deletingGift.id}
          giftTitle={deletingGift.title}
          open={deletingGift !== null}
          onOpenChange={(open) => {
            if (!open) setDeletingGift(null);
          }}
          onGiftDeleted={handleGiftDeleted}
        />
      )}
    </>
  );
}
import { useEffect, useState, useCallback } from "react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { GiftCard } from "@/components/gifts/GiftCard";
import { AddGiftFAB } from "@/components/gifts/AddGiftFAB";
import { getGifts, Gift } from "@/lib/firestoreService";
import { useAuth } from "@/contexts/AuthContext"; // <-- MUDOU AQUI

export function PresentList() {
  // Pega o isAdmin real do Firebase em vez do modo simulado
  const { isAdmin } = useAuth(); // <-- MUDOU AQUI

  const [gifts, setGifts] = useState<Gift[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchGifts = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getGifts();
      setGifts(data);
    } catch (error) {
      console.error("Erro ao carregar presentes:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGifts();
  }, [fetchGifts]);

  return (
    <SiteLayout>
      <section className="px-4 pt-10 pb-6">
        <div className="max-w-6xl mx-auto text-center">
          <p className="font-script text-3xl text-primary">chá de panela</p>
          <h1 className="text-3xl sm:text-4xl font-semibold mt-2">
            Lista de Presentes
          </h1>
          <p className="mt-4 text-foreground/70 max-w-xl mx-auto">
            Gerencie a lista de presentes diretamente por aqui.
          </p>
        </div>
      </section>

      <section className="px-4 pb-20">
        {loading ? (
          <div className="flex justify-center py-20">Carregando...</div>
        ) : (
          <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {gifts.map((g) => (
              <GiftCard key={g.id} gift={g} onUpdate={fetchGifts} />
            ))}
          </div>
        )}
      </section>

      {/* Renderiza o botão apenas se for o Admin verificado pelo Firebase */}
      {isAdmin && <AddGiftFAB onGiftAdded={fetchGifts} />}
    </SiteLayout>
  );
}

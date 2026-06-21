import { useEffect, useState, useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { ChaLayout } from "@/components/layout/ChaLayout";
import { GiftCard } from "@/components/gifts/GiftCard";
import { AddGiftFAB } from "@/components/gifts/AddGiftFAB";
import { GiftFilters } from "@/components/gifts/GiftFilters";
import type { GiftFiltersState } from "@/components/gifts/GiftFilters";
import { getGifts, getVisibleGifts, Gift } from "@/lib/firestoreService";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export function ChaDePanela() {
  const { isAdmin } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [gifts, setGifts] = useState<Gift[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<GiftFiltersState>({
    search: "",
    category: "todas",
    priority: "todas",
    showCompleted: true,
  });

  const fetchGifts = useCallback(async () => {
    try {
      setLoading(true);
      const data = isAdmin ? await getGifts() : await getVisibleGifts();
      setGifts(data);
    } catch (error) {
      console.error("Erro ao carregar presentes:", error);
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    fetchGifts();
  }, [fetchGifts, isAdmin]);

  // Handle Mercado Pago payment return
  useEffect(() => {
    const payment = searchParams.get("payment");
    if (payment) {
      if (payment === "success") {
        toast.success("Pagamento confirmado! Obrigado pelo carinho!");
      } else if (payment === "pending") {
        toast.info("Pagamento pendente. Assim que for confirmado, atualizaremos a lista!");
      } else if (payment === "failure") {
        toast.error("Pagamento não foi concluído. Tente novamente.");
      }
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const filteredGifts = useMemo(() => {
    return gifts.filter((g) => {
      if (filters.category !== "todas" && g.category !== filters.category)
        return false;
      if (filters.priority !== "todas" && g.priority !== filters.priority)
        return false;
      if (!filters.showCompleted && g.raised >= g.total) return false;
      if (
        filters.search &&
        !g.title.toLowerCase().includes(filters.search.toLowerCase())
      )
        return false;
      return true;
    });
  }, [gifts, filters]);

  return (
    <ChaLayout>
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
          <div className="max-w-6xl mx-auto space-y-6">
            <GiftFilters
              filters={filters}
              onFilterChange={setFilters}
              isAdmin={isAdmin}
            />
            {filteredGifts.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p className="text-sm">
                  Nenhum presente encontrado com os filtros selecionados.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredGifts.map((g) => (
                  <GiftCard key={g.id} gift={g} onUpdate={fetchGifts} />
                ))}
              </div>
            )}
          </div>
        )}
      </section>

      {isAdmin && <AddGiftFAB onGiftAdded={fetchGifts} />}
    </ChaLayout>
  );
}

import { useEffect, useState, useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { ChaLayout } from "@/components/layout/ChaLayout";
import { ChaHero } from "@/components/cha/ChaHero";
import { ChaDetails } from "@/components/cha/ChaDetails";
import { ChaCountdown } from "@/components/cha/ChaCountdown";
import { devLog } from "@/lib/devLog";
import { GiftCard } from "@/components/gifts/GiftCard";
import { AddGiftFAB } from "@/components/gifts/AddGiftFAB";
import { GiftFilters } from "@/components/gifts/GiftFilters";
import type { GiftFiltersState } from "@/components/gifts/GiftFilters";
import { getGifts, getVisibleGifts, Gift } from "@/lib/firestoreService";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Branch } from "@/components/decor/Flower";

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
      devLog.error("Erro ao carregar presentes:", error);
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
        toast.info(
          "Pagamento pendente. Assim que for confirmado, atualizaremos a lista!",
        );
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
      <ChaHero />

      <ChaDetails />

      <ChaCountdown />

      <section className="relative px-4 py-16 sm:py-20">
        <Branch
          className="absolute top-0 right-0 hidden sm:block"
          size={120}
          rotate={165}
          opacity={0.25}
        />
        <Branch
          className="absolute bottom-0 left-0 hidden sm:block"
          size={120}
          rotate={-5}
          opacity={0.25}
        />

        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <p className="font-script text-3xl sm:text-4xl text-primary">
              nossa lista
            </p>
            <h2 className="text-2xl sm:text-3xl font-semibold mt-2">
              Presentes
            </h2>
            <p className="mt-3 text-foreground/70 max-w-xl mx-auto">
              Sua presença é o maior presente, mas se quiser nos ajudar a
              montar nosso lar, ficaremos muito felizes!
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">Carregando...</div>
          ) : (
            <div className="space-y-6">
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
        </div>
      </section>

      {isAdmin && <AddGiftFAB onGiftAdded={fetchGifts} />}
    </ChaLayout>
  );
}

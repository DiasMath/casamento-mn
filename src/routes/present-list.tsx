import { useEffect, useState, useCallback, useMemo } from "react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { devLog } from "@/lib/devLog";
import { GiftCard } from "@/components/gifts/GiftCard";
import { AddGiftFAB } from "@/components/gifts/AddGiftFAB";
import { GiftFilters } from "@/components/gifts/GiftFilters";
import type { GiftFiltersState } from "@/components/gifts/GiftFilters";
import { getGifts, getVisibleGifts, Gift } from "@/lib/firestoreService";
import { useAuth } from "@/contexts/AuthContext";

export function PresentList() {
  const { isAdmin } = useAuth();

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
      // Admin vê todos, público vê apenas visíveis
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

      {/* Renderiza o botão apenas se for o Admin verificado pelo Firebase */}
      {isAdmin && <AddGiftFAB onGiftAdded={fetchGifts} />}
    </SiteLayout>
  );
}

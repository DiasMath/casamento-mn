import { useEffect, useState, useCallback, useMemo, useRef } from "react";
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
import { getGifts, getVisibleGifts, Gift, getColorPalette, type ColorPalette } from "@/lib/firestoreService";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Branch } from "@/components/decor/Flower";

export function ChaDePanela() {
  const { isAdmin } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const giftSectionRef = useRef<HTMLDivElement>(null);

  const [gifts, setGifts] = useState<Gift[]>([]);
  const [loading, setLoading] = useState(true);
  const [palette, setPalette] = useState<ColorPalette[]>([]);
  const [filters, setFilters] = useState<GiftFiltersState>({
    search: "",
    category: "todas",
    priority: "todas",
    showCompleted: true,
  });

  const fetchGifts = useCallback(async (scrollToTop?: boolean) => {
    try {
      setLoading(true);
      const data = isAdmin ? await getGifts() : await getVisibleGifts();
      setGifts(data);
      if (scrollToTop && giftSectionRef.current) {
        giftSectionRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    } catch (error) {
      devLog.error("Erro ao carregar presentes:", error);
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    fetchGifts();
    getColorPalette().then(setPalette).catch(() => {});
  }, [fetchGifts, isAdmin]);

  const handleGiftUpdate = useCallback(() => {
    fetchGifts(true);
  }, [fetchGifts]);

  // Scroll to gift section when filters change
  useEffect(() => {
    if (giftSectionRef.current) {
      giftSectionRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [filters]);

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

      <section className="relative px-4 py-16 sm:py-20 overflow-hidden">
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
              Sua presença é o maior presente, mas se quiser nos ajudar a montar
              nosso lar, ficaremos muito felizes!
            </p>
            <div className="mt-12 px-6 sm:px-10 py-10 sm:py-12 bg-card border-2 border-primary rounded-[2rem] max-w-2xl mx-auto shadow-[0_0_30px_rgba(0,0,0,0.08)] relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-accent/10 rounded-full blur-3xl pointer-events-none" />
              <div className="relative text-center mb-8">
                <div className="inline-flex items-center gap-2 px-5 py-2 bg-primary/15 rounded-full mb-5 animate-bounce">
                  <span className="text-base">⚠️</span>
                  <span className="text-xs font-bold text-primary uppercase tracking-wider">Atenção</span>
                </div>
                <p className="font-script text-4xl sm:text-5xl text-primary mb-3">Paleta de Cores</p>
                <div className="w-20 h-1 bg-primary/40 mx-auto rounded-full mb-5" />
                <p className="text-base text-foreground/80 max-w-md mx-auto leading-relaxed font-medium">
                  Para manter a harmonia do nosso lar, pedimos que sigam a paleta de cores abaixo ao escolher os presentes
                </p>
              </div>
              <div className="relative flex items-center justify-center gap-5 sm:gap-8 flex-wrap">
                {palette.map((color, idx) => (
                  <div key={color.id} className="flex flex-col items-center gap-3 group" style={{ animationDelay: `${idx * 100}ms` }}>
                    <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-full border-[3px] sm:border-4 border-white shadow-lg sm:shadow-xl ring-2 ring-primary/20 transition-all duration-300 group-hover:scale-110 group-hover:ring-4 group-hover:ring-primary/40 group-hover:shadow-2xl cursor-default" style={{ backgroundColor: color.hex }} />
                    <span className="text-xs sm:text-sm font-bold tracking-wide text-foreground/80 uppercase">{color.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">Carregando...</div>
          ) : (
            <div className="space-y-6" ref={giftSectionRef}>
              <GiftFilters
                filters={filters}
                onFilterChange={setFilters}
                isAdmin={isAdmin}
              />
              <div className="rounded-2xl bg-secondary/20 p-1">
                {filteredGifts.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <p className="text-sm">
                      Nenhum presente encontrado com os filtros selecionados.
                    </p>
                  </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-1">
                      {filteredGifts.map((g) => (
                        <GiftCard key={g.id} gift={g} onUpdate={handleGiftUpdate} />
                      ))}
                    </div>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {isAdmin && <AddGiftFAB onGiftAdded={fetchGifts} />}
    </ChaLayout>
  );
}

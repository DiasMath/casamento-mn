import { SiteLayout } from "@/components/layout/SiteLayout";
import { GiftCard } from "@/components/gifts/GiftCard";
import { AddGiftFAB } from "@/components/gifts/AddGiftFAB";
import { mockGifts } from "@/data/mockGifts";
import { useViewMode } from "@/contexts/ViewModeContext";

export function ChaDePanela() {
  const { mode } = useViewMode();
  return (
    <SiteLayout>
      <section className="px-4 pt-10 pb-6">
        <div className="max-w-6xl mx-auto text-center">
          <p className="font-script text-3xl text-primary">chá de panela</p>
          <h1 className="text-3xl sm:text-4xl font-semibold mt-2">Lista de Presentes</h1>
          <p className="mt-4 text-foreground/70 max-w-xl mx-auto">
            Cada presente tem um valor total — você pode contribuir com a quantia que quiser. Quando a barra
            atinge 100%, ele está garantido. Obrigado pelo carinho!
          </p>
        </div>
      </section>

      <section className="px-4 pb-20">
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {mockGifts.map((g) => (
            <GiftCard key={g.id} gift={g} />
          ))}
        </div>
      </section>

      {mode === "admin" && <AddGiftFAB />}
    </SiteLayout>
  );
}

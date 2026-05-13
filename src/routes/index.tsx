import { SiteLayout } from "@/components/layout/SiteLayout";
import { Hero } from "@/components/home/Hero";
import { Countdown } from "@/components/home/Countdown";
import { NossaHistoria } from "@/components/home/NossaHistoria";
import { OndeVaiSer } from "@/components/home/OndeVaiSer";
import { RSVP } from "@/components/home/RSVP";
import { Recados } from "@/components/home/Recados";
import { GiftCard } from "@/components/gifts/GiftCard";
import { mockGifts } from "@/data/mockGifts";
import { Link } from "react-router-dom";

export function Index() {
  return (
    <SiteLayout>
      <Hero />
      <Countdown />
      <NossaHistoria />
      <OndeVaiSer />

      <section id="presentes" className="px-4 py-16 sm:py-20 bg-secondary/40" style={{ scrollMarginTop: "80px" }}>
        <div className="max-w-6xl mx-auto text-center">
          <p className="font-script text-3xl text-primary">lista de presentes</p>
          <h2 className="text-2xl sm:text-3xl font-semibold mt-2">Escolha seu presente</h2>
          <p className="mt-3 text-sm text-foreground/70 max-w-lg mx-auto">
            Cada presente tem um valor total — você pode contribuir com a quantia que quiser. Quando a barra atinge 100%, ele está garantido. Obrigado pelo carinho!
          </p>
        </div>

        <div className="max-w-4xl mx-auto mt-6 grid grid-cols-2 sm:grid-cols-3 gap-4 max-h-[500px] overflow-y-auto pr-2">
          {mockGifts.map((g) => (
            <GiftCard key={g.id} gift={g} />
          ))}
        </div>

        <div className="text-center mt-6">
          <Link to="/cha-de-panela" className="text-sm text-primary hover:underline">
            Ver todos os presentes →
          </Link>
        </div>
      </section>

      <RSVP />
      <Recados />
    </SiteLayout>
  );
}
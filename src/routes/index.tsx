import { SiteLayout } from "@/components/layout/SiteLayout";
import { Hero } from "@/components/home/Hero";
import { Countdown } from "@/components/home/Countdown";
import { NossaHistoria } from "@/components/home/NossaHistoria";
import { OndeVaiSer } from "@/components/home/OndeVaiSer";
import { RSVP } from "@/components/home/RSVP";
import { Recados } from "@/components/home/Recados";
import { GiftListSection } from "@/components/home/GiftListSection";
import { Link } from "react-router-dom";

export function Index() {
  return (
    <SiteLayout>
      <main id="main-content">
        <Hero />
        <Countdown />
        <NossaHistoria />
        <OndeVaiSer />
        <GiftListSection />
        <RSVP />
        <Recados />
      </main>
    </SiteLayout>
  );
}

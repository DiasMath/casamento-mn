import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { Hero } from "@/components/home/Hero";
import { Countdown } from "@/components/home/Countdown";
import { NossaHistoria } from "@/components/home/NossaHistoria";
import { OndeVaiSer } from "@/components/home/OndeVaiSer";
import { RSVP } from "@/components/home/RSVP";
import { Recados } from "@/components/home/Recados";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Helena & Mateus — Save the Date" },
      { name: "description", content: "Nossa história, nosso casamento e save the date." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <SiteLayout>
      <Hero />
      <Countdown />
      <NossaHistoria />
      <OndeVaiSer />
      <RSVP />
      <Recados />
    </SiteLayout>
  );
}

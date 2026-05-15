import { MapPin, Clock, Calendar } from "lucide-react";
import { WEDDING_DATE, WEDDING_VENUE } from "@/lib/constants";
import { Flower, Branch, Garland } from "@/components/decor/Flower";

const formattedDate = WEDDING_DATE.toLocaleDateString("pt-BR", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

export function OndeVaiSer() {
  return (
    <section
      id="casamento"
      className="relative px-4 py-16 sm:py-24 overflow-hidden"
      style={{ scrollMarginTop: "80px" }}
    >
      <Flower
        className="absolute top-8 -left-4"
        size={70}
        variant="yellow"
        rotate={-15}
        opacity={0.5}
      />
      <Flower
        className="absolute top-20 right-8"
        size={55}
        variant="blue"
        rotate={25}
        opacity={0.45}
      />
      <Branch
        className="absolute top-0 right-0 hidden sm:block"
        size={120}
        rotate={165}
        opacity={0.35}
      />
      <Flower
        className="absolute bottom-12 left-4"
        size={65}
        variant="mixed"
        rotate={-30}
        opacity={0.5}
      />
      <Flower
        className="absolute bottom-24 right-6 hidden sm:block"
        size={45}
        variant="yellow"
        rotate={20}
        opacity={0.4}
      />
      <Branch
        className="absolute bottom-0 left-0 hidden sm:block"
        size={130}
        rotate={-5}
        opacity={0.35}
      />
      <Garland
        className="absolute -bottom-4 left-1/2 -translate-x-1/2 hidden sm:block"
        size={250}
        rotate={180}
        opacity={0.3}
      />
      <div className="max-w-5xl mx-auto">
        <div className="text-center max-w-2xl mx-auto">
          <p className="font-script text-3xl text-primary">onde vai ser</p>
          <h2 className="text-2xl sm:text-3xl font-semibold mt-2">
            O grande dia
          </h2>
        </div>

        <div className="mt-10 grid md:grid-cols-2 gap-6">
          <div className="bg-card rounded-3xl p-6 sm:p-8 shadow-[var(--shadow-card)] border border-border/60 space-y-5">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5 text-accent-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Local</p>
                <p className="font-medium">{WEDDING_VENUE.name}</p>
                <p className="text-sm text-foreground/70">
                  {WEDDING_VENUE.address}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/40 flex items-center justify-center shrink-0">
                <Calendar className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Data</p>
                <p className="font-medium capitalize">{formattedDate}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5 text-accent-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Horário</p>
                <p className="font-medium">Cerimônia às 16h00</p>
                <p className="text-sm text-foreground/70">
                  Recepção logo após a cerimônia
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-3xl overflow-hidden shadow-[var(--shadow-card)] border border-border/60 min-h-[300px] bg-pastel-gradient relative">
            <iframe
              title="Mapa"
              src={`https://www.google.com/maps?q=${encodeURIComponent(WEDDING_VENUE.city)}&output=embed`}
              className="absolute inset-0 w-full h-full"
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

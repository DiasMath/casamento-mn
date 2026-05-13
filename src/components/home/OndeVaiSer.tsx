import { MapPin, Clock, Calendar } from "lucide-react";

export function OndeVaiSer() {
  return (
    <section id="casamento" className="px-4 py-16 sm:py-24">
      <div className="max-w-5xl mx-auto">
        <div className="text-center max-w-2xl mx-auto">
          <p className="font-script text-3xl text-primary">onde vai ser</p>
          <h2 className="text-2xl sm:text-3xl font-semibold mt-2">O grande dia</h2>
        </div>

        <div className="mt-10 grid md:grid-cols-2 gap-6">
          <div className="bg-card rounded-3xl p-6 sm:p-8 shadow-[var(--shadow-card)] border border-border/60 space-y-5">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5 text-accent-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Local</p>
                <p className="font-medium">Quinta dos Jardins</p>
                <p className="text-sm text-foreground/70">Estrada das Acácias, 1200 — Itaipava, RJ</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/40 flex items-center justify-center shrink-0">
                <Calendar className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Data</p>
                <p className="font-medium">Sábado, 14 de Novembro de 2026</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5 text-accent-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Horário</p>
                <p className="font-medium">Cerimônia às 16h00</p>
                <p className="text-sm text-foreground/70">Recepção logo após a cerimônia</p>
              </div>
            </div>
          </div>
          <div className="rounded-3xl overflow-hidden shadow-[var(--shadow-card)] border border-border/60 min-h-[300px] bg-pastel-gradient relative">
            <iframe
              title="Mapa"
              src="https://www.google.com/maps?q=Itaipava+RJ&output=embed"
              className="absolute inset-0 w-full h-full"
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

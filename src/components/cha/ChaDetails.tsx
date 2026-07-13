import { MapPin, Clock, Calendar } from "lucide-react";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { Flower, Branch } from "@/components/decor/Flower";

export function ChaDetails() {
  const { settings, loading: settingsLoading } = useSiteSettings();

  if (settingsLoading) return null;

  const chaDate = new Date(`${settings.chaDate}T${settings.chaTime}:00`);

  const formattedDate = chaDate.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const formattedTime = chaDate.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <section className="relative px-4 py-16 sm:py-20 overflow-hidden">
      <Flower
        className="absolute top-8 -left-4"
        size={55}
        variant="yellow"
        rotate={-15}
        opacity={0.35}
      />
      <Flower
        className="absolute bottom-10 right-4"
        size={45}
        variant="blue"
        rotate={20}
        opacity={0.3}
      />
      <Branch
        className="absolute bottom-0 left-0 hidden sm:block"
        size={110}
        rotate={-5}
        opacity={0.25}
      />

      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <p className="font-script text-3xl sm:text-4xl text-primary">
            data e local
          </p>
          <h2 className="text-2xl sm:text-3xl font-semibold mt-2">
            Estamos te esperando!
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          <div className="bg-card rounded-3xl p-6 sm:p-8 shadow-[var(--shadow-card)] border border-border/60 space-y-5">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center shrink-0">
                <Calendar className="w-5 h-5 text-accent-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Data</p>
                <p className="font-medium capitalize">{formattedDate}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/40 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Horário</p>
                <p className="font-medium">Às {formattedTime}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5 text-accent-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Local</p>
                <p className="font-medium">{settings.chaVenueAddress}</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl overflow-hidden shadow-[var(--shadow-card)] border border-border/60 min-h-[250px] sm:min-h-0 bg-pastel-gradient relative">
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-center p-6 bg-gradient-to-br from-primary/5 to-accent/10">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <MapPin className="w-8 h-8 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground text-lg">{settings.chaVenueAddress}</p>
              </div>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(settings.chaVenueAddress)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-full text-sm font-medium hover:opacity-90 transition-opacity"
              >
                <MapPin className="w-4 h-4" />
                Abrir no Google Maps
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

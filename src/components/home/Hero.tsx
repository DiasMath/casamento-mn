import heroImg from "@/assets/hero-couple.jpg";
import { COUPLE, WEDDING_DATE } from "@/data/mockGifts";

const dateStr = WEDDING_DATE.toLocaleDateString("pt-BR", {
  day: "2-digit",
  month: "long",
  year: "numeric",
});

export function Hero() {
  return (
    <section id="save-date" className="relative min-h-[88vh] flex items-center justify-center overflow-hidden">
      <img
        src={heroImg}
        alt="Foto dos noivos"
        width={1536}
        height={1024}
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/30 to-background/90" />
      <div className="relative z-10 px-6 text-center max-w-2xl">
        <p className="uppercase tracking-[0.4em] text-xs sm:text-sm text-primary-foreground/80 bg-primary/70 inline-block px-4 py-1.5 rounded-full backdrop-blur">
          Save the Date
        </p>
        <h1 className="font-script text-6xl sm:text-7xl md:text-8xl mt-6 leading-[0.95] text-foreground drop-shadow-sm">
          {COUPLE.bride}
          <span className="block text-4xl sm:text-5xl md:text-6xl text-primary my-2">&</span>
          {COUPLE.groom}
        </h1>
        <p className="mt-8 text-base sm:text-lg text-foreground/80">
          Vamos casar em
        </p>
        <p className="mt-1 text-xl sm:text-2xl font-medium text-foreground capitalize">
          {dateStr}
        </p>
        <p className="mt-6 text-sm text-muted-foreground italic max-w-md mx-auto">
          "E que assim seja, para todo o sempre."
        </p>
      </div>
    </section>
  );
}

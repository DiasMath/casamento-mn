import { useState, useEffect, useCallback } from "react";
import c1Fallback from "@/assets/hero-couple.jpg";
import c2Fallback from "@/assets/story-1.jpg";
import c3Fallback from "@/assets/story-2.jpg";
import c4Fallback from "@/assets/story-3.jpg";
import c5Fallback from "@/assets/story-4.jpg";
import { COUPLE, WEDDING_DATE } from "@/lib/constants";
import { Flower, Branch, Vine } from "@/components/decor/Flower";
import { getSiteImages } from "@/lib/firestoreService";

const dateStr = WEDDING_DATE.toLocaleDateString("pt-BR", {
  day: "2-digit",
  month: "long",
  year: "numeric",
});

const INTERVAL = 3000;

const FALLBACKS = [
  c1Fallback,
  c2Fallback,
  c3Fallback,
  c4Fallback,
  c5Fallback,
  c1Fallback,
];

export function Hero() {
  const [images, setImages] = useState<string[]>(FALLBACKS);
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    getSiteImages().then((imgs) => {
      const list = [
        imgs.carousel1 || FALLBACKS[0],
        imgs.carousel2 || FALLBACKS[1],
        imgs.carousel3 || FALLBACKS[2],
        imgs.carousel4 || FALLBACKS[3],
        imgs.carousel5 || FALLBACKS[4],
        imgs.carousel6 || FALLBACKS[5],
      ];
      if (list.some((img, i) => img !== images[i])) setImages(list);
    });
  }, []);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % images.length);
  }, [images.length]);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(next, INTERVAL);
    return () => clearInterval(id);
  }, [next, paused]);

  return (
    <section
      id="save-date"
      className="relative min-h-[88vh] flex items-center justify-center overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {images.map((src, i) => (
        <img
          key={`${src}-${i}`}
          src={src}
          alt="Foto dos noivos"
          width={1536}
          height={1024}
          loading={i === 0 ? "eager" : "lazy"}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-[1500ms] ease-in-out ${
            i === current ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}

      <div className="absolute inset-0 z-[1] bg-gradient-to-b from-background/50 via-background/30 to-background/90" />

      <Branch
        className="absolute top-0 left-0 z-10"
        size={140}
        rotate={-15}
        opacity={0.5}
      />
      <Vine
        className="absolute top-20 -left-8 z-10"
        size={120}
        rotate={10}
        opacity={0.45}
      />
      <Flower
        className="absolute top-28 left-8 sm:left-16 z-10"
        size={80}
        variant="yellow"
        rotate={-20}
        opacity={0.9}
      />
      <Flower
        className="absolute top-40 right-4 sm:right-12 z-10"
        size={60}
        variant="blue"
        rotate={15}
        opacity={0.85}
      />
      <Flower
        className="absolute top-16 right-20 z-10 hidden sm:block"
        size={45}
        variant="mixed"
        rotate={35}
        opacity={0.75}
      />
      <Branch
        className="absolute top-0 right-0 z-10"
        size={160}
        rotate={170}
        opacity={0.45}
      />
      <Flower
        className="absolute bottom-32 left-6 sm:left-20 z-10"
        size={70}
        variant="blue"
        rotate={-25}
        opacity={0.85}
      />
      <Flower
        className="absolute bottom-20 right-8 sm:right-24 z-10"
        size={55}
        variant="yellow"
        rotate={40}
        opacity={0.8}
      />
      <Flower
        className="absolute bottom-40 right-16 z-10 hidden sm:block"
        size={40}
        variant="mixed"
        rotate={-15}
        opacity={0.7}
      />
      <Branch
        className="absolute bottom-0 left-0 z-10"
        size={180}
        rotate={-5}
        opacity={0.4}
      />
      <Vine
        className="absolute bottom-0 right-0 z-10"
        size={100}
        rotate={-10}
        opacity={0.35}
      />

      <div className="relative z-10 px-6 text-center max-w-2xl">
        <p className="uppercase tracking-[0.4em] text-xs sm:text-sm text-primary-foreground/80 bg-primary/70 inline-block px-4 py-1.5 rounded-full backdrop-blur">
          Save the Date
        </p>
        <h1 className="font-script text-6xl sm:text-7xl md:text-8xl mt-6 leading-[0.95] text-foreground drop-shadow-sm">
          {COUPLE.groom}
          <span className="block text-4xl sm:text-5xl md:text-6xl text-primary my-2">
            &
          </span>
          {COUPLE.bride}
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

        <div className="flex justify-center gap-2 mt-8">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === current
                  ? "bg-foreground w-6"
                  : "bg-foreground/40 w-2 hover:bg-foreground/60"
              }`}
              aria-label={`Imagem ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

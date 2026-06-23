import { useState, useEffect, useCallback } from "react";
import c1Fallback from "@/assets/hero-couple.jpg";
import c2Fallback from "@/assets/story-1.jpg";
import c3Fallback from "@/assets/story-2.jpg";
import c4Fallback from "@/assets/story-3.jpg";
import c5Fallback from "@/assets/story-4.jpg";
import { COUPLE } from "@/lib/constants";
import { Branch, Flower } from "@/components/decor/Flower";
import { getSiteImages } from "@/lib/firestoreService";

const INTERVAL = 3000;

const FALLBACKS = [
  c1Fallback,
  c2Fallback,
  c3Fallback,
  c4Fallback,
  c5Fallback,
  c1Fallback,
];

export function ChaHero() {
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
      className="relative h-[80vh] min-h-[560px] w-full overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {images.map((src, i) => (
        <img
          key={`${src}-${i}`}
          src={src}
          alt={`Foto do casal ${i + 1}`}
          loading={i === 0 ? "eager" : "lazy"}
          className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-[1500ms] ease-in-out ${
            i === current ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}

      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-black/40" />

      <Branch
        className="absolute top-0 left-0 hidden sm:block"
        size={140}
        rotate={-10}
        opacity={0.2}
      />
      <Branch
        className="absolute top-0 right-0 hidden sm:block"
        size={140}
        rotate={190}
        opacity={0.2}
      />
      <Flower
        className="absolute bottom-20 left-4 hidden sm:block"
        size={45}
        variant="yellow"
        rotate={-20}
        opacity={0.2}
      />
      <Flower
        className="absolute bottom-24 right-6 hidden sm:block"
        size={35}
        variant="blue"
        rotate={15}
        opacity={0.15}
      />

      <div className="relative z-10 flex flex-col items-center justify-end h-full text-center text-white px-6 pb-16 sm:pb-20">
        <p className="uppercase tracking-[0.4em] text-[10px] sm:text-xs bg-primary/70 inline-block px-4 py-1.5 rounded-full backdrop-blur text-primary-foreground/90">
          Chá de Panela
        </p>

        <h1 className="font-script text-6xl sm:text-7xl md:text-8xl mt-6 leading-[0.95] drop-shadow-sm">
          {COUPLE.groom}
          <span className="block text-4xl sm:text-5xl md:text-6xl text-primary my-2">
            &amp;
          </span>
          {COUPLE.bride}
        </h1>

        <div className="mt-6 w-10 h-px bg-white/30" />

        <p className="mt-4 text-sm sm:text-base text-white/75 tracking-wide">
          30 de setembro · 14h
        </p>
      </div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex gap-2">
        {images.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === current
                ? "bg-white w-6"
                : "bg-white/40 w-2 hover:bg-white/60"
            }`}
            aria-label={`Imagem ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}

import { useState, useEffect, useCallback } from "react";
import c1Fallback from "@/assets/hero-couple.jpg";
import c2Fallback from "@/assets/story-1.jpg";
import c3Fallback from "@/assets/story-2.jpg";
import c4Fallback from "@/assets/story-3.jpg";
import c5Fallback from "@/assets/story-4.jpg";
import { useSiteSettings } from "@/hooks/useSiteSettings";
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
  const { settings, loading: settingsLoading } = useSiteSettings();
  const [images, setImages] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);

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
      setImages(list);
      setLoaded(true);
    });
  }, []);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % (images.length || 1));
  }, [images.length]);

  const prev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + (images.length || 1)) % (images.length || 1));
  }, [images.length]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const delta = e.changedTouches[0].clientX - touchStart;
    if (Math.abs(delta) > 50) {
      if (delta > 0) prev();
      else next();
    }
    setTouchStart(null);
  };

  useEffect(() => {
    if (paused || !loaded || images.length === 0) return;
    const id = setInterval(next, INTERVAL);
    return () => clearInterval(id);
  }, [next, paused, loaded, images.length]);

  const isReady = loaded && !settingsLoading;

  return (
    <section
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {isReady && images.map((src, i) => (
        <img
          key={`${src}-${i}`}
          src={src}
          alt={`Foto do casal ${i + 1}`}
          loading={i === 0 ? "eager" : "lazy"}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-[1500ms] ease-in-out ${
            i === current ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}

      {isReady && (
        <>
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-black/40" />

          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <Branch
              className="absolute -top-4 -left-4 hidden sm:block"
              size={120}
              rotate={0}
              opacity={0.2}
            />
            <Branch
              className="absolute -top-4 -right-4 hidden sm:block"
              size={120}
              rotate={180}
              opacity={0.2}
            />
          </div>

          <div className="relative z-10 flex flex-col items-center justify-end h-full text-center text-white px-6 pb-12 sm:pb-16 animate-fade-in">
            <p className="uppercase tracking-[0.4em] text-[10px] sm:text-xs bg-primary/70 inline-block px-4 py-1.5 rounded-full backdrop-blur text-primary-foreground/90">
              Chá de Panela
            </p>

            <h1 className="font-script text-6xl sm:text-7xl md:text-8xl mt-6 leading-[0.95] drop-shadow-sm">
              {settings.coupleGroom}
              <span className="block text-4xl sm:text-5xl md:text-6xl text-primary my-2">
                &amp;
              </span>
              {settings.coupleBride}
            </h1>

            <div className="mt-6 w-10 h-px bg-white/30" />

            <p className="mt-4 text-sm sm:text-base text-white/75 tracking-wide">
              {new Date(`${settings.chaDate}T12:00:00`).toLocaleDateString("pt-BR", { day: "numeric", month: "long" })} · {settings.chaTime}h
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
        </>
      )}
    </section>
  );
}

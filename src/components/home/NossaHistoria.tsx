import s1 from "@/assets/story-1.jpg";
import s2 from "@/assets/story-2.jpg";
import s3 from "@/assets/story-3.jpg";
import s4 from "@/assets/story-4.jpg";

const photos = [s1, s2, s3, s4];

export function NossaHistoria() {
  return (
    <section id="historia" className="px-4 py-16 sm:py-24 bg-secondary/40">
      <div className="max-w-5xl mx-auto">
        <div className="text-center max-w-2xl mx-auto">
          <p className="font-script text-3xl text-primary">nossa história</p>
          <h2 className="text-2xl sm:text-3xl font-semibold mt-2">Onde tudo começou</h2>
          <p className="mt-5 text-foreground/80 leading-relaxed">
            Nos conhecemos numa tarde qualquer que virou a mais especial das nossas vidas. Entre cafés,
            viagens e madrugadas conversando, descobrimos que casa é onde estamos juntos. Agora é a hora
            de oficializar o que o coração já sabe há muito tempo.
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mt-12">
          {photos.map((src, i) => (
            <div
              key={i}
              className={`overflow-hidden rounded-2xl shadow-[var(--shadow-card)] ${
                i % 3 === 0 ? "row-span-2 aspect-[3/5]" : "aspect-square"
              }`}
            >
              <img
                src={src}
                alt={`Momento ${i + 1}`}
                loading="lazy"
                className="w-full h-full object-cover hover:scale-105 transition duration-700"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

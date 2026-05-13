import s1 from "@/assets/story-1.jpg";
import s2 from "@/assets/story-2.jpg";
import s3 from "@/assets/story-3.jpg";
import s4 from "@/assets/story-4.jpg";
import { Flower, Sprig } from "@/components/decor/Flower";

interface Chapter {
  eyebrow: string;
  title: string;
  text: string;
  image: string;
}

const chapters: Chapter[] = [
  {
    eyebrow: "Capítulo 01 — 2019",
    title: "O primeiro olhar",
    text:
      "Foi numa tarde de outono, num café pequeno do centro. Ela pediu um cappuccino, ele um espresso. Bastou um sorriso tímido para que duas histórias começassem a se encontrar — sem que nenhum dos dois soubesse, ainda, do tamanho do que viria.",
    image: s1,
  },
  {
    eyebrow: "Capítulo 02 — 2020",
    title: "Cartas, ligações e madrugadas",
    text:
      "O mundo desacelerou e a gente acelerou por dentro. Conversas que viravam o dia, playlists trocadas, planos desenhados no papel. Foi quando entendemos que distância nenhuma seria capaz de afastar dois corações que já tinham combinado de ficar.",
    image: s2,
  },
  {
    eyebrow: "Capítulo 03 — 2022",
    title: "Nossa primeira viagem",
    text:
      "Uma estradinha de serra, mala pequena e o coração enorme. Descobrimos juntos que viajar é fácil quando a melhor companhia já está dentro do carro. Foi nessa viagem que dissemos, sem pressa, que era pra vida toda.",
    image: s3,
  },
  {
    eyebrow: "Capítulo 04 — 2024",
    title: "O pedido",
    text:
      "Pôr do sol, aliança escondida no bolso, joelho no chão e um \"sim\" que veio antes mesmo da pergunta terminar. O resto, como dizem por aí, é história — e o próximo capítulo a gente escreve juntinho de você.",
    image: s4,
  },
];

export function NossaHistoria() {
  return (
    <section id="historia" className="relative px-4 py-20 sm:py-28 bg-secondary/40 overflow-hidden">
      <Flower className="absolute -top-6 -left-6 hidden sm:block" size={120} variant="yellow" rotate={-20} opacity={0.45} />
      <Flower className="absolute top-20 right-4 sm:right-10" size={70} variant="blue" rotate={25} opacity={0.55} />
      <Sprig className="absolute bottom-10 left-6 hidden sm:block" size={140} rotate={20} opacity={0.45} />
      <Flower className="absolute bottom-6 right-6" size={56} variant="mixed" rotate={45} opacity={0.5} />

      <div className="relative max-w-5xl mx-auto">
        <div className="text-center max-w-2xl mx-auto">
          <p className="font-script text-3xl text-primary">nossa história</p>
          <h2 className="text-2xl sm:text-4xl font-semibold mt-2">Como tudo aconteceu</h2>
          <p className="mt-5 text-foreground/80 leading-relaxed">
            São anos colecionando memórias que cabem em fotos, mas transbordam em sentimento. Aqui vão alguns capítulos que nos trouxeram até este altar.
          </p>
        </div>

        <div className="mt-16 space-y-16 sm:space-y-24">
          {chapters.map((c, i) => {
            const reversed = i % 2 === 1;
            return (
              <article
                key={c.title}
                className="grid md:grid-cols-2 gap-8 sm:gap-12 items-center"
              >
                <div className={`relative ${reversed ? "md:order-2" : ""}`}>
                  <div className="aspect-[4/5] rounded-3xl overflow-hidden shadow-[var(--shadow-card)] border border-border/60">
                    <img
                      src={c.image}
                      alt={c.title}
                      loading="lazy"
                      className="w-full h-full object-cover hover:scale-105 transition duration-700"
                    />
                  </div>
                  <Flower
                    className={`absolute ${reversed ? "-right-3 -top-3" : "-left-3 -top-3"}`}
                    size={64}
                    variant={i % 2 === 0 ? "yellow" : "blue"}
                    rotate={i * 30}
                  />
                </div>
                <div className={reversed ? "md:order-1 md:text-right" : ""}>
                  <p className="text-xs uppercase tracking-[0.3em] text-primary/80">{c.eyebrow}</p>
                  <h3 className="font-script text-4xl sm:text-5xl mt-3 text-foreground">{c.title}</h3>
                  <p className="mt-5 text-foreground/80 leading-relaxed">{c.text}</p>
                  <div className={`mt-6 flex items-center gap-2 ${reversed ? "md:justify-end" : ""}`}>
                    <span className="h-px w-10 bg-primary/50" />
                    <span className="text-xs text-muted-foreground italic">um pedacinho de nós</span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export interface Gift {
  id: string;
  title: string;
  image: string;
  total: number;
  raised: number;
}

export const mockGifts: Gift[] = [
  {
    id: "1",
    title: "Jogo de Panelas Antiaderente",
    image: "https://images.unsplash.com/photo-1584990347449-a8d3a3a8a72f?w=600&q=80",
    total: 800,
    raised: 320,
  },
  {
    id: "2",
    title: "Liquidificador Profissional",
    image: "https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=600&q=80",
    total: 450,
    raised: 450,
  },
  {
    id: "3",
    title: "Jogo de Taças de Cristal",
    image: "https://images.unsplash.com/photo-1547595628-c61a29f496f0?w=600&q=80",
    total: 320,
    raised: 90,
  },
  {
    id: "4",
    title: "Cafeteira Elétrica",
    image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&q=80",
    total: 600,
    raised: 600,
  },
  {
    id: "5",
    title: "Air Fryer 5L",
    image: "https://images.unsplash.com/photo-1626202373052-9cd7e1c1e9c7?w=600&q=80",
    total: 700,
    raised: 220,
  },
  {
    id: "6",
    title: "Jogo de Toalhas de Banho",
    image: "https://images.unsplash.com/photo-1620626011761-996317b8d101?w=600&q=80",
    total: 280,
    raised: 0,
  },
  {
    id: "7",
    title: "Aparelho de Jantar Porcelana",
    image: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=600&q=80",
    total: 950,
    raised: 480,
  },
  {
    id: "8",
    title: "Faqueiro Inox 24 peças",
    image: "https://images.unsplash.com/photo-1594041680534-e8c8cdebd659?w=600&q=80",
    total: 380,
    raised: 380,
  },
];

export const WEDDING_DATE = new Date("2026-11-14T16:00:00");
export const COUPLE = { bride: "Helena", groom: "Mateus" };

import { useEffect, useState } from "react";
import { getGifts, Gift } from "@/lib/firestoreService";
// IMPORTAR O NOVO CARD PÚBLICO AQUI
import { GiftCardPublic } from "@/components/gifts/GiftCardPublic";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Flower, Branch } from "@/components/decor/Flower";

export function GiftListSection() {
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [loading, setLoading] = useState(true);

  const loadGifts = async () => {
    try {
      const data = await getGifts();
      // Mostramos os primeiros 8 presentes na Home (já que 4 cabem por linha agora)
      setGifts(data.slice(0, 8));
    } catch (error) {
      console.error("Erro ao carregar presentes:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGifts();
  }, []);

  return (
    <section
      id="presentes"
      className="relative px-4 py-16 sm:py-24 bg-secondary/40 overflow-hidden"
      style={{ scrollMarginTop: "80px" }}
    >
      {/* Decorações Visuais mantidas... */}
      <Branch
        className="absolute -top-10 -right-10 hidden sm:block opacity-30"
        size={200}
        rotate={180}
      />
      <Flower
        className="absolute top-20 left-10 opacity-40"
        size={60}
        variant="blue"
        rotate={45}
      />

      <div className="relative max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <p className="font-script text-3xl text-primary">presentes</p>
          <h2 className="text-3xl sm:text-4xl font-semibold mt-2">
            Lista de Presentes
          </h2>
          <p className="mt-4 text-foreground/80 max-w-2xl mx-auto text-sm sm:text-base">
            Sua presença é o nosso maior presente, mas se desejar nos
            presentear, escolhemos algumas opções com muito carinho.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <p className="text-muted-foreground text-sm animate-pulse">
              Carregando sugestões...
            </p>
          </div>
        ) : (
          <>
            {/* AJUSTE NA GRADE: cols-2 no mobile, cols-3 no tablet, cols-4 no desktop */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
              {gifts.map((gift) => (
                // USAR O NOVO CARD PÚBLICO
                <GiftCardPublic key={gift.id} gift={gift} />
              ))}
            </div>

            <div className="mt-12 text-center">
              <Button
                asChild
                size="lg"
                className="rounded-full px-8 gap-2 group text-sm"
              >
                <Link to="/present-list">
                  Ver lista completa
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

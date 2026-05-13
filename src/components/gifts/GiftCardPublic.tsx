import { Check } from "lucide-react";
import { useState } from "react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { brl } from "@/lib/format";
import { Gift } from "@/lib/firestoreService";
import { PaymentSheet } from "./PaymentSheet";

interface GiftCardPublicProps {
  gift: Gift;
}

export function GiftCardPublic({ gift }: GiftCardPublicProps) {
  const [payOpen, setPayOpen] = useState(false);

  const pct = Math.min(100, Math.round((gift.raised / gift.total) * 100));
  const completed = gift.raised >= gift.total;

  return (
    <>
      <div className="bg-card rounded-xl overflow-hidden border border-border/50 shadow-sm flex flex-col h-full transition-all hover:shadow-md">
        {/* Imagem mais baixa (aspect-video) */}
        <div className="aspect-video overflow-hidden bg-secondary">
          <img src={gift.image} alt={gift.title} className="w-full h-full object-cover" />
        </div>

        {/* Padding reduzido (p-3) */}
        <div className="p-3 flex flex-col flex-1 gap-2.5">
          {/* Textos menores */}
          <div>
            <h3 className="font-medium text-sm line-clamp-1 text-foreground">{gift.title}</h3>
            {gift.marca && (
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{gift.marca}</p>
            )}
          </div>
          
          {/* Barra de progresso mais fina e valores menores */}
          <div className="space-y-1 mt-auto">
            <Progress value={pct} className="h-1" />
            <div className="flex justify-between items-baseline text-[11px] text-muted-foreground">
              <span className="font-medium text-foreground">{pct}%</span>
              <span>{brl(gift.total)}</span>
            </div>
          </div>

          {/* Botão menor (h-9) e com active:scale */}
          <Button 
            onClick={() => setPayOpen(true)}
            disabled={completed}
            size="sm"
            className="w-full rounded-full h-9 text-xs transition-transform active:scale-95"
            variant={completed ? "secondary" : "default"}
          >
            {completed ? <><Check className="w-4 h-4 mr-1.5" /> Comprado</> : "Presentear"}
          </Button>
        </div>
      </div>

      <PaymentSheet gift={gift} open={payOpen} onOpenChange={setPayOpen} />
    </>
  );
}
import { Check, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { brl } from "@/lib/format";
import { useViewMode } from "@/contexts/ViewModeContext";
import type { Gift } from "@/data/mockGifts";
import { PaymentSheet } from "./PaymentSheet";

export function GiftCard({ gift }: { gift: Gift }) {
  const { mode } = useViewMode();
  const isAdmin = mode === "admin";
  const [open, setOpen] = useState(false);
  const pct = Math.min(100, Math.round((gift.raised / gift.total) * 100));
  const completed = gift.raised >= gift.total;

  return (
    <>
      <div className="group bg-card rounded-3xl overflow-hidden border border-border/60 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-soft)] transition-all duration-300 flex flex-col">
        <div className="relative aspect-square overflow-hidden bg-secondary">
          <img
            src={gift.image}
            alt={gift.title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
          />
          {completed && (
            <div
              className="absolute inset-0 flex items-center justify-center backdrop-blur-md"
              style={{ backgroundColor: "color-mix(in oklab, var(--success) 55%, transparent)" }}
            >
              <div className="w-20 h-20 rounded-full bg-card/90 flex items-center justify-center shadow-lg">
                <Check className="w-10 h-10 text-[oklch(0.45_0.15_155)]" strokeWidth={3} />
              </div>
            </div>
          )}
          {isAdmin && (
            <div className="absolute top-3 right-3 flex gap-2">
              <button
                aria-label="Editar"
                className="w-9 h-9 rounded-full bg-card/95 backdrop-blur flex items-center justify-center shadow-md hover:bg-card transition"
              >
                <Pencil className="w-4 h-4 text-foreground" />
              </button>
              <button
                aria-label="Excluir"
                className="w-9 h-9 rounded-full bg-card/95 backdrop-blur flex items-center justify-center shadow-md hover:bg-destructive hover:text-destructive-foreground transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        <div className="p-4 sm:p-5 flex flex-col flex-1 gap-3">
          <h3 className="font-medium text-foreground line-clamp-2 min-h-[3rem]">{gift.title}</h3>
          <div>
            <Progress value={pct} className="h-2" />
            <div className="mt-2 flex items-baseline justify-between text-xs text-muted-foreground">
              <span>
                <span className="font-medium text-foreground">{brl(gift.raised)}</span> de {brl(gift.total)}
              </span>
              <span>{pct}%</span>
            </div>
          </div>
          {completed ? (
            <Button disabled className="w-full rounded-full mt-auto" variant="secondary">
              <Check className="w-4 h-4 mr-2" /> Presente Garantido!
            </Button>
          ) : (
            <Button
              onClick={() => setOpen(true)}
              className="w-full rounded-full mt-auto bg-primary text-primary-foreground hover:opacity-90"
            >
              Presentear
            </Button>
          )}
        </div>
      </div>
      <PaymentSheet gift={gift} open={open} onOpenChange={setOpen} />
    </>
  );
}

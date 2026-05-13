import { Check, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { brl } from "@/lib/format";
import { useViewMode } from "@/contexts/ViewModeContext";
import type { Gift } from "@/data/mockGifts";
import { PaymentSheet } from "./PaymentSheet";
import { EditGiftDialog } from "./EditGiftDialog";
import { DeleteGiftDialog } from "./DeleteGiftDialog";

export function GiftCard({ gift }: { gift: Gift }) {
  const { mode } = useViewMode();
  const isAdmin = mode === "admin";
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const pct = Math.min(100, Math.round((gift.raised / gift.total) * 100));
  const completed = gift.raised >= gift.total;

  return (
    <>
      <div className="group bg-card rounded-2xl overflow-hidden border border-border/60 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-soft)] transition-all duration-300 flex flex-col">
        <div className="relative aspect-video overflow-hidden bg-secondary flex items-center justify-center">
          <img
            src={gift.image}
            alt={gift.title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
          />
          {completed && (
            <div
              className="absolute inset-0 flex items-center justify-center backdrop-blur-[2px]"
              style={{ backgroundColor: "color-mix(in oklab, var(--success) 25%, transparent)" }}
            >
              <div className="w-16 h-16 rounded-full bg-card/90 flex items-center justify-center shadow-lg">
                <Check className="w-8 h-8 text-[oklch(0.45_0.15_155)]" strokeWidth={3} />
              </div>
            </div>
          )}
          {isAdmin && (
            <div className="absolute top-3 right-3 flex gap-2">
              <button
                aria-label="Editar"
                onClick={() => setEditOpen(true)}
                className="w-9 h-9 rounded-full bg-card/95 backdrop-blur flex items-center justify-center shadow-md hover:bg-card transition"
              >
                <Pencil className="w-4 h-4 text-foreground" />
              </button>
              <button
                aria-label="Excluir"
                onClick={() => setDeleteOpen(true)}
                className="w-9 h-9 rounded-full bg-card/95 backdrop-blur flex items-center justify-center shadow-md hover:bg-destructive hover:text-destructive-foreground transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        <div className="p-3 flex flex-col flex-1 gap-2">
          <h3 className="text-sm font-medium text-foreground line-clamp-2">{gift.title}</h3>
          <div>
            <Progress value={pct} className="h-1.5" />
            <div className="mt-1 flex items-baseline justify-between text-xs text-muted-foreground">
              <span>
                <span className="font-medium text-foreground text-xs">{brl(gift.raised)}</span>
              </span>
              <span>{pct}%</span>
            </div>
          </div>
          {completed ? (
            <Button disabled className="w-full rounded-full mt-auto text-xs h-7" variant="secondary">
              <Check className="w-3 h-3 mr-1" />
            </Button>
          ) : (
            <Button
              onClick={() => setOpen(true)}
              className="w-full rounded-full mt-auto bg-primary text-primary-foreground hover:opacity-90 text-xs h-7 pb-2"
            >
              Presentear
            </Button>
          )}
        </div>
      </div>
      <PaymentSheet gift={gift} open={open} onOpenChange={setOpen} />
      <EditGiftDialog gift={gift} open={editOpen} onOpenChange={setEditOpen} />
      <DeleteGiftDialog gift={gift} open={deleteOpen} onOpenChange={setDeleteOpen} />
    </>
  );
}
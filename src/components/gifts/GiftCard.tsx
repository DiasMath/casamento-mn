import { Pencil, Trash2, Check } from "lucide-react";
import { useState } from "react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { brl } from "@/lib/format";
import { useAuth } from "@/contexts/AuthContext";
import { Gift } from "@/lib/firestoreService";
import { EditGiftDialog } from "./EditGiftDialog";
import { DeleteGiftDialog } from "./DeleteGiftDialog";
import { PaymentSheet } from "./PaymentSheet";

interface GiftCardProps {
  gift: Gift;
  onUpdate: () => void;
}

export function GiftCard({ gift, onUpdate }: GiftCardProps) {
  const { isAdmin } = useAuth();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [payOpen, setPayOpen] = useState(false);

  const pct = Math.min(100, Math.round((gift.raised / gift.total) * 100));
  const completed = gift.raised >= gift.total;

  return (
    <>
      <div className="group bg-card rounded-2xl overflow-hidden border border-border/60 shadow-sm flex flex-col relative">
        {/* Botões de Ação (Apenas Admin) com Animações */}
        {isAdmin && (
          <div className="absolute top-2 right-2 z-10 flex gap-2">
            <Button 
              size="icon" 
              variant="secondary" 
              className="w-8 h-8 rounded-full shadow-md transition-transform hover:scale-110 active:scale-95 hover:bg-white hover:text-primary" 
              onClick={() => setEditOpen(true)}
            >
              <Pencil className="w-4 h-4" />
            </Button>
            <Button 
              size="icon" 
              variant="destructive" 
              className="w-8 h-8 rounded-full shadow-md transition-transform hover:scale-110 active:scale-95" 
              onClick={() => setDeleteOpen(true)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        )}

        <div className="aspect-video overflow-hidden bg-secondary">
          <img src={gift.image} alt={gift.title} className="w-full h-full object-cover" />
        </div>

        <div className="p-4 flex flex-col flex-1 gap-3">
          {/* Título e Marca */}
          <div>
            <h3 className="font-medium line-clamp-1">{gift.title}</h3>
            {gift.marca && (
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{gift.marca}</p>
            )}
          </div>
          
          {/* BARRA DE PROGRESSO E VALORES ATUALIZADOS AQUI */}
          <div className="space-y-1">
            <Progress value={pct} className="h-1.5" />
            <div className="flex justify-between items-baseline text-xs text-muted-foreground">
              <span className="font-medium text-foreground">{pct}%</span>
              <span className="font-medium text-foreground">{brl(gift.total)}</span>
            </div>
          </div>

          <Button 
            onClick={() => setPayOpen(true)}
            disabled={completed}
            className="w-full rounded-full transition-transform active:scale-95"
            variant={completed ? "secondary" : "default"}
          >
            {completed ? <><Check className="w-4 h-4 mr-2" /> Comprado</> : "Presentear"}
          </Button>
        </div>
      </div>

      {/* Modais de CRUD e Pagamento */}
      <EditGiftDialog gift={gift} open={editOpen} onOpenChange={setEditOpen} onGiftUpdated={onUpdate} />
      <DeleteGiftDialog giftId={gift.id} giftTitle={gift.title} open={deleteOpen} onOpenChange={setDeleteOpen} onGiftDeleted={onUpdate} />
      <PaymentSheet gift={gift} open={payOpen} onOpenChange={setPayOpen} />
    </>
  );
}
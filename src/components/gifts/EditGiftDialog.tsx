import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { updateGift } from "@/lib/firestoreService";

interface EditGiftDialogProps {
  gift: {
    id: string;
    title: string;
    image: string;
    total: number;
    raised: number;
  };
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

export function EditGiftDialog({ gift, open, onOpenChange }: EditGiftDialogProps) {
  const [title, setTitle] = useState(gift.title);
  const [image, setImage] = useState(gift.image);
  const [total, setTotal] = useState(String(gift.total));
  const [raised, setRaised] = useState(String(gift.raised));

  useEffect(() => {
    if (open) {
      setTitle(gift.title);
      setImage(gift.image);
      setTotal(String(gift.total));
      setRaised(String(gift.raised));
    }
  }, [open, gift]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const totalNum = parseFloat(total);
      const raisedNum = parseFloat(raised);
      if (isNaN(totalNum) || totalNum <= 0) {
        throw new Error("O valor total deve ser um número positivo");
      }
      if (isNaN(raisedNum) || raisedNum < 0) {
        throw new Error("O valor arrecadado deve ser um número não negativo");
      }
      if (!title.trim() || !image.trim()) {
        throw new Error("Título e URL da imagem são obrigatórios");
      }

      await updateGift(gift.id, {
        title: title.trim(),
        image: image.trim(),
        total: totalNum,
        raised: raisedNum
      });

      toast.success("Presente atualizado!");
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error updating gift:", error);
      toast.error(error.message || "Erro ao atualizar presente");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-3xl">
        <DialogHeader>
          <DialogTitle className="font-script text-3xl">Editar presente</DialogTitle>
          <DialogDescription>Atualize as informações do item.</DialogDescription>
        </DialogHeader>
        <form onSubmit={save} className="space-y-4">
          <div className="aspect-video rounded-2xl overflow-hidden bg-secondary">
            <img src={image} alt="" className="w-full h-full object-cover" />
          </div>
          <div>
            <Label htmlFor="g-title">Nome</Label>
            <Input id="g-title" value={title} onChange={(e) => setTitle(e.target.value)} className="h-11 rounded-xl mt-1.5" required />
          </div>
          <div>
            <Label htmlFor="g-image">URL da imagem</Label>
            <Input id="g-image" value={image} onChange={(e) => setImage(e.target.value)} className="h-11 rounded-xl mt-1.5" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="g-total">Valor total (R$)</Label>
              <Input id="g-total" type="number" min={1} value={total} onChange={(e) => setTotal(e.target.value)} className="h-11 rounded-xl mt-1.5" required />
            </div>
            <div>
              <Label htmlFor="g-raised">Arrecadado (R$)</Label>
              <Input id="g-raised" type="number" min={0} value={raised} onChange={(e) => setRaised(e.target.value)} className="h-11 rounded-xl mt-1.5" required />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="rounded-full">
              Cancelar
            </Button>
            <Button type="submit" className="rounded-full bg-primary text-primary-foreground hover:opacity-90">
              Salvar alterações
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
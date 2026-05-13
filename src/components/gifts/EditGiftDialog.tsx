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
import type { Gift } from "@/data/mockGifts";

interface EditGiftDialogProps {
  gift: Gift;
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

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Presente atualizado!", { description: title });
    onOpenChange(false);
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

interface DeleteGiftDialogProps {
  gift: Gift;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

export function DeleteGiftDialog({ gift, open, onOpenChange }: DeleteGiftDialogProps) {
  const confirm = () => {
    toast.success("Presente excluído", { description: gift.title });
    onOpenChange(false);
  };
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="rounded-3xl">
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir presente?</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja excluir <span className="font-medium text-foreground">{gift.title}</span>? Essa ação não pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="rounded-full">Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={confirm} className="rounded-full bg-destructive text-destructive-foreground hover:opacity-90">
            Excluir
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

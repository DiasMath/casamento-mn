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
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { deleteGift } from "@/lib/firestoreService";

interface DeleteGiftDialogProps {
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

export function DeleteGiftDialog({ gift, open, onOpenChange }: DeleteGiftDialogProps) {
  const confirm = async () => {
    try {
      await deleteGift(gift.id);
      toast.success("Presente excluído!", { description: gift.title });
    } catch (error: any) {
      console.error("Error deleting gift:", error);
      toast.error(error.message || "Erro ao excluir presente");
    } finally {
      onOpenChange(false);
    }
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
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
import { devLog } from "@/lib/devLog";
import { toast } from "sonner";
import { deleteGift } from "@/lib/firestoreService";

// 1. Interface ajustada para bater com o que admin.painel.tsx envia:
interface DeleteGiftDialogProps {
  giftId: string;
  giftTitle: string;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onGiftDeleted: () => void | Promise<void>;
}

export function DeleteGiftDialog({
  giftId,
  giftTitle,
  open,
  onOpenChange,
  onGiftDeleted,
}: DeleteGiftDialogProps) {
  const confirm = async () => {
    try {
      await deleteGift(giftId); // 2. Usa o giftId
      toast.success("Presente excluído!", { description: giftTitle });

      // 3. Informa o componente pai (AdminPainel) que terminou para atualizar a lista
      await onGiftDeleted();
    } catch (error: any) {
      devLog.error("Error deleting gift:", error);
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
            {/* 4. Usa o giftTitle */}
            Tem certeza que deseja excluir{" "}
            <span className="font-medium text-foreground">{giftTitle}</span>?
            Essa ação não pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="rounded-full h-11">
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={confirm}
            className="rounded-full h-11 bg-destructive text-destructive-foreground hover:opacity-90"
          >
            Excluir
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

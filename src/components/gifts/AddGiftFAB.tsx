import { Plus } from "lucide-react";
import { toast } from "sonner";

export function AddGiftFAB() {
  return (
    <button
      onClick={() => toast.info("Abrir formulário de novo presente (mock)")}
      className="fixed bottom-6 right-6 z-40 h-14 px-5 rounded-full bg-primary text-primary-foreground shadow-[var(--shadow-soft)] flex items-center gap-2 hover:opacity-90 transition active:scale-95"
    >
      <Plus className="w-5 h-5" />
      <span className="text-sm font-medium hidden sm:inline">Adicionar Presente</span>
    </button>
  );
}

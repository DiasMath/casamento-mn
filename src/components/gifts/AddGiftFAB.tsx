import { Plus } from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { addGift } from "@/lib/firestoreService";
import { validateGiftData } from "@/lib/utils";

interface AddGiftFABProps {
  onGiftAdded: () => void;
}

export function AddGiftFAB({ onGiftAdded }: AddGiftFABProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [marca, setMarca] = useState("");
  const [image, setImage] = useState("");
  const [total, setTotal] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { validTitle, validImage, totalNum, validMarca } = validateGiftData(title, image, total, undefined, marca);
      
      await addGift({
        title: validTitle,
        marca: validMarca,
        image: validImage,
        total: totalNum,
        raised: 0,
      });

      toast.success("Presente adicionado!");
      setOpen(false);
      onGiftAdded();
      // Reset campos
      setTitle("");
      setMarca("");
      setImage("");
      setTotal("");
    } catch (error: any) {
      toast.error(error.message || "Erro ao adicionar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          className="fixed bottom-6 right-6 w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform z-50"
          aria-label="Adicionar presente"
        >
          <Plus className="w-7 h-7" />
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md rounded-3xl">
        <DialogHeader>
          <DialogTitle className="font-script text-3xl">Novo Presente</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleAdd} className="space-y-4">
          <div>
            <Label htmlFor="title">Título</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="Ex: Jogo de Pratos" />
          </div>
          <div>
            <Label htmlFor="marca">Marca (Opcional)</Label>
            <Input id="marca" value={marca} onChange={(e) => setMarca(e.target.value)} placeholder="Ex: Tramontina, Oster..." />
          </div>
          <div>
            <Label htmlFor="image">URL da Imagem</Label>
            <Input id="image" value={image} onChange={(e) => setImage(e.target.value)} required placeholder="https://..." />
          </div>
          <div>
            <Label htmlFor="total">Valor Total (R$)</Label>
            <Input id="total" type="number" step="0.01" value={total} onChange={(e) => setTotal(e.target.value)} required />
          </div>
          <Button type="submit" className="w-full rounded-full" disabled={loading}>
            {loading ? "Salvando..." : "Adicionar à Lista"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
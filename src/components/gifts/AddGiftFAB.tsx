import { Plus } from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { addGift } from "@/lib/firestoreService";
import { uploadToCloudinary } from "@/lib/cloudinary";
import type { GiftCategory, GiftPriority } from "@/lib/firestoreService";
import { validateGiftData } from "@/lib/utils";
import { ImageUploader } from "./ImageUploader";
import { GIFT_CATEGORIES, GIFT_PRIORITIES } from "@/lib/constants";

interface AddGiftFABProps {
  onGiftAdded: () => void;
}

export function AddGiftFAB({ onGiftAdded }: AddGiftFABProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [marca, setMarca] = useState("");
  const [imageBlob, setImageBlob] = useState<Blob | null>(null);
  const [total, setTotal] = useState("");
  const [category, setCategory] = useState<GiftCategory>("outros");
  const [priority, setPriority] = useState<GiftPriority>("media");
  const [loading, setLoading] = useState(false);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      let imageUrl = "";

      if (imageBlob) {
        imageUrl = await uploadToCloudinary(imageBlob);
      }

      const { validTitle, totalNum, validMarca } = validateGiftData(
        title,
        imageUrl,
        total,
        undefined,
        marca,
      );

      await addGift({
        title: validTitle,
        marca: validMarca,
        image: imageUrl,
        total: totalNum,
        raised: 0,
        hidden: false,
        category,
        priority,
      });

      toast.success("Presente adicionado!");
      setOpen(false);
      onGiftAdded();
      setTitle("");
      setMarca("");
      setImageBlob(null);
      setTotal("");
      setCategory("outros");
      setPriority("media");
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
      <DialogContent className="sm:max-w-md rounded-3xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="font-script text-3xl">
            Novo Presente
          </DialogTitle>
          <DialogDescription className="sr-only">
            Adicione um novo presente à lista
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleAdd} className="space-y-4">
          <div>
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="Ex: Jogo de Pratos"
            />
          </div>
          <div>
            <Label htmlFor="marca">Marca (Opcional)</Label>
            <Input
              id="marca"
              value={marca}
              onChange={(e) => setMarca(e.target.value)}
              placeholder="Ex: Tramontina, Oster..."
            />
          </div>
          <div>
            <Label>Imagem do Presente</Label>
            <ImageUploader
              onFileReady={setImageBlob}
              hasNewFile={imageBlob !== null}
              disabled={loading}
            />
          </div>
          <div>
            <Label htmlFor="total">Valor Total (R$)</Label>
            <Input
              id="total"
              type="number"
              step="0.01"
              value={total}
              onChange={(e) => setTotal(e.target.value)}
              required
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label>Categoria</Label>
              <Select
                value={category}
                onValueChange={(v) => setCategory(v as GiftCategory)}
              >
                <SelectTrigger className="h-11 rounded-xl mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {GIFT_CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.icon} {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Prioridade</Label>
              <Select
                value={priority}
                onValueChange={(v) => setPriority(v as GiftPriority)}
              >
                <SelectTrigger className="h-11 rounded-xl mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {GIFT_PRIORITIES.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.icon} {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button
            type="submit"
            className="w-full rounded-full"
            disabled={loading}
          >
            {loading ? "Salvando..." : "Adicionar à Lista"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

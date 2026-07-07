import { useEffect, useState } from "react";
import { devLog } from "@/lib/devLog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { updateGift, Gift } from "@/lib/firestoreService";
import { uploadToCloudinary } from "@/lib/cloudinary";
import type { GiftCategory, GiftPriority } from "@/lib/firestoreService";
import { validateGiftData } from "@/lib/utils";
import { ImageUploader } from "./ImageUploader";
import { GIFT_CATEGORIES, GIFT_PRIORITIES } from "@/lib/constants";

interface EditGiftDialogProps {
  gift: Gift;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onGiftUpdated: () => void | Promise<void>;
}

export function EditGiftDialog({
  gift,
  open,
  onOpenChange,
  onGiftUpdated,
}: EditGiftDialogProps) {
  const [title, setTitle] = useState(gift.title);
  const [marca, setMarca] = useState(gift.marca || "");
  const [image, setImage] = useState(gift.image);
  const [imageBlob, setImageBlob] = useState<Blob | null>(null);
  const [total, setTotal] = useState(String(gift.total));
  const [raised, setRaised] = useState(String(gift.raised));
  const [category, setCategory] = useState<GiftCategory>(
    gift.category ?? "outros",
  );
  const [priority, setPriority] = useState<GiftPriority>(
    gift.priority ?? "media",
  );
  const [chaMode, setChaMode] = useState(gift.chaMode ?? false);
  const [buyLink, setBuyLink] = useState(gift.buyLink || "");
  const [noValue, setNoValue] = useState(gift.noValue ?? false);

  useEffect(() => {
    if (open) {
      setTitle(gift.title);
      setMarca(gift.marca || "");
      setImage(gift.image);
      setImageBlob(null);
      setTotal(String(gift.total));
      setRaised(String(gift.raised));
      setCategory(gift.category ?? "outros");
      setPriority(gift.priority ?? "media");
      setChaMode(gift.chaMode ?? false);
      setBuyLink(gift.buyLink || "");
      setNoValue(gift.noValue ?? false);
    }
  }, [open, gift]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let finalImage = image;

      if (imageBlob) {
        finalImage = await uploadToCloudinary(imageBlob);
      }

      const { validTitle, validImage, totalNum, raisedNum, validMarca } =
        validateGiftData(title, finalImage, total, raised, marca);

      await updateGift(gift.id, {
        title: validTitle,
        marca: validMarca,
        image: validImage,
        total: chaMode || noValue ? 1 : totalNum,
        raised: chaMode || noValue ? 0 : raisedNum,
        category,
        priority,
        chaMode,
        buyLink: chaMode ? buyLink : "",
        noValue,
      });

      toast.success("Presente atualizado!");
      await onGiftUpdated();
      onOpenChange(false);
    } catch (error: any) {
      devLog.error("Error updating gift:", error);
      toast.error(error.message || "Erro ao atualizar presente");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-3xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="font-script text-3xl">
            Editar presente
          </DialogTitle>
          <DialogDescription>
            Atualize as informações do item.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={save} className="space-y-4">
          <div>
            <Label>Imagem do Presente (Toque para Trocar)</Label>
            <ImageUploader
              value={image}
              onFileReady={setImageBlob}
              hasNewFile={imageBlob !== null}
            />
          </div>
          <div>
            <Label htmlFor="g-marca">Marca (Opcional)</Label>
            <Input
              id="g-marca"
              value={marca}
              onChange={(e) => setMarca(e.target.value)}
              className="h-11 rounded-xl mt-1.5"
              placeholder="Ex: Tramontina"
            />
          </div>
          <div>
            <Label htmlFor="g-title">Nome do Presente</Label>
            <Input
              id="g-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-11 rounded-xl mt-1.5"
              required
              placeholder="Ex: Jogo de Pratos"
            />
          </div>
          <div className="flex items-start gap-3 p-3 bg-primary/5 rounded-xl">
            <Checkbox
              id="chaMode"
              checked={chaMode}
              onCheckedChange={(v) => setChaMode(v === true)}
              className="mt-0.5"
            />
            <Label
              htmlFor="chaMode"
              className="text-sm text-muted-foreground leading-snug cursor-pointer"
            >
              Presente para o chá de panela (modo reserva)
            </Label>
          </div>
          {chaMode && (
            <div>
              <Label htmlFor="g-buyLink">Link de compra online (Opcional)</Label>
              <Input
                id="g-buyLink"
                type="url"
                value={buyLink}
                onChange={(e) => setBuyLink(e.target.value)}
                className="h-11 rounded-xl mt-1.5"
                placeholder="https://www.exemplo.com/produto"
              />
            </div>
          )}
          {!chaMode && !noValue && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label htmlFor="g-total">Valor total (R$)</Label>
                <Input
                  id="g-total"
                  type="number"
                  min={1}
                  step="0.01"
                  value={total}
                  onChange={(e) => setTotal(e.target.value)}
                  className="h-11 rounded-xl mt-1.5"
                  required
                />
              </div>
              <div>
                <Label htmlFor="g-raised">Arrecadado (R$)</Label>
                <Input
                  id="g-raised"
                  type="number"
                  min={0}
                  step="0.01"
                  value={raised}
                  onChange={(e) => setRaised(e.target.value)}
                  className="h-11 rounded-xl mt-1.5"
                  required
                />
              </div>
            </div>
          )}
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
          {!chaMode && (
            <div className="flex items-start gap-3 p-3 bg-primary/5 rounded-xl">
              <Checkbox
                id="noValue"
                checked={noValue}
                onCheckedChange={(v) => setNoValue(v === true)}
                className="mt-0.5"
              />
              <Label
                htmlFor="noValue"
                className="text-sm text-muted-foreground leading-snug cursor-pointer"
              >
                Presente sem valor definido
              </Label>
            </div>
          )}
          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="rounded-full"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="rounded-full bg-primary text-primary-foreground hover:opacity-90"
            >
              Salvar alterações
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

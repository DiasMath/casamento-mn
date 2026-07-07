import { useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Heart, Gift } from "lucide-react";
import { toast } from "sonner";
import { reserveGift } from "@/lib/firestoreService";
import type { Gift as GiftType } from "@/lib/firestoreService";

interface ReserveGiftSheetProps {
  gift: GiftType;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onReserveSuccess?: () => void;
  mode?: "cha" | "generic";
}

export function ReserveGiftSheet({
  gift,
  open,
  onOpenChange,
  onReserveSuccess,
  mode = "cha",
}: ReserveGiftSheetProps) {
  const [name, setName] = useState("");
  const [commitChecked, setCommitChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [reserved, setReserved] = useState(false);

  const isValid = name.trim().length >= 2 && commitChecked;

  const handleReserve = useCallback(async () => {
    if (!isValid || loading) return;

    setLoading(true);
    try {
      const result = await reserveGift(gift.id, name.trim());
      if (result.success) {
        setReserved(true);
        onReserveSuccess?.();
        toast.success("Presente reservado com sucesso!");
      } else {
        toast.error(result.error || "Erro ao reservar presente");
      }
    } catch {
      toast.error("Erro ao reservar presente");
    } finally {
      setLoading(false);
    }
  }, [isValid, loading, gift.id, name, onReserveSuccess]);

  const handleClose = useCallback(() => {
    onOpenChange(false);
    setTimeout(() => {
      setName("");
      setCommitChecked(false);
      setReserved(false);
    }, 300);
  }, [onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="sm:max-w-md rounded-3xl p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle className="font-script text-3xl">
            {reserved ? "Obrigada!" : "Reservar Presente"}
          </DialogTitle>
          <DialogDescription>
            {reserved
              ? "Agradecemos pelo presente!"
              : "Preencha seus dados para reservar este presente."}
          </DialogDescription>
        </DialogHeader>

        {reserved ? (
          <div className="px-6 py-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <Heart className="w-8 h-8 text-primary fill-primary" />
            </div>
            <div className="space-y-2">
              <p className="text-lg font-medium text-foreground">
                Agradecemos pelo presente!
              </p>
              <p className="text-muted-foreground">
                {mode === "cha"
                  ? "Estamos ansiosos para nos encontrar no chá de panela! ♥"
                  : "Obrigado por nos presentear! ♥"}
              </p>
            </div>
            <Button
              onClick={handleClose}
              className="rounded-full mt-4"
              variant="outline"
            >
              Fechar
            </Button>
          </div>
        ) : (
          <div className="px-6 pb-6 space-y-6">
            <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-xl">
              <div className="w-14 h-14 rounded-lg overflow-hidden bg-secondary shrink-0">
                <img
                  src={gift.image}
                  alt={gift.title}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="min-w-0">
                <p className="font-medium text-sm line-clamp-1">{gift.title}</p>
                {gift.marca && (
                  <p className="text-xs text-muted-foreground line-clamp-1">
                    {gift.marca}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reserver-name">Seu nome *</Label>
              <Input
                id="reserver-name"
                placeholder="Digite seu nome"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
                className="rounded-xl"
              />
            </div>

            <div className="flex items-start gap-3">
              <Checkbox
                id="commit"
                checked={commitChecked}
                onCheckedChange={(v) => setCommitChecked(v === true)}
                disabled={loading}
                className="mt-0.5"
              />
              <Label
                htmlFor="commit"
                className="text-sm text-muted-foreground leading-snug cursor-pointer"
              >
                {mode === "cha"
                  ? "Me comprometerei em levar este presente no dia do chá de panela 😊"
                  : "Me comprometerei em levar este presente 😊"}
              </Label>
            </div>

            <Button
              onClick={handleReserve}
              disabled={!isValid || loading}
              className="w-full rounded-full h-12 text-base"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
              ) : (
                <Gift className="w-5 h-5 mr-2" />
              )}
              Reservar presente
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
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
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { addRSVP, type RSVPType } from "@/lib/firestoreService";

interface AddRSVPDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onAdded: () => void;
}

export function AddRSVPDialog({ open, onOpenChange, onAdded }: AddRSVPDialogProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [guestsCount, setGuestsCount] = useState("1");
  const [type, setType] = useState<RSVPType | "">("");
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Informe o nome do convidado.");
      return;
    }
    setLoading(true);
    try {
      await addRSVP(
        name.trim(),
        phone.trim(),
        Number(guestsCount) || 1,
        (type as RSVPType) || undefined,
      );
      toast.success(`${name.trim()} adicionado(a) com sucesso!`);
      setName("");
      setPhone("");
      setGuestsCount("1");
      setType("");
      onOpenChange(false);
      onAdded();
    } catch {
      toast.error("Erro ao adicionar confirmação.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle>Adicionar Confirmação</DialogTitle>
          <DialogDescription>
            Registre um convidado que confirmou presença no chá de panela.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="rsvp-name">Nome *</Label>
            <Input
              id="rsvp-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nome do convidado"
              className="rounded-xl"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="rsvp-phone">Telefone</Label>
            <Input
              id="rsvp-phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(21) 99999-9999"
              className="rounded-xl"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="rsvp-guests">Pessoas no grupo</Label>
              <Input
                id="rsvp-guests"
                type="number"
                min="1"
                value={guestsCount}
                onChange={(e) => setGuestsCount(e.target.value)}
                className="rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select value={type} onValueChange={(v) => setType(v as RSVPType)}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Selecionar..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="familia_matheus">Família Matheus</SelectItem>
                  <SelectItem value="familia_nayana">Família Nayana</SelectItem>
                  <SelectItem value="amigos">Amigos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="rounded-full"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={loading || !name.trim()}
            className="rounded-full"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Adicionar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

import { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Copy, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { brl } from "@/lib/format";
import { PIX_KEY } from "@/lib/constants";
import { db } from "@/lib/firebase";
import { doc, updateDoc, increment } from "firebase/firestore";
import type { Gift } from "@/lib/firestoreService";

export function PaymentSheet({
  gift,
  open,
  onOpenChange,
}: {
  gift: Gift;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const remaining = Math.max(0, gift.total - gift.raised);
  const [amount, setAmount] = useState<string>("");
  const [name, setName] = useState("");
  const [installments, setInstallments] = useState("1");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setAmount(remaining.toString());
      setName("");
    }
  }, [open, remaining]);

  const copyPix = async () => {
    try {
      await navigator.clipboard.writeText(PIX_KEY);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
      toast.success("Chave PIX copiada!");
    } catch {
      toast.error("Não foi possível copiar");
    }
  };

  const confirm = async () => {
    const value = parseFloat(amount);

    if (isNaN(value) || value <= 0) {
      toast.error("Por favor, insira um valor válido.");
      return;
    }

    if (!db) {
      toast.error("Erro de conexão com o servidor.");
      return;
    }

    setLoading(true);

    try {
      const giftRef = doc(db, "gifts", gift.id);
      await updateDoc(giftRef, {
        raised: increment(value)
      });

      const visitor = name.trim() ? name.trim() : "você";
      toast.success("Pagamento registrado! 💛", { 
        description: `Obrigado, ${visitor}, por presentear ${gift.title}.` 
      });
      
      onOpenChange(false);
    } catch (error) {
      console.error("Erro ao processar:", error);
      toast.error("Erro ao registrar contribuição");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="rounded-t-3xl max-h-[92vh] overflow-y-auto sm:max-w-lg sm:mx-auto"
      >
        <SheetHeader className="text-left">
          <SheetTitle className="font-script text-3xl">Presentear</SheetTitle>
        </SheetHeader>

        <div className="px-4 pb-6 space-y-6">
          <div className="flex items-center gap-3 bg-secondary/60 rounded-2xl p-4">
            <img src={gift.image} alt={gift.title} className="w-16 h-16 rounded-lg object-cover" />
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">Presentear</p>
              <p className="text-base font-medium">{gift.title}</p>
            </div>
          </div>
          <div className="bg-secondary/60 rounded-2xl p-4">
            <p className="text-xs text-muted-foreground">Falta arrecadar</p>
            <p className="text-2xl font-semibold">{brl(remaining)}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Seu Nome (Opcional)</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Queremos agradecer pessoalmente!"
              className="rounded-xl"
            />
          </div>

          <div>
            <Label htmlFor="valor" className="text-sm">
              Valor que deseja contribuir
            </Label>
            <div className="relative mt-2">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">R$</span>
              <Input
                id="valor"
                type="number"
                min={1}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-10 h-12 text-lg rounded-xl"
              />
            </div>
          </div>

          <Tabs defaultValue="pix" className="w-full">
            <TabsList className="grid grid-cols-2 w-full rounded-full">
              <TabsTrigger value="pix" className="rounded-full">PIX</TabsTrigger>
              <TabsTrigger value="card" className="rounded-full">Cartão</TabsTrigger>
            </TabsList>

            <TabsContent value="pix" className="mt-4 space-y-4">
              <div className="bg-secondary rounded-xl p-4 flex items-center justify-between gap-2">
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">Chave PIX</span>
                  <span className="text-sm font-medium">{PIX_KEY}</span>
                </div>
                <Button size="sm" variant="ghost" onClick={copyPix} className="shrink-0">
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="card" className="mt-4 space-y-3">
              <Input placeholder="Número do cartão" className="h-12 rounded-xl" />
              <Input placeholder="Nome impresso no cartão" className="h-12 rounded-xl" />
              <div className="grid grid-cols-2 gap-3">
                <Input placeholder="Validade (MM/AA)" className="h-12 rounded-xl" />
                <Input placeholder="CVV" className="h-12 rounded-xl" />
              </div>
              <div>
                <Label className="text-sm">Parcelamento</Label>
                <Select value={installments} onValueChange={setInstallments}>
                  <SelectTrigger className="h-12 rounded-xl mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 6, 12].map((n) => (
                      <SelectItem key={n} value={String(n)}>
                        {n}x de {brl(Number(amount || 0) / n)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>
          </Tabs>

          <Button
            onClick={confirm}
            disabled={loading || !amount}
            className="w-full h-12 rounded-full bg-primary text-primary-foreground hover:opacity-90 text-base"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Confirmar contribuição"
            )}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
import { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Copy, Check, Loader2, QrCode } from "lucide-react";
import { toast } from "sonner";
import { brl } from "@/lib/format";
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

  // Novos estados para o fluxo do PIX Dinâmico
  const [step, setStep] = useState<"form" | "pix">("form");
  const [pixData, setPixData] = useState<{ qr_code: string; qr_code_base64: string } | null>(null);

  useEffect(() => {
    if (open) {
      setAmount(remaining.toString());
      setName("");
      setStep("form"); // Volta para o form sempre que abrir
      setPixData(null);
    }
  }, [open, remaining]);

  const copyPix = async (textToCopy: string) => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success("Código PIX copiado!");
    } catch {
      toast.error("Não foi possível copiar");
    }
  };

  const handleGeneratePix = async () => {
    const value = parseFloat(amount);

    if (isNaN(value) || value <= 0) {
      toast.error("Por favor, insira um valor válido.");
      return;
    }

    setLoading(true);

    try {
      // Chama a nossa API na Vercel
      const response = await fetch('/api/generate-pix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: value,
          description: gift.title,
          giftId: gift.id,
          payerName: name.trim()
        })
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "Erro ao gerar PIX");

      // Salva os dados do PIX e avança para a tela do QR Code
      setPixData({
        qr_code: data.qr_code,
        qr_code_base64: `data:image/png;base64,${data.qr_code_base64}`
      });
      setStep("pix");
      toast.success("PIX gerado com sucesso! Válido por 1 hora.");
      
    } catch (error) {
      console.error("Erro ao gerar PIX:", error);
      toast.error("Erro ao conectar com o banco. Tente novamente.");
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
        <SheetHeader className="text-left mb-6">
          <SheetTitle className="font-script text-3xl">Presentear</SheetTitle>
        </SheetHeader>

        {step === "form" ? (
          <div className="px-4 pb-6 space-y-6">
            <div className="flex items-center gap-3 bg-secondary/60 rounded-2xl p-4">
              <img src={gift.image} alt={gift.title} className="w-16 h-16 rounded-lg object-cover" />
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Presentear</p>
                <p className="text-base font-medium">{gift.title}</p>
              </div>
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

            <Tabs defaultValue="pix" className="w-full mt-4">
              <TabsList className="grid grid-cols-2 w-full rounded-full">
                <TabsTrigger value="pix" className="rounded-full">PIX</TabsTrigger>
                <TabsTrigger value="card" className="rounded-full" disabled>Cartão (Em breve)</TabsTrigger>
              </TabsList>

              <TabsContent value="pix" className="mt-6">
                <Button
                  onClick={handleGeneratePix}
                  disabled={loading || !amount}
                  className="w-full h-14 rounded-full bg-primary text-primary-foreground hover:opacity-90 text-lg font-medium"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <QrCode className="w-5 h-5 mr-2" /> Gerar PIX
                    </>
                  )}
                </Button>
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          /* TELA 2: EXIBIÇÃO DO QR CODE */
          <div className="px-4 pb-6 flex flex-col items-center space-y-6 animate-in fade-in zoom-in duration-300">
            <div className="text-center space-y-2">
              <h3 className="text-xl font-semibold">Escaneie o QR Code</h3>
              <p className="text-sm text-muted-foreground">
                Abra o app do seu banco e escaneie o código abaixo. <br/> Ele expira em 1 hora.
              </p>
            </div>

            {pixData?.qr_code_base64 && (
              <div className="p-4 bg-white rounded-2xl border-2 border-primary/20 shadow-sm">
                <img src={pixData.qr_code_base64} alt="QR Code PIX" className="w-48 h-48" />
              </div>
            )}

            <div className="w-full space-y-2">
              <Label className="text-center block">Ou copie o código PIX</Label>
              <div className="flex gap-2">
                <Input 
                  readOnly 
                  value={pixData?.qr_code || ""} 
                  className="bg-secondary/50 font-mono text-xs h-12"
                />
                <Button 
                  onClick={() => copyPix(pixData?.qr_code || "")}
                  className="h-12 px-4 shrink-0"
                  variant="secondary"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-primary/10 text-primary rounded-xl w-full">
              <Loader2 className="w-5 h-5 animate-spin shrink-0" />
              <p className="text-xs font-medium">
                Aguardando pagamento... Esta tela será atualizada automaticamente assim que o banco confirmar.
              </p>
            </div>

            <Button variant="ghost" onClick={() => setStep("form")} className="mt-4">
              Cancelar e voltar
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
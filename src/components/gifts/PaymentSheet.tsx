import { useEffect, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Copy, Check, Loader2, QrCode, Clock } from "lucide-react";
import { toast } from "sonner";
import { brl } from "@/lib/format";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Gift } from "@/lib/firestoreService";

export function PaymentSheet({
  gift,
  open,
  onOpenChange,
  onPaymentSuccess,
}: {
  gift: Gift;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onPaymentSuccess?: (value: number) => void;
}) {
  const remaining = Math.max(0, gift.total - gift.raised);
  const [amount, setAmount] = useState<string>("");
  const [name, setName] = useState("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  // Estados do fluxo do PIX
  const [step, setStep] = useState<"form" | "pix">("form");
  const [pixData, setPixData] = useState<{
    qr_code: string;
    qr_code_base64: string;
  } | null>(null);
  const [expiresIn, setExpiresIn] = useState(3600); // 1 hora em segundos

  // Estados de confirmação de pagamento
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [confirmedValue, setConfirmedValue] = useState(0);
  const [isExpired, setIsExpired] = useState(false);

  // Limpa os estados ao abrir/fechar o modal
  useEffect(() => {
    if (open) {
      setAmount(remaining.toString());
      setName("");
      setStep("form");
      setPixData(null);
      setExpiresIn(3600);
      setPaymentConfirmed(false);
      setConfirmedValue(0);
      setIsExpired(false);
    }
  }, [open, remaining]);

  // Função para voltar ao estado inicial
  const handleCancelPix = () => {
    setPixData(null);
    setExpiresIn(3600);
    setStep("form");
  };

  // Cronómetro do PIX
  useEffect(() => {
    if (step === "pix" && !paymentConfirmed) {
      if (expiresIn > 0) {
        const timer = setInterval(() => {
          setExpiresIn((prev) => prev - 1);
        }, 1000);
        return () => clearInterval(timer);
      } else {
        // Timer expirou - mostra mensagem na tela
        setIsExpired(true);
        toast.error("O tempo do QR Code expirou. Gere um novo código.");
      }
    }
  }, [step, expiresIn, paymentConfirmed]);

  // ESCUTA EM TEMPO REAL: Detecta quando o valor no Firebase aumenta
  useEffect(() => {
    if (step === "pix" && gift.id && db && !paymentConfirmed) {
      const giftRef = doc(db, "gifts", gift.id);

      const unsubscribe = onSnapshot(giftRef, (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          // Se o valor arrecadado for maior do que o inicial, o pagamento foi confirmado
          if (data.raised > gift.raised) {
            const paidValue = data.raised - gift.raised;
            setConfirmedValue(paidValue);
            setPaymentConfirmed(true);
            onPaymentSuccess?.(paidValue);
          }
        }
      });

      return () => unsubscribe();
    }
  }, [
    step,
    gift.id,
    gift.raised,
    onOpenChange,
    paymentConfirmed,
    onPaymentSuccess,
  ]);

  // Fecha automaticamente após 4 segundos quando o pagamento for confirmado
  useEffect(() => {
    if (paymentConfirmed) {
      const timer = setTimeout(() => {
        onOpenChange(false);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [paymentConfirmed, onOpenChange]);

  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

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
      toast.error("Insira um valor válido.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/generate-pix", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: value,
          description: gift.title,
          giftId: gift.id,
          payerName: name.trim(),
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Erro ao gerar PIX");

      setPixData({
        qr_code: data.qr_code,
        qr_code_base64: `data:image/png;base64,${data.qr_code_base64}`,
      });
      setStep("pix");
      toast.success("PIX gerado com sucesso!");
    } catch (error) {
      console.error(error);
      toast.error("Erro ao gerar pagamento. Tente novamente.");
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

          <SheetDescription className="sr-only">
            Escolha um valor para contribuir com o presente {gift.title}
          </SheetDescription>
        </SheetHeader>

        {step === "form" ? (
          <div className="px-4 pb-6 space-y-6">
            <div className="flex items-center gap-3 bg-secondary/60 rounded-2xl p-4">
              <img
                src={gift.image}
                alt={gift.title}
                className="w-16 h-16 rounded-lg object-cover"
              />
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
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                  R$
                </span>
                <Input
                  id="valor"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="pl-10 h-12 text-lg rounded-xl"
                />
              </div>
            </div>

            <Tabs defaultValue="pix" className="w-full mt-4">
              <TabsList className="grid grid-cols-2 w-full rounded-full">
                <TabsTrigger value="pix" className="rounded-full">
                  PIX
                </TabsTrigger>
                <TabsTrigger value="card" className="rounded-full" disabled>
                  Cartão (Em breve)
                </TabsTrigger>
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
          <div className="px-4 pb-6 flex flex-col items-center space-y-6 animate-in fade-in zoom-in duration-300">
            <div className="text-center space-y-1">
              <h3 className="text-xl font-semibold">
                {isExpired ? "Código Expirado" : "Escaneie o QR Code"}
              </h3>
              <p className="text-sm text-muted-foreground">
                {isExpired
                  ? "O tempo limite foi atingido. Gere um novo código abaixo."
                  : "Abra o app do seu banco e pague o QR Code abaixo."}
              </p>
              <div
                className={`flex items-center justify-center gap-1.5 mt-2 text-sm font-medium py-1.5 px-4 rounded-full border ${
                  isExpired
                    ? "text-red-600 bg-red-50/80 border-red-200"
                    : "text-amber-600 bg-amber-50/80 border-amber-200"
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>
                  {isExpired ? "Expirado" : `Expira em: ${formatTime(expiresIn)}`}
                </span>
              </div>
            </div>

            {pixData?.qr_code_base64 && (
              <div className="p-4 bg-white rounded-2xl border-2 border-primary/20 shadow-sm">
                <img
                  src={pixData.qr_code_base64}
                  alt="QR Code PIX"
                  className="w-48 h-48"
                />
              </div>
            )}

            <div className="w-full space-y-2">
              {!isExpired && (
                <>
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
                      {copied ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </>
              )}

              {isExpired && (
                <Button
                  onClick={handleCancelPix}
                  className="w-full h-12 rounded-full"
                >
                  <QrCode className="w-5 h-5 mr-2" /> Gerar Novo Código
                </Button>
              )}
            </div>

            {paymentConfirmed ? (
              <div className="flex flex-col items-center text-center space-y-6 py-6 animate-in fade-in zoom-in duration-300">
                <div className="text-6xl">🎉</div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-green-600">
                    Pagamento Confirmado!
                  </h3>
                  <p className="text-lg text-foreground/80">
                    Obrigado pelo carinho! ❤️
                  </p>
                </div>
                <div className="bg-green-50 text-green-700 px-6 py-3 rounded-xl font-medium">
                  Você contribuiu: {brl(confirmedValue)}
                </div>
                <p className="text-sm text-muted-foreground">
                  Esta tela fechará automaticamente...
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 p-4 bg-primary/10 text-primary rounded-xl w-full">
                  <Loader2 className="w-5 h-5 animate-spin shrink-0" />
                  <p className="text-xs font-medium">
                    Aguardando pagamento. Esta tela será atualizada
                    automaticamente assim que o banco confirmar!
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={handleCancelPix}
                  className="mt-2 w-full h-12 rounded-full border-border/60 text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
                >
                  Cancelar e voltar
                </Button>
              </>
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

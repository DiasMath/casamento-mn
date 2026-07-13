import { useEffect, useRef, useState } from "react";
import { devLog } from "@/lib/devLog";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Copy, Check, Loader2, QrCode, Clock } from "lucide-react";
import { toast } from "sonner";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Gift } from "@/lib/firestoreService";
import { brl } from "@/lib/format";
import { ReserveGiftSheet } from "./ReserveGiftSheet";

export function PaymentSheet({
  gift,
  open,
  onOpenChange,
  onPaymentSuccess,
  onReserveSuccess,
}: {
  gift: Gift;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onPaymentSuccess?: (value: number) => void;
  onReserveSuccess?: () => void;
}) {
  const remaining = Math.max(0, gift.total - gift.raised);
  const [amount, setAmount] = useState<string>("");
  const [name, setName] = useState("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cardLoading, setCardLoading] = useState(false);
  const [preferStore, setPreferStore] = useState(false);
  const [reserveOpen, setReserveOpen] = useState(false);

  // Estados do fluxo do PIX
  const [step, setStep] = useState<"form" | "pix">("form");
  const [pixData, setPixData] = useState<{
    qr_code: string;
    qr_code_base64: string;
  } | null>(null);
  const [expiresIn, setExpiresIn] = useState(900);

  // Estados de confirmação de pagamento
  const [isExpired, setIsExpired] = useState(false);
  const [paymentId, setPaymentId] = useState<string | null>(null);

  // Ref para capturar gift.raised no momento que PIX é gerado
  // Evita race condition: o prop muda quando pai re-renderiza
  const raisedAtStart = useRef(gift.raised);
  const onPaymentSuccessRef = useRef(onPaymentSuccess);
  onPaymentSuccessRef.current = onPaymentSuccess;

  // Limpa os estados ao abrir/fechar o modal
  useEffect(() => {
    if (open) {
      setAmount("");
      setName("");
      setStep("form");
      setPixData(null);
      setExpiresIn(900);
      setIsExpired(false);
      setPaymentId(null);
      raisedAtStart.current = gift.raised;
    }
  }, [open, gift.raised]);

  // Função para voltar ao estado inicial
  const handleCancelPix = () => {
    setPixData(null);
    setExpiresIn(900);
    setStep("form");
  };

  // Cronómetro do PIX
  useEffect(() => {
    if (step === "pix") {
      if (expiresIn > 0) {
        const timer = setInterval(() => {
          setExpiresIn((prev) => prev - 1);
        }, 1000);
        return () => clearInterval(timer);
      } else {
        setIsExpired(true);
        toast.error("O tempo do QR Code expirou. Gere um novo código.");
      }
    }
  }, [step, expiresIn]);

  // ESCUTA EM TEMPO REAL: Detecta quando o valor no Firebase aumenta
  // Usa ref para comparar com o valor original (quando PIX foi gerado)
  useEffect(() => {
    if (step !== "pix" || !gift.id || !db) return;

    const giftRef = doc(db, "gifts", gift.id);
    let called = false;
    const initialRaised = raisedAtStart.current;

    const unsubscribe = onSnapshot(giftRef, (docSnap) => {
      if (docSnap.exists() && !called) {
        const data = docSnap.data();
        if (data.raised > initialRaised) {
          called = true;
          onPaymentSuccessRef.current?.(data.raised - initialRaised);
        }
      }
    });

    return () => unsubscribe();
  }, [step, gift.id]);

  // POLLING FALLBACK: Checa status a cada 5s via API
  useEffect(() => {
    if (step !== "pix" || !paymentId) return;
    let stopped = false;

    const poll = async () => {
      try {
        const res = await fetch(`/api/check-payment?id=${paymentId}`);
        const data = await res.json();
        if (data.status === "approved" && !stopped) {
          // check-payment atualizou Firebase → onSnapshot vai detectar
        }
      } catch {
        // Silencioso
      }
    };

    poll();
    const interval = setInterval(poll, 5000);
    return () => {
      stopped = true;
      clearInterval(interval);
    };
  }, [step, paymentId]);

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
      setPaymentId(String(data.id));
      raisedAtStart.current = gift.raised;
      setStep("pix");
      toast.success("PIX gerado com sucesso!");
    } catch (error) {
      devLog.error(error);
      toast.error("Erro ao gerar pagamento. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleCardCheckout = async () => {
    const value = parseFloat(amount);
    if (isNaN(value) || value <= 0) {
      toast.error("Insira um valor válido.");
      return;
    }

    setCardLoading(true);
    try {
      const response = await fetch("/api/generate-card", {
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
      if (!response.ok) throw new Error(data.error || "Erro ao criar checkout");

      window.location.href = data.checkout_url;
    } catch (error) {
      devLog.error(error);
      toast.error("Erro ao redirecionar. Tente novamente.");
      setCardLoading(false);
    }
  };

  return (
    <>
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
              {gift.raised < gift.total && !gift.noValue && (
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Falta</p>
                  <p className="text-sm font-medium text-primary">
                    {brl(gift.total - gift.raised)}
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Seu Nome (Opcional)</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Queremos agradecer pessoalmente!"
                className="rounded-xl h-11"
              />
            </div>

            {!gift.noValue && (
              <div className="flex items-center gap-3 p-3 bg-secondary/30 rounded-xl">
                <Checkbox
                  id="preferStore"
                  checked={preferStore}
                  onCheckedChange={(v) => {
                    if (v === true) {
                      onOpenChange(false);
                      setTimeout(() => setReserveOpen(true), 200);
                    }
                    setPreferStore(v === true);
                  }}
                />
                <Label
                  htmlFor="preferStore"
                  className="text-sm cursor-pointer"
                >
                  Prefiro comprar na loja
                </Label>
              </div>
            )}

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
              <TabsList className="grid grid-cols-2 w-full rounded-full h-11">
                <TabsTrigger value="pix" className="rounded-full">
                  PIX
                </TabsTrigger>
                <TabsTrigger value="card" className="rounded-full">
                  Cartão
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
              <TabsContent value="card" className="mt-6">
                <Button
                  disabled
                  className="w-full h-14 rounded-full bg-muted text-muted-foreground text-lg font-medium cursor-not-allowed"
                >
                  Em breve!
                </Button>
                <p className="text-xs text-muted-foreground text-center mt-3">
                  Pagamento por cartão estará disponível em breve.
                </p>
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
                  {isExpired
                    ? "Expirado"
                    : `Expira em: ${formatTime(expiresIn)}`}
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
                  <Label className="text-center block">
                    Ou copie o código PIX
                  </Label>
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

            <div className="flex items-center gap-3 p-4 bg-primary/10 text-primary rounded-xl w-full">
              <Loader2 className="w-5 h-5 animate-spin shrink-0" />
              <p className="text-xs font-medium">
                Aguardando pagamento. Assim que o banco confirmar, esta tela
                será atualizada!
              </p>
            </div>
            <Button
              variant="outline"
              onClick={handleCancelPix}
              className="w-full h-12 rounded-full border-border/60 text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
            >
              Cancelar e voltar
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>

    <ReserveGiftSheet
      gift={gift}
      open={reserveOpen}
      onOpenChange={(v) => {
        setReserveOpen(v);
        if (!v) setPreferStore(false);
      }}
      onReserveSuccess={onReserveSuccess}
      mode="generic"
    />
    </>
  );
}

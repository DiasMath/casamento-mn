import { Check, ExternalLink, Gem, Lock, Gift } from "lucide-react";
import { useState, useCallback } from "react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { brl } from "@/lib/format";
import { calculatePercentage } from "@/lib/utils";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { Gift as GiftType } from "@/lib/firestoreService";
import { PaymentSheet } from "./PaymentSheet";
import { ThankYouSheet } from "./ThankYouSheet";
import { ReserveGiftSheet } from "./ReserveGiftSheet";
import { useGiftPayment } from "@/hooks/useGiftPayment";
import { GIFT_CATEGORIES } from "@/lib/constants";

interface GiftCardPublicProps {
  gift: GiftType;
}

export function GiftCardPublic({ gift }: GiftCardPublicProps) {
  const { settings } = useSiteSettings();
  const isChaActive = settings.chaDePanelaEnabled && gift.chaMode;
  const {
    localGift,
    payOpen,
    setPayOpen,
    thankYouOpen,
    setThankYouOpen,
    confirmedValue,
    handlePaymentSuccess,
  } = useGiftPayment(gift);

  const [reserveOpen, setReserveOpen] = useState(false);
  const [reserved, setReserved] = useState(!!localGift.reservedBy);

  const pct = calculatePercentage(localGift.raised, localGift.total);
  const completed = localGift.raised >= localGift.total;

  const handleReserveSuccess = useCallback(() => {
    setReserved(true);
    setReserveOpen(false);
  }, []);

  return (
    <>
      <div className={`bg-card rounded-xl overflow-hidden border shadow-sm flex flex-col h-full transition-all hover:shadow-md relative ${
        localGift.priority === "premium"
          ? "border-yellow-400/80 shadow-[0_0_15px_rgba(255,215,0,0.25)]"
          : "border-border/50"
      }`}>
        {/* Badge Reservado */}
        {reserved && (
          <div className="absolute top-2 left-2 z-10 bg-primary text-primary-foreground text-xs font-medium px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md">
            <Lock className="w-3 h-3" />
            Reservado
          </div>
        )}

        {/* Imagem mais baixa (aspect-video) */}
        <div className="aspect-video overflow-hidden bg-secondary relative">
          <picture>
            {localGift.imageDesktop && (
              <source media="(min-width: 640px)" srcSet={localGift.imageDesktop} />
            )}
            <img
              src={localGift.image}
              alt={localGift.title}
              className={`w-full h-full object-cover ${reserved ? "opacity-60" : ""}`}
            />
          </picture>
          {reserved && (
            <div className="absolute inset-0 flex items-center justify-center bg-primary/10 backdrop-blur-[1px]">
              <div className="bg-primary/90 text-primary-foreground rounded-full p-3 shadow-lg">
                <Lock className="w-6 h-6" />
              </div>
            </div>
          )}
        </div>

        {/* Padding reduzido (p-3) */}
        <div className="p-3 flex flex-col flex-1 gap-2.5">
          {/* Textos menores */}
          <div>
            <h3 className="font-medium text-sm line-clamp-1 text-foreground">
              {localGift.title}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1 italic">
              {localGift.marca || "Qualquer marca"}
            </p>
            {localGift.category && (
              <span className="inline-flex items-center text-xs text-muted-foreground mt-1">
                {
                  GIFT_CATEGORIES.find((c) => c.value === localGift.category)
                    ?.icon
                }{" "}
                {
                  GIFT_CATEGORIES.find((c) => c.value === localGift.category)
                    ?.label
                }
              </span>
            )}
          </div>

          {/* Status Reservado (qualquer modo) */}
          {reserved ? (
            <Button
              disabled
              size="sm"
              className={`w-full rounded-full h-11 text-sm cursor-not-allowed mt-auto ${
                localGift.priority === "premium"
                  ? "bg-yellow-500 text-yellow-950"
                  : "bg-primary text-primary-foreground"
              }`}
            >
              Reservado
            </Button>
          ) : isChaActive ? (
            <>
              {/* Modo Chá de Panela: Reserva */}
              <div className="space-y-2 mt-auto">
                {localGift.buyLink && (
                  <a
                    href={localGift.buyLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full rounded-full h-10 bg-secondary text-secondary-foreground text-sm font-medium hover:bg-secondary/80 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Comprar na loja
                  </a>
                )}
                <Button
                  onClick={() => setReserveOpen(true)}
                  size="sm"
                  className={`w-full rounded-full h-11 text-sm transition-transform active:scale-95 ${
                    localGift.priority === "premium"
                      ? "bg-yellow-500 text-yellow-950 hover:bg-yellow-400"
                      : "bg-primary text-primary-foreground hover:opacity-90"
                  }`}
                >
                  {localGift.priority === "premium" ? (
                    <Gem className="w-4 h-4 mr-1.5" />
                  ) : (
                    <Gift className="w-4 h-4 mr-1.5" />
                  )}
                  Reservar presente
                </Button>
              </div>
            </>
          ) : localGift.noValue ? (
            <>
              {/* Modo sem valor: apenas botão de presentear */}
              <div className="mt-auto">
                <Button
                  onClick={() => setPayOpen(true)}
                  disabled={completed}
                  size="sm"
                  className={`w-full rounded-full h-11 text-sm transition-transform active:scale-95 ${
                    localGift.priority === "premium"
                      ? "bg-yellow-500 text-yellow-950 hover:bg-yellow-400"
                      : "bg-primary text-primary-foreground hover:opacity-90"
                  }`}
                >
                  {completed ? (
                    <Check className="w-4 h-4 mr-1.5" />
                  ) : localGift.priority === "premium" ? (
                    <Gem className="w-4 h-4 mr-1.5" />
                  ) : (
                    <Gift className="w-4 h-4 mr-1.5" />
                  )}
                  {completed ? "Comprado" : "Presentear"}
                </Button>
              </div>
            </>
          ) : (
            <>
              {/* Modo Normal: Pagamento */}
              <div className="space-y-1 mt-auto">
                <Progress value={pct} className="h-1" />
                <div className="flex justify-between items-baseline text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">{pct}%</span>
                  <span>{brl(localGift.total)}</span>
                </div>
              </div>

              <Button
                onClick={() => setPayOpen(true)}
                disabled={completed}
                size="sm"
                className={`w-full rounded-full h-11 text-sm transition-transform active:scale-95 ${
                  localGift.priority === "premium"
                    ? "bg-yellow-500 text-yellow-950 hover:bg-yellow-400"
                    : "bg-primary text-primary-foreground hover:opacity-90"
                }`}
              >
                {completed ? (
                  <Check className="w-4 h-4 mr-1.5" />
                ) : localGift.priority === "premium" ? (
                  <Gem className="w-4 h-4 mr-1.5" />
                ) : (
                  <Gift className="w-4 h-4 mr-1.5" />
                )}
                {completed ? "Comprado" : "Presentear"}
              </Button>
            </>
          )}
        </div>
      </div>

      {!isChaActive && (
        <PaymentSheet
          gift={localGift}
          open={payOpen}
          onOpenChange={setPayOpen}
          onPaymentSuccess={handlePaymentSuccess}
          onReserveSuccess={handleReserveSuccess}
        />
      )}
      {isChaActive && (
        <ReserveGiftSheet
          gift={localGift}
          open={reserveOpen}
          onOpenChange={setReserveOpen}
          onReserveSuccess={handleReserveSuccess}
        />
      )}
      <ThankYouSheet
        open={thankYouOpen}
        onOpenChange={setThankYouOpen}
        value={confirmedValue}
        giftName={localGift.title}
      />
    </>
  );
}

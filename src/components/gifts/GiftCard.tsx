import { Pencil, Trash2, Check, Eye, EyeOff, FlaskConical } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { devLog } from "@/lib/devLog";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { brl } from "@/lib/format";
import { calculatePercentage } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { Gift, toggleGiftVisibility } from "@/lib/firestoreService";
import { EditGiftDialog } from "./EditGiftDialog";
import { DeleteGiftDialog } from "./DeleteGiftDialog";
import { PaymentSheet } from "./PaymentSheet";
import { ThankYouSheet } from "./ThankYouSheet";
import { toast } from "sonner";
import { GIFT_CATEGORIES, GIFT_PRIORITIES } from "@/lib/constants";

interface GiftCardProps {
  gift: Gift;
  onUpdate: () => void;
}

export function GiftCard({ gift, onUpdate }: GiftCardProps) {
  const { isAdmin } = useAuth();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [payOpen, setPayOpen] = useState(false);
  const [localGift, setLocalGift] = useState(gift);
  const [togglingVisibility, setTogglingVisibility] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [thankYouOpen, setThankYouOpen] = useState(false);
  const [confirmedValue, setConfirmedValue] = useState(0);

  useEffect(() => {
    setLocalGift((prev) => {
      if (gift.raised > prev.raised || gift.total !== prev.total) {
        return gift;
      }
      return prev;
    });
  }, [gift.raised, gift.total]);

  const pct = calculatePercentage(localGift.raised, localGift.total);
  const completed = localGift.raised >= localGift.total;

  const handlePaymentSuccess = useCallback((value: number) => {
    setLocalGift((prev) => ({
      ...prev,
      raised: prev.raised + value,
    }));
    setConfirmedValue(value);
    setPayOpen(false);
    setThankYouOpen(true);
    onUpdate();
  }, [onUpdate]);

  const handleSimulatePayment = async () => {
    const remaining = localGift.total - localGift.raised;
    if (remaining <= 0) return;
    const value = Math.min(remaining, 50);
    setSimulating(true);
    try {
      const res = await fetch("/api/test-webhook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          giftId: localGift.id,
          amount: value,
          contributorName: "Teste Admin",
        }),
      });
      if (!res.ok) throw new Error("Erro ao simular");
      toast.success(`Simulado: +R$ ${value.toFixed(2)} no presente`);
      setLocalGift((prev) => ({ ...prev, raised: prev.raised + value }));
      onUpdate();
    } catch {
      toast.error("Erro ao simular pagamento");
    } finally {
      setSimulating(false);
    }
  };

  const handleToggleVisibility = async () => {
    setTogglingVisibility(true);
    try {
      const newHidden = !localGift.hidden;
      await toggleGiftVisibility(localGift.id, newHidden);
      setLocalGift((prev) => ({ ...prev, hidden: newHidden }));
      toast.success(newHidden ? "Presente ocultado" : "Presente visível");
    } catch (error) {
      devLog.error("Erro ao alterar visibilidade:", error);
      toast.error("Erro ao alterar visibilidade");
    } finally {
      setTogglingVisibility(false);
    }
  };

  return (
    <>
      <div className="group bg-card rounded-2xl overflow-hidden border border-border/60 shadow-sm flex flex-col relative">
        {/* Badge de status (Oculto) */}
        {localGift.hidden && (
          <div className="absolute top-2 left-2 z-10 bg-yellow-500 text-white text-xs font-medium px-2 py-0.5 rounded-full">
            Oculto
          </div>
        )}

        {/* Botões de Ação (Apenas Admin) com Animações */}
        {isAdmin && (
          <div className="absolute top-2 right-2 z-10 flex gap-2">
            {!completed && (
              <Button
                size="icon"
                variant="secondary"
                className="w-11 h-11 rounded-full shadow-md transition-transform hover:scale-110 active:scale-95 bg-blue-100 text-blue-600 hover:bg-blue-200"
                onClick={handleSimulatePayment}
                disabled={simulating}
                title="Simular pagamento"
              >
                <FlaskConical className="w-5 h-5" />
              </Button>
            )}
            <Button
              size="icon"
              variant="secondary"
              className={`w-11 h-11 rounded-full shadow-md transition-transform hover:scale-110 active:scale-95 ${
                localGift.hidden
                  ? "bg-yellow-100 text-yellow-600 hover:bg-yellow-200"
                  : "bg-white text-green-600 hover:bg-green-50"
              }`}
              onClick={handleToggleVisibility}
              disabled={togglingVisibility}
              title={localGift.hidden ? "Tornar visível" : "Ocultar"}
            >
              {localGift.hidden ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </Button>
            <Button
              size="icon"
              variant="secondary"
              className="w-11 h-11 rounded-full shadow-md transition-transform hover:scale-110 active:scale-95 hover:bg-white hover:text-primary"
              onClick={() => setEditOpen(true)}
            >
              <Pencil className="w-5 h-5" />
            </Button>
            <Button
              size="icon"
              variant="destructive"
              className="w-11 h-11 rounded-full shadow-md transition-transform hover:scale-110 active:scale-95"
              onClick={() => setDeleteOpen(true)}
            >
              <Trash2 className="w-5 h-5" />
            </Button>
          </div>
        )}

        <div className="aspect-video overflow-hidden bg-secondary">
          <img
            src={localGift.image}
            alt={localGift.title}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="p-4 flex flex-col flex-1 gap-3">
          {/* Título e Marca */}
          <div>
            <h3 className="font-medium line-clamp-1">{localGift.title}</h3>
            {localGift.marca && (
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                {localGift.marca}
              </p>
            )}
          </div>

          {/* Badges de Categoria e Prioridade */}
          <div className="flex items-center gap-2 flex-wrap">
            {localGift.category && (
              <Badge variant="secondary" className="text-xs font-normal">
                {
                  GIFT_CATEGORIES.find((c) => c.value === localGift.category)
                    ?.icon
                }{" "}
                {
                  GIFT_CATEGORIES.find((c) => c.value === localGift.category)
                    ?.label
                }
              </Badge>
            )}
            {localGift.priority && (
              <Badge
                variant="outline"
                className={`text-xs font-normal ${
                  localGift.priority === "alta"
                    ? "border-red-300 text-red-600"
                    : localGift.priority === "media"
                      ? "border-yellow-300 text-yellow-600"
                      : "border-green-300 text-green-600"
                }`}
              >
                {
                  GIFT_PRIORITIES.find((p) => p.value === localGift.priority)
                    ?.icon
                }{" "}
                {
                  GIFT_PRIORITIES.find((p) => p.value === localGift.priority)
                    ?.label
                }
              </Badge>
            )}
          </div>

          {/* BARRA DE PROGRESSO E VALORES ATUALIZADOS AQUI */}
          <div className="space-y-1">
            <Progress value={pct} className="h-1.5" />
            <div className="flex justify-between items-baseline text-xs text-muted-foreground">
              <span className="font-medium text-foreground">{pct}%</span>
              <span className="font-medium text-foreground">
                {brl(localGift.total)}
              </span>
            </div>
          </div>

          <Button
            onClick={() => setPayOpen(true)}
            disabled={completed}
            className="w-full rounded-full transition-transform active:scale-95"
            variant={completed ? "secondary" : "default"}
          >
            {completed ? (
              <>
                <Check className="w-4 h-4 mr-2" /> Comprado
              </>
            ) : (
              "Presentear"
            )}
          </Button>
        </div>
      </div>

      {/* Modais de CRUD e Pagamento */}
      <EditGiftDialog
        gift={localGift}
        open={editOpen}
        onOpenChange={setEditOpen}
        onGiftUpdated={onUpdate}
      />
      <DeleteGiftDialog
        giftId={localGift.id}
        giftTitle={localGift.title}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onGiftDeleted={onUpdate}
      />
      <PaymentSheet
        gift={localGift}
        open={payOpen}
        onOpenChange={setPayOpen}
        onPaymentSuccess={handlePaymentSuccess}
      />
      <ThankYouSheet
        open={thankYouOpen}
        onOpenChange={setThankYouOpen}
        value={confirmedValue}
        giftName={localGift.title}
      />
    </>
  );
}

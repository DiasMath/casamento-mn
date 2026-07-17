import { Pencil, Trash2, Check, Eye, EyeOff, FlaskConical, Undo2, Loader2, ExternalLink, Gem, Lock, Gift, Copy } from "lucide-react";
import { useCallback, useEffect, useState, memo } from "react";
import { devLog } from "@/lib/devLog";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { brl } from "@/lib/format";
import { calculatePercentage } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { useCategories } from "@/hooks/useCategories";
import { Gift as GiftType, toggleGiftVisibility, cancelReservation } from "@/lib/firestoreService";
import { doc, updateDoc, increment, addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { EditGiftDialog } from "./EditGiftDialog";
import { DeleteGiftDialog } from "./DeleteGiftDialog";
import { PaymentSheet } from "./PaymentSheet";
import { ThankYouSheet } from "./ThankYouSheet";
import { ReserveGiftSheet } from "./ReserveGiftSheet";
import { AddGiftFAB } from "./AddGiftFAB";
import { toast } from "sonner";
import { GIFT_CATEGORIES, GIFT_PRIORITIES } from "@/lib/constants";

interface GiftCardProps {
  gift: GiftType;
  onUpdate: () => void;
}

const GiftCardComponent = ({ gift, onUpdate }: GiftCardProps) => {
  const { isAdmin } = useAuth();
  const { settings } = useSiteSettings();
  const { allCategories } = useCategories();
  const isChaActive = settings.chaDePanelaEnabled && gift.chaMode;
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [payOpen, setPayOpen] = useState(false);
  const [reserveOpen, setReserveOpen] = useState(false);
  const [localGift, setLocalGift] = useState(gift);
  const [togglingVisibility, setTogglingVisibility] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [cancellingReservation, setCancellingReservation] = useState(false);
  const [duplicateGift, setDuplicateGift] = useState<GiftType | null>(null);
  const [thankYouOpen, setThankYouOpen] = useState(false);
  const [confirmedValue, setConfirmedValue] = useState(0);

  useEffect(() => {
    setLocalGift(gift);
  }, [
    gift.id,
    gift.raised,
    gift.total,
    gift.title,
    gift.image,
    gift.category,
    gift.priority,
    gift.marca,
    gift.hidden,
    gift.reservedBy,
    gift.reservedAt,
    gift.buyLink,
    gift.noValue,
  ]);

  const pct = localGift.noValue ? 0 : calculatePercentage(localGift.raised, localGift.total);
  const completed = localGift.noValue ? false : localGift.raised >= localGift.total;

  const handlePaymentSuccess = useCallback(
    (value: number) => {
      setLocalGift((prev) => ({
        ...prev,
        raised: prev.raised + value,
      }));
      setConfirmedValue(value);
      setPayOpen(false);
      setThankYouOpen(true);
    },
    [],
  );

  const handleSimulatePayment = async () => {
    const remaining = localGift.total - localGift.raised;
    if (remaining <= 0 || !db) return;
    const value = Math.min(remaining, 50);
    setSimulating(true);
    try {
      await updateDoc(doc(db, "gifts", localGift.id), {
        raised: increment(value),
      });
      await addDoc(collection(db, "contributions"), {
        giftId: localGift.id,
        contributorName: "Teste Admin",
        value,
        date: serverTimestamp(),
        paymentId: `test-${Date.now()}`,
        method: "pix",
      });
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

  const handleCancelReservation = async () => {
    setCancellingReservation(true);
    try {
      await cancelReservation(localGift.id);
      setLocalGift((prev) => ({
        ...prev,
        reservedBy: undefined,
        reservedAt: undefined,
      }));
      toast.success("Reserva cancelada");
      onUpdate();
    } catch (error) {
      devLog.error("Erro ao cancelar reserva:", error);
      toast.error("Erro ao cancelar reserva");
    } finally {
      setCancellingReservation(false);
    }
  };

  const handleReserveSuccess = useCallback(() => {
    setLocalGift((prev) => ({
      ...prev,
      reservedBy: "Reservado",
      reservedAt: new Date() as any,
    }));
    onUpdate();
  }, [onUpdate]);

  const handleDuplicate = useCallback(() => {
    setDuplicateGift(localGift);
  }, [localGift]);

  return (
    <>
      <div className={`group bg-card rounded-2xl overflow-hidden border shadow-sm flex flex-col relative ${
        localGift.priority === "premium"
          ? "border-yellow-400/80 shadow-[0_0_15px_rgba(255,215,0,0.25)]"
          : "border-border/60"
      }`}>
        {/* Badge de status */}
        {localGift.hidden && (
          <div className="absolute top-2 left-2 z-10 bg-yellow-500 text-white text-xs font-medium px-2 py-0.5 rounded-full">
            Oculto
          </div>
        )}
        {localGift.reservedBy && !localGift.hidden && (
          <div className="absolute top-2 left-2 z-10 bg-primary text-primary-foreground text-xs font-medium px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md">
            <Lock className="w-3 h-3" />
            Reservado
          </div>
        )}
        {completed && !localGift.hidden && (
          <div className="absolute top-2 left-2 z-10 bg-green-600 text-white text-xs font-medium px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md">
            <Check className="w-3 h-3" />
            Concluído
          </div>
        )}

        {/* Botões de Ação (Apenas Admin) com Animações */}
        {isAdmin && (
          <div className="absolute top-2 right-2 z-10 flex gap-2">
            {!completed && !isChaActive && (
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
              variant="secondary"
              className="w-11 h-11 rounded-full shadow-md transition-transform hover:scale-110 active:scale-95 bg-purple-100 text-purple-600 hover:bg-purple-200"
              onClick={handleDuplicate}
              title="Duplicar presente"
            >
              <Copy className="w-5 h-5" />
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

        <div className="aspect-video overflow-hidden bg-secondary relative">
          <picture>
            {localGift.imageDesktop && (
              <source media="(min-width: 640px)" srcSet={localGift.imageDesktop} />
            )}
            <img
              src={localGift.image}
              alt={localGift.title}
              className={`w-full h-full object-cover ${localGift.reservedBy || completed ? "opacity-60" : ""}`}
            />
          </picture>
          {localGift.reservedBy && (
            <div className="absolute inset-0 flex items-center justify-center bg-primary/10 backdrop-blur-[1px]">
              <div className="bg-primary/90 text-primary-foreground rounded-full p-3 shadow-lg">
                <Lock className="w-6 h-6" />
              </div>
            </div>
          )}
          {completed && !localGift.reservedBy && (
            <div className="absolute inset-0 flex items-center justify-center bg-green-500/10 backdrop-blur-[1px]">
              <div className="bg-green-600/90 text-white rounded-full p-3 shadow-lg">
                <Check className="w-6 h-6" />
              </div>
            </div>
          )}
        </div>

        <div className="p-4 flex flex-col flex-1 gap-3">
          {/* Título e Marca */}
          <div>
            <h3 className="font-medium line-clamp-1">{localGift.title}</h3>
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1 italic">
              {localGift.marca || "Qualquer marca"}
            </p>
          </div>

          {/* Badges de Categoria e Prioridade */}
          <div className="flex items-center gap-2 flex-wrap">
            {localGift.category && (
              <Badge variant="secondary" className="text-xs font-normal">
                {
                  allCategories.find((c) => c.value === localGift.category)
                    ?.icon
                }{" "}
                {
                  allCategories.find((c) => c.value === localGift.category)
                    ?.label
                }
              </Badge>
            )}
            {localGift.priority && (
              <Badge
                variant="outline"
                className={`text-xs font-normal ${
                  localGift.priority === "premium"
                    ? "border-yellow-400 text-yellow-700 bg-yellow-50 shadow-[0_0_8px_rgba(255,215,0,0.3)]"
                    : localGift.priority === "alta"
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

          {/* Status Reservado (qualquer modo) */}
          {localGift.reservedBy ? (
            <div className="space-y-2 mt-auto">
              <Button
                disabled
                className={`w-full rounded-full transition-transform cursor-not-allowed ${
                  localGift.priority === "premium"
                    ? "bg-yellow-500 text-yellow-950"
                    : "bg-primary text-primary-foreground"
                }`}
              >
                Reservado
              </Button>
              {isAdmin && (
                <Button
                  onClick={handleCancelReservation}
                  disabled={cancellingReservation}
                  className="w-full rounded-full"
                  variant="outline"
                  size="sm"
                >
                  {cancellingReservation ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Undo2 className="w-4 h-4 mr-2" />
                  )}
                  Desreservar
                </Button>
              )}
            </div>
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
                  className={`w-full rounded-full transition-transform active:scale-95 ${
                    localGift.priority === "premium"
                      ? "bg-yellow-500 text-yellow-950 hover:bg-yellow-400"
                      : "bg-primary text-primary-foreground hover:opacity-90"
                  }`}
                >
                  {localGift.priority === "premium" ? (
                    <Gem className="w-4 h-4 mr-2" />
                  ) : (
                    <Gift className="w-4 h-4 mr-2" />
                  )}
                  Reservar presente
                </Button>
              </div>
            </>
          ) : localGift.noValue ? (
            <>
              {/* Modo sem valor: valor aberto */}
              <div className="mt-auto">
                <Button
                  onClick={() => setPayOpen(true)}
                  className={`w-full rounded-full transition-transform active:scale-95 ${
                    localGift.priority === "premium"
                      ? "bg-yellow-500 text-yellow-950 hover:bg-yellow-400"
                      : "bg-primary text-primary-foreground hover:opacity-90"
                  }`}
                >
                  {localGift.priority === "premium" ? (
                    <Gem className="w-4 h-4 mr-2" />
                  ) : (
                    <Gift className="w-4 h-4 mr-2" />
                  )}
                  Presentear
                </Button>
              </div>
            </>
          ) : (
            <>
              {/* Modo Normal: Pagamento */}
              <div className="space-y-1 mt-auto">
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
                className={`w-full rounded-full transition-transform active:scale-95 ${
                  localGift.priority === "premium"
                    ? "bg-yellow-500 text-yellow-950 hover:bg-yellow-400"
                    : "bg-primary text-primary-foreground hover:opacity-90"
                }`}
              >
                {completed ? (
                  <Check className="w-4 h-4 mr-2" />
                ) : localGift.priority === "premium" ? (
                  <Gem className="w-4 h-4 mr-2" />
                ) : (
                  <Gift className="w-4 h-4 mr-2" />
                )}
                {completed ? "Comprado" : "Presentear"}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Modais de CRUD e Pagamento */}
      <EditGiftDialog
        gift={localGift}
        open={editOpen}
        onOpenChange={setEditOpen}
        onGiftUpdated={onUpdate}
      />
      {isAdmin && duplicateGift && (
        <AddGiftFAB
          onGiftAdded={onUpdate}
          duplicateFrom={duplicateGift}
          onDuplicateClose={() => setDuplicateGift(null)}
        />
      )}
      <DeleteGiftDialog
        giftId={localGift.id}
        giftTitle={localGift.title}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onGiftDeleted={onUpdate}
      />
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
        onClose={onUpdate}
        value={confirmedValue}
        giftName={localGift.title}
      />
    </>
  );
};

export const GiftCard = memo(GiftCardComponent);

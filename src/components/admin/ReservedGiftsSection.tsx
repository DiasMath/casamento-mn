import { useState } from "react";
import { PackageCheck, Undo2, CheckCircle, Loader2, Calendar } from "lucide-react";
import { toast } from "sonner";
import { devLog } from "@/lib/devLog";
import { cancelReservation, type Gift } from "@/lib/firestoreService";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

function formatDate(timestamp: unknown): string {
  if (!timestamp) return "—";
  try {
    const date = typeof timestamp === "object" && "toDate" in timestamp
      ? (timestamp as { toDate: () => Date }).toDate()
      : new Date(timestamp as string | number);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
}

interface ReservedGiftsSectionProps {
  gifts: Gift[];
  onUpdate: () => void;
}

export function ReservedGiftsSection({ gifts, onUpdate }: ReservedGiftsSectionProps) {
  const [cancelling, setCancelling] = useState<string | null>(null);
  const [delivering, setDelivering] = useState<string | null>(null);

  const reservedGifts = gifts.filter((g) => g.reservedBy);

  const handleCancel = async (giftId: string) => {
    setCancelling(giftId);
    try {
      await cancelReservation(giftId);
      toast.success("Reserva cancelada. Presente voltou para a listagem.");
      onUpdate();
    } catch (err) {
      devLog.error(err);
      toast.error("Erro ao cancelar reserva.");
    } finally {
      setCancelling(null);
    }
  };

  const handleConfirmDelivery = async (giftId: string) => {
    setDelivering(giftId);
    try {
      const { updateGift } = await import("@/lib/firestoreService");
      await updateGift(giftId, { reservedBy: "Entregue", hidden: true });
      toast.success("Entrega confirmada!");
      onUpdate();
    } catch (err) {
      devLog.error(err);
      toast.error("Erro ao confirmar entrega.");
    } finally {
      setDelivering(null);
    }
  };

  if (reservedGifts.length === 0) {
    return (
      <div className="bg-card rounded-2xl border border-border/60 shadow-sm p-6">
        <h2 className="font-semibold text-lg text-primary flex items-center gap-2 mb-4">
          <PackageCheck className="w-5 h-5" /> Presentes Reservados
        </h2>
        <p className="text-sm text-muted-foreground text-center py-8">
          Nenhum presente reservado ainda.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl border border-border/60 shadow-sm overflow-hidden">
      <div className="px-4 sm:px-6 py-4 border-b bg-secondary/10">
        <h2 className="font-semibold text-lg text-primary flex items-center gap-2">
          <PackageCheck className="w-5 h-5" /> Presentes Reservados
        </h2>
        <p className="text-xs text-muted-foreground mt-1">
          {reservedGifts.length} {reservedGifts.length === 1 ? "presente reservado" : "presentes reservados"}
        </p>
      </div>

      {/* Desktop */}
      <div className="hidden md:block max-h-[500px] overflow-y-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[10px] uppercase text-muted-foreground border-b border-border">
              <th className="text-center px-6 py-3 font-bold">Presente</th>
              <th className="text-center px-6 py-3 font-bold">Reservado por</th>
              <th className="text-center px-6 py-3 font-bold">Data da Reserva</th>
              <th className="text-center px-6 py-3 font-bold">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {reservedGifts.map((g) => (
              <tr key={g.id} className="hover:bg-muted/20 transition-colors">
                <td className="px-6 py-4 text-center">
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-secondary shrink-0">
                      <img src={g.image} alt={g.title} className="w-full h-full object-contain" />
                    </div>
                    <div>
                      <p className="font-medium">{g.title}</p>
                      {g.marca && (
                        <p className="text-xs text-muted-foreground">{g.marca}</p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <Badge variant="secondary" className="text-xs">
                    {g.reservedBy}
                  </Badge>
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    {formatDate(g.reservedAt)}
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-full gap-1 text-green-600 hover:text-green-700 hover:bg-green-50"
                      disabled={delivering === g.id}
                      onClick={() => handleConfirmDelivery(g.id)}
                    >
                      {delivering === g.id ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <CheckCircle className="w-3 h-3" />
                      )}
                      Entregue
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-full gap-1 text-destructive hover:text-destructive"
                      disabled={cancelling === g.id}
                      onClick={() => handleCancel(g.id)}
                    >
                      {cancelling === g.id ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Undo2 className="w-3 h-3" />
                      )}
                      Cancelar
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile */}
      <div className="md:hidden divide-y max-h-[500px] overflow-y-auto">
        {reservedGifts.map((g) => (
          <div key={g.id} className="p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg overflow-hidden bg-secondary shrink-0">
                <img src={g.image} alt={g.title} className="w-full h-full object-contain" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{g.title}</p>
                {g.marca && (
                  <p className="text-xs text-muted-foreground">{g.marca}</p>
                )}
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="text-[10px]">
                    {g.reservedBy}
                  </Badge>
                  <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    {formatDate(g.reservedAt)}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="flex-1 rounded-full gap-1 text-green-600"
                disabled={delivering === g.id}
                onClick={() => handleConfirmDelivery(g.id)}
              >
                {delivering === g.id ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <CheckCircle className="w-3 h-3" />
                )}
                Entregue
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="flex-1 rounded-full gap-1 text-destructive"
                disabled={cancelling === g.id}
                onClick={() => handleCancel(g.id)}
              >
                {cancelling === g.id ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Undo2 className="w-3 h-3" />
                )}
                Cancelar
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

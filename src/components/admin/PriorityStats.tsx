import { useMemo } from "react";
import type { Gift, GiftPriority } from "@/lib/firestoreService";
import { GIFT_PRIORITIES } from "@/lib/constants";
import { brl } from "@/lib/format";

interface PriorityStatsProps {
  gifts: Gift[];
}

interface PriorityData {
  priority: GiftPriority;
  label: string;
  icon: string;
  color: string;
  bgColor: string;
  count: number;
  total: number;
  raised: number;
  remaining: number;
  completed: number;
  pct: number;
}

const PRIORITY_STYLES: Record<
  GiftPriority,
  { color: string; bgColor: string; borderColor: string }
> = {
  alta: {
    color: "text-red-600",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
  },
  media: {
    color: "text-yellow-600",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-200",
  },
  baixa: {
    color: "text-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
  },
};

export function PriorityStats({ gifts }: PriorityStatsProps) {
  const data = useMemo<PriorityData[]>(() => {
    const map = new Map<GiftPriority, PriorityData>();

    GIFT_PRIORITIES.forEach((p) => {
      const styles = PRIORITY_STYLES[p.value];
      map.set(p.value, {
        priority: p.value,
        label: p.label,
        icon: p.icon,
        color: styles.color,
        bgColor: styles.bgColor,
        count: 0,
        total: 0,
        raised: 0,
        remaining: 0,
        completed: 0,
        pct: 0,
      });
    });

    gifts.forEach((g) => {
      const entry = map.get(g.priority ?? "media");
      if (!entry) return;
      entry.count++;
      entry.total += g.total;
      entry.raised += g.raised;
      if (g.raised >= g.total) entry.completed++;
    });

    return Array.from(map.values())
      .map((entry) => ({
        ...entry,
        remaining: Math.max(0, entry.total - entry.raised),
        pct:
          entry.total > 0
            ? Math.min(100, Math.round((entry.raised / entry.total) * 100))
            : 0,
      }))
      .sort((a, b) => {
        const order: GiftPriority[] = ["alta", "media", "baixa"];
        return order.indexOf(a.priority) - order.indexOf(b.priority);
      });
  }, [gifts]);

  return (
    <div className="bg-card rounded-2xl border border-border/60 shadow-sm p-5">
      <h3 className="font-semibold text-lg text-primary mb-4">
        Indicadores por Prioridade
      </h3>

      <div className="space-y-4">
        {data.map((d) => (
          <div
            key={d.priority}
            className={`p-4 rounded-xl border ${PRIORITY_STYLES[d.priority].borderColor} ${PRIORITY_STYLES[d.priority].bgColor}`}
          >
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold text-sm">
                {d.icon} {d.label}
              </span>
              <span className="text-xs text-muted-foreground">
                {d.count} {d.count === 1 ? "presente" : "presentes"}
              </span>
            </div>
            <div className="relative h-5 bg-secondary/50 rounded-full overflow-hidden mb-3">
              <div
                className={`absolute inset-y-0 left-0 rounded-full transition-all ${
                  d.pct >= 100
                    ? "bg-green-200"
                    : d.pct >= 50
                      ? "bg-yellow-200"
                      : "bg-red-200"
                }`}
                style={{ width: `${d.pct}%` }}
              />
              <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-foreground mix-blend-difference">
                {d.pct}%
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <span className="text-muted-foreground">
                Arrecadado:{" "}
                <span className="font-bold text-foreground">
                  {brl(d.raised)}
                </span>
              </span>
              <span className="text-muted-foreground">
                Restante:{" "}
                <span className="font-bold text-foreground">
                  {brl(d.remaining)}
                </span>
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

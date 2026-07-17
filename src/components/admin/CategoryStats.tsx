import { useMemo, useState } from "react";
import type { Gift, GiftCategory, GiftPriority } from "@/lib/firestoreService";
import { GIFT_PRIORITIES } from "@/lib/constants";
import { useCategories } from "@/hooks/useCategories";
import { brl } from "@/lib/format";

interface CategoryStatsProps {
  gifts: Gift[];
}

interface CategoryData {
  category: string;
  label: string;
  icon: string;
  count: number;
  total: number;
  raised: number;
  remaining: number;
  completed: number;
  pct: number;
}

const PRIORITY_COLORS: Record<GiftPriority, string> = {
  premium: "text-yellow-600 bg-yellow-50 border-yellow-200",
  alta: "text-red-600 bg-red-50 border-red-200",
  media: "text-yellow-600 bg-yellow-50 border-yellow-200",
  baixa: "text-green-600 bg-green-50 border-green-200",
};

function PriorityBadge({ priority }: { priority: GiftPriority }) {
  const p = GIFT_PRIORITIES.find((x) => x.value === priority);
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold border ${PRIORITY_COLORS[priority]}`}
    >
      {p?.icon} {p?.label}
    </span>
  );
}

function ProgressBar({ pct }: { pct: number }) {
  return (
    <div className="relative h-5 bg-secondary rounded-full overflow-hidden">
      <div
        className={`absolute inset-y-0 left-0 rounded-full transition-all ${
          pct >= 100
            ? "bg-green-200"
            : pct >= 50
              ? "bg-yellow-200"
              : "bg-red-200"
        }`}
        style={{ width: `${pct}%` }}
      />
      <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-foreground mix-blend-difference">
        {pct}%
      </span>
    </div>
  );
}

export function CategoryStats({ gifts }: CategoryStatsProps) {
  const { allCategories } = useCategories();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const data = useMemo<CategoryData[]>(() => {
    const map = new Map<string, CategoryData>();

    allCategories.forEach((cat) => {
      map.set(cat.value, {
        category: cat.value,
        label: cat.label,
        icon: cat.icon,
        count: 0,
        total: 0,
        raised: 0,
        remaining: 0,
        completed: 0,
        pct: 0,
      });
    });

    gifts.forEach((g) => {
      const entry = map.get(g.category ?? "outros");
      if (!entry) return;
      entry.count++;
      entry.total += g.noValue ? 0 : g.total;
      entry.raised += g.raised;
      if (!g.noValue && g.raised >= g.total) entry.completed++;
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
      .filter((entry) => entry.count > 0)
      .sort((a, b) => b.raised - a.raised);
  }, [gifts, allCategories]);

  const filteredGifts = useMemo(
    () =>
      selectedCategory
        ? gifts.filter((g) => (g.category ?? "outros") === selectedCategory)
        : [],
    [gifts, selectedCategory],
  );

  const selectedData = useMemo(
    () => data.find((d) => d.category === selectedCategory) ?? null,
    [data, selectedCategory],
  );

  const totals = useMemo(
    () => ({
      count: data.reduce((s, d) => s + d.count, 0),
      total: data.reduce((s, d) => s + d.total, 0),
      raised: data.reduce((s, d) => s + d.raised, 0),
    }),
    [data],
  );

  return (
    <div className="bg-card rounded-2xl border border-border/60 shadow-sm p-5">
      {/* Header com botão voltar */}
      <div className="flex items-center gap-3 mb-4">
        {selectedCategory && (
          <button
            onClick={() => setSelectedCategory(null)}
            className="flex items-center gap-1 text-sm text-primary hover:underline font-medium cursor-pointer"
          >
            ← Voltar
          </button>
        )}
        <h3 className="font-semibold text-lg text-primary">
          {selectedCategory
            ? `${selectedData?.icon} ${selectedData?.label}`
            : "Indicadores por Categoria"}
        </h3>
      </div>

      {/* VISÃO GERAL — tabela */}
      {!selectedCategory && (
        <>
          <div className="hidden md:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[10px] uppercase text-muted-foreground border-b border-border">
                  <th className="text-center pb-2 font-bold">Categoria</th>
                  <th className="text-center pb-2 font-bold">Qtd</th>
                  <th className="text-center pb-2 font-bold">Arrecadado</th>
                  <th className="text-center pb-2 font-bold">Meta</th>
                  <th className="text-center pb-2 font-bold">Restante</th>
                  <th className="text-center pb-2 font-bold w-32">Progresso</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {data.map((d) => (
                  <tr
                    key={d.category}
                    onClick={() => setSelectedCategory(d.category)}
                    className="hover:bg-muted/20 transition-colors cursor-pointer"
                  >
                    <td className="py-3 text-center font-medium">
                      {d.icon} {d.label}
                    </td>
                    <td className="py-3 text-center text-muted-foreground">
                      {d.count}
                    </td>
                    <td className="py-3 text-center font-medium tabular-nums">
                      {brl(d.raised)}
                    </td>
                    <td className="py-3 text-center tabular-nums text-muted-foreground">
                      {d.total > 0 ? brl(d.total) : "—"}
                    </td>
                    <td className="py-3 text-center tabular-nums text-muted-foreground">
                      {d.total > 0 ? brl(d.remaining) : "—"}
                    </td>
                    <td className="py-3 text-center px-2">
                      <ProgressBar pct={d.pct} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* VISÃO GERAL — mobile cards */}
          <div className="md:hidden space-y-3">
            {data.map((d) => (
              <button
                key={d.category}
                onClick={() => setSelectedCategory(d.category)}
                className="w-full p-3 rounded-xl border border-border/40 space-y-2 text-left hover:bg-muted/20 transition-colors cursor-pointer"
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium text-sm">
                    {d.icon} {d.label}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {d.count} {d.count === 1 ? "presente" : "presentes"}
                  </span>
                </div>
                <ProgressBar pct={d.pct} />
                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                  <span>
                    Arrecadado:{" "}
                    <span className="font-bold text-foreground">
                      {brl(d.raised)}
                    </span>
                  </span>
                  {d.total > 0 && (
                    <span>
                      Restante:{" "}
                      <span className="font-bold text-foreground">
                        {brl(d.remaining)}
                      </span>
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Totais */}
          {totals.count > 0 && (
            <div className="mt-4 pt-3 border-t border-border/40 flex justify-between text-xs font-medium text-muted-foreground">
              <span>
                Total:{" "}
                <span className="text-foreground font-bold">
                  {totals.count} presentes
                </span>
              </span>
              <span>
                {brl(totals.raised)} / {brl(totals.total)}
              </span>
            </div>
          )}
        </>
      )}

      {/* DETALHE — presentes da categoria */}
      {selectedCategory && selectedData && (
        <>
          {/* Resumo da categoria */}
          <div className="mb-4 p-3 rounded-xl bg-muted/30 border border-border/40">
            <div className="flex justify-between text-sm text-muted-foreground mb-2">
              <span>
                {selectedData.count}{" "}
                {selectedData.count === 1 ? "presente" : "presentes"} ·{" "}
                {brl(selectedData.raised)} / {brl(selectedData.total)}
              </span>
              <span className="font-bold text-foreground">
                {selectedData.pct}%
              </span>
            </div>
            <ProgressBar pct={selectedData.pct} />
          </div>

          {/* Desktop: tabela detalhada */}
          <div className="hidden md:block max-h-[400px] overflow-y-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[10px] uppercase text-muted-foreground border-b border-border">
                  <th className="text-center pb-2 font-bold">Presente</th>
                  <th className="text-center pb-2 font-bold">Marca</th>
                  <th className="text-center pb-2 font-bold">Prioridade</th>
                  <th className="text-center pb-2 font-bold">Arrecadado</th>
                  <th className="text-center pb-2 font-bold">Meta</th>
                  <th className="text-center pb-2 font-bold w-32">Progresso</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {filteredGifts
                  .sort((a, b) => a.raised - b.raised || a.total - b.total)
                  .map((g) => {
                    const pct =
                      g.noValue ? 0 :
                      g.total > 0
                        ? Math.min(100, Math.round((g.raised / g.total) * 100))
                        : 0;
                    return (
                      <tr
                        key={g.id}
                        className="hover:bg-muted/20 transition-colors"
                      >
                        <td className="py-3 text-center font-medium">
                          {g.title}
                        </td>
                        <td className="py-3 text-center text-muted-foreground text-xs">
                          {g.marca || "—"}
                        </td>
                        <td className="py-3 text-center">
                          <PriorityBadge priority={g.priority ?? "media"} />
                        </td>
                        <td className="py-3 text-center font-medium tabular-nums">
                          {brl(g.raised)}
                        </td>
                        <td className="py-3 text-center tabular-nums text-muted-foreground">
                          {g.noValue ? "—" : brl(g.total)}
                        </td>
                        <td className="py-3 text-center px-2">
                          <ProgressBar pct={pct} />
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>

          {/* Mobile: cards detalhados */}
          <div className="md:hidden space-y-3 max-h-[400px] overflow-y-auto">
            {filteredGifts
              .sort((a, b) => a.raised - b.raised || a.total - b.total)
              .map((g) => {
                const pct =
                  g.noValue ? 0 :
                  g.total > 0
                    ? Math.min(100, Math.round((g.raised / g.total) * 100))
                    : 0;
                return (
                  <div
                    key={g.id}
                    className="p-3 rounded-xl border border-border/40 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm truncate">
                          {g.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {g.marca || "Sem marca"}
                        </p>
                      </div>
                      <PriorityBadge priority={g.priority ?? "media"} />
                    </div>
                    {!g.noValue && <ProgressBar pct={pct} />}
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>
                        Arrecadado:{" "}
                        <span className="font-bold text-foreground">
                          {brl(g.raised)}
                        </span>
                      </span>
                      {!g.noValue && (
                        <span>
                          Restante:{" "}
                          <span className="font-bold text-foreground">
                            {brl(Math.max(0, g.total - g.raised))}
                          </span>
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </>
      )}
    </div>
  );
}

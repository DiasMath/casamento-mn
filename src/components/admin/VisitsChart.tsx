import { useMemo, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { AnalyticsDay } from "@/lib/firestoreService";
import { Eye } from "lucide-react";

interface VisitsChartProps {
  daily: AnalyticsDay[];
}

type Period = "7d" | "30d" | "6m" | "1y";

const PERIOD_LABELS: Record<Period, string> = {
  "7d": "7 dias",
  "30d": "30 dias",
  "6m": "6 meses",
  "1y": "1 ano",
};

function filterByPeriod(daily: AnalyticsDay[], period: Period): AnalyticsDay[] {
  const now = new Date();
  const cutoff = new Date();

  switch (period) {
    case "7d":
      cutoff.setDate(now.getDate() - 7);
      break;
    case "30d":
      cutoff.setDate(now.getDate() - 30);
      break;
    case "6m":
      cutoff.setMonth(now.getMonth() - 6);
      break;
    case "1y":
      cutoff.setFullYear(now.getFullYear() - 1);
      break;
  }

  const cutoffStr = cutoff.toISOString().slice(0, 10);
  return daily.filter((d) => d.date >= cutoffStr);
}

function formatLabel(dateStr: string, period: Period): string {
  const d = new Date(dateStr + "T12:00:00");
  if (period === "7d" || period === "30d") {
    return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
  }
  return d.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" });
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-xl px-3 py-2 shadow-md">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className="text-sm font-bold text-primary">
        {payload[0].value} {payload[0].value === 1 ? "acesso" : "acessos"}
      </p>
    </div>
  );
}

export function VisitsChart({ daily }: VisitsChartProps) {
  const [period, setPeriod] = useState<Period>("30d");

  const data = useMemo(() => {
    const filtered = filterByPeriod(daily, period);
    return filtered.map((d) => ({
      label: formatLabel(d.date, period),
      views: d.views,
    }));
  }, [daily, period]);

  const total = useMemo(() => data.reduce((s, d) => s + d.views, 0), [data]);

  return (
    <div className="bg-card rounded-2xl border border-border/60 shadow-sm p-5">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-5">
        <div>
          <h3 className="font-semibold text-lg text-primary flex items-center gap-2">
            <Eye className="w-5 h-5" /> Acessos por Período
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Total no período:{" "}
            <span className="font-bold text-foreground">
              {total} {total === 1 ? "acesso" : "acessos"}
            </span>
          </p>
        </div>
        <div className="flex gap-1 bg-secondary/50 rounded-full p-1">
          {(Object.keys(PERIOD_LABELS) as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-2 rounded-full text-xs font-medium transition-all ${
                period === p
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {PERIOD_LABELS[p]}
            </button>
          ))}
        </div>
      </div>

      {data.length === 0 ? (
        <div className="flex items-center justify-center h-[250px] text-muted-foreground text-sm">
          Nenhum acesso no período selecionado.
        </div>
      ) : (
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="hsl(var(--primary))"
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="95%"
                    stopColor="hsl(var(--primary))"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                className="stroke-border/40"
              />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="views"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                fill="url(#colorVisits)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

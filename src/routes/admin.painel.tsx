import { useEffect, useState, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  TrendingUp,
  Users,
  CheckCircle,
  ArrowRight,
  Gift as GiftIcon,
  PackageCheck,
  Tag,
  ArrowLeft,
  Wallet,
  Timer,
  Hourglass,
} from "lucide-react";
import { getGifts, Gift, getRSVPs, RSVP } from "../lib/firestoreService";
import { brl } from "@/lib/format";
import { calculatePercentage } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { WEDDING_DATE } from "@/lib/constants";

export function AdminPainel() {
  const { isAdmin, loading } = useAuth();
  const navigate = useNavigate();

  const [gifts, setGifts] = useState<Gift[]>([]);
  const [rsvps, setRsvps] = useState<RSVP[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const loadData = useCallback(async () => {
    try {
      setLoadingData(true);
      const [giftList, rsvpList] = await Promise.all([getGifts(), getRSVPs()]);
      console.log("[AdminPainel] Gifts carregados:", giftList);
      console.log("[AdminPainel] RSVPs carregados:", rsvpList);
      setGifts(giftList);
      setRsvps(rsvpList);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoadingData(false);
    }
  }, []);

  useEffect(() => {
    if (!loading && !isAdmin) navigate("/admin/login");
  }, [loading, isAdmin, navigate]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "-";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading || loadingData) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-muted-foreground">
          Carregando painel administrativo...
        </p>
      </div>
    );
  }

  // Cálculos de Presentes
  const totalRaised = gifts.reduce((s, g) => s + g.raised, 0);
  const totalGoal = gifts.reduce((s, g) => s + g.total, 0);
  const remainingValue = Math.max(0, totalGoal - totalRaised);
  const overallPct =
    totalGoal > 0
      ? Math.min(100, Math.round((totalRaised / totalGoal) * 100))
      : 0;

  const guaranteedGifts = gifts.filter((g) => g.raised >= g.total).length;
  const giftsInProgress = gifts.filter(
    (g) => g.raised > 0 && g.raised < g.total,
  ).length;

  // Cálculo de dias para o casamento
  const diffTime = new Date(WEDDING_DATE).getTime() - new Date().getTime();
  const daysUntil = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  // Métricas de RSVP
  const totalPeopleConfirmed = rsvps.reduce(
    (s, r) => s + (Number(r.guestsCount) || 1),
    0,
  );

  const stats = [
    { label: "Meta da Lista", value: brl(totalGoal), icon: GiftIcon },
    {
      label: "Total Arrecadado",
      value: brl(totalRaised),
      icon: TrendingUp,
      showPct: true,
    },
    { label: "Valor Restante", value: brl(remainingValue), icon: Wallet },
    {
      label: "Status dos Presentes",
      value: `${gifts.length} Total`,
      icon: GiftIcon,
      subtext: `${guaranteedGifts} Concluídos • ${giftsInProgress} Em Andamento`,
    },
    {
      label: "Dias para o Casamento",
      value: `${daysUntil} dias`,
      icon: Hourglass,
    },
    {
      label: "Total de Pessoas",
      value: totalPeopleConfirmed.toString(),
      icon: Users,
    },
    {
      label: "Famílias/Grupos",
      value: rsvps.length.toString(),
      icon: CheckCircle,
    },
  ];

  return (
    <section className="px-4 pt-10 pb-20 max-w-6xl mx-auto space-y-10">
      <div className="flex justify-between items-center">
        <div>
          <p className="font-script text-3xl text-primary">olá, noivos</p>
          <h1 className="text-3xl font-semibold mt-1">Painel Administrativo</h1>
        </div>
        <Button variant="outline" asChild className="rounded-full gap-2">
          <Link to="/">
            <ArrowLeft className="w-4 h-4" /> Voltar ao Site
          </Link>
        </Button>
      </div>

      {/* Grid de Estatísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="bg-card p-5 rounded-2xl border border-border/60 shadow-sm flex flex-col justify-between h-full"
          >
            <div>
              <div className="flex justify-between text-muted-foreground mb-2">
                <span className="text-[10px] uppercase font-bold tracking-wider leading-tight">
                  {s.label}
                </span>
                <s.icon className="w-4 h-4 text-primary shrink-0" />
              </div>
              <p className="text-xl font-bold">{s.value}</p>
              {s.subtext && (
                <p className="text-[12px] text-muted-foreground mt-1 font-medium italic">
                  {s.subtext}
                </p>
              )}
            </div>

            {s.showPct && (
              <div className="mt-4">
                <div className="flex justify-between items-center text-[10px] font-medium text-muted-foreground mb-1.5">
                  <span>Progresso</span>
                  <span>{overallPct}%</span>
                </div>
                <Progress value={overallPct} className="h-1.5" />
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="space-y-8">
        {/* Tabela de Presentes */}
        <div className="bg-card rounded-2xl border border-border/60 shadow-sm overflow-hidden">
          <div className="px-4 sm:px-6 py-4 border-b bg-secondary/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <h2 className="font-semibold text-lg text-primary flex items-center gap-2">
              <GiftIcon className="w-5 h-5" /> Detalhamento dos Presentes
            </h2>
            <Button asChild variant="link" size="sm" className="text-xs">
              <Link to="/present-list">
                Editar na Lista <ArrowRight className="ml-1 w-3 h-3" />
              </Link>
            </Button>
          </div>
          {/* Desktop: tabela | Mobile: cards */}
          <div className="hidden md:block max-h-[400px] overflow-y-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead className="sticky top-0 bg-card z-10 shadow-sm">
                <tr className="bg-muted/50 text-muted-foreground text-[10px] uppercase">
                  <th className="px-6 py-3 font-bold border-b border-border">
                    Presente / Marca
                  </th>
                  <th className="px-6 py-3 font-bold border-b border-border">
                    Progresso
                  </th>
                  <th className="px-6 py-3 font-bold text-right border-b border-border">
                    Arrecadado
                  </th>
                  <th className="px-6 py-3 font-bold text-right border-b border-border">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {gifts.map((g) => {
                  const pct = calculatePercentage(g.raised, g.total);
                  return (
                    <tr
                      key={g.id}
                      className="hover:bg-muted/20 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <p className="font-medium line-clamp-1">{g.title}</p>
                        {g.marca && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                            <Tag className="w-3 h-3" /> {g.marca}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 min-w-[150px]">
                        <div className="space-y-1">
                          <Progress value={pct} className="h-1.5" />
                          <span className="text-[10px] font-medium text-muted-foreground">
                            {pct}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right font-medium tabular-nums">
                        {brl(g.raised)}
                      </td>
                      <td className="px-6 py-4 text-right tabular-nums text-muted-foreground">
                        {brl(g.total)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {/* Mobile: cards */}
          <div className="md:hidden divide-y">
            {gifts.map((g) => {
              const pct = calculatePercentage(g.raised, g.total);
              return (
                <div key={g.id} className="p-4 space-y-3">
                  <div>
                    <p className="font-medium">{g.title}</p>
                    {g.marca && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                        <Tag className="w-3 h-3" /> {g.marca}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex-1 mr-4">
                      <Progress value={pct} className="h-2" />
                    </div>
                    <span className="text-sm font-medium text-muted-foreground">
                      {pct}%
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Arrecadado:</span>
                    <span className="font-medium">{brl(g.raised)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total:</span>
                    <span className="text-muted-foreground">{brl(g.total)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tabela de RSVP */}
        <div className="bg-card rounded-2xl border border-border/60 shadow-sm overflow-hidden">
          <div className="px-4 sm:px-6 py-4 border-b bg-secondary/10">
            <h2 className="font-semibold text-lg text-primary flex items-center gap-2">
              <Users className="w-5 h-5" /> Confirmações
            </h2>
          </div>
          {/* Desktop: tabela | Mobile: cards */}
          <div className="hidden md:block max-h-[400px] overflow-y-auto">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-card z-10 shadow-sm">
                <tr className="bg-muted/50 text-muted-foreground text-[10px] uppercase">
                  <th className="px-6 py-3 font-bold border-b border-border">
                    Data
                  </th>
                  <th className="px-6 py-3 font-bold border-b border-border">
                    Nome
                  </th>
                  <th className="px-6 py-3 font-bold text-center border-b border-border">
                    Dependentes
                  </th>
                  <th className="px-6 py-3 font-bold text-center border-b border-border">
                    Total Grupo
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {rsvps.map((r) => (
                  <tr
                    key={r.id}
                    className="hover:bg-muted/20 transition-colors"
                  >
                    <td className="px-6 py-4 text-xs text-muted-foreground whitespace-nowrap">
                      {formatDate(r.confirmedAt)}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium">{r.name}</p>
                      {r.email && (
                        <p className="text-xs text-muted-foreground">
                          {r.email}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center text-sm text-muted-foreground">
                      {Math.max(0, r.guestsCount - 1)}
                    </td>
                    <td className="px-6 py-4 text-center font-bold text-primary">
                      {r.guestsCount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Mobile: cards */}
          <div className="md:hidden divide-y">
            {rsvps.map((r) => (
              <div key={r.id} className="p-4 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{r.name}</p>
                    {r.email && (
                      <p className="text-xs text-muted-foreground">{r.email}</p>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(r.confirmedAt)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Total grupo:</span>
                  <span className="font-bold text-primary">{r.guestsCount} pessoas</span>
                </div>
              </div>
            ))}
            {rsvps.length === 0 && (
              <div className="p-8 text-center text-muted-foreground">
                Nenhuma confirmação ainda
              </div>
            )}
          </div>
          {rsvps.length > 0 && (
            <div className="px-6 py-3 bg-muted/30 text-right text-xs font-medium text-muted-foreground">
              Total Geral de Convidados: {totalPeopleConfirmed}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

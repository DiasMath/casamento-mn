import { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { devLog } from "@/lib/devLog";
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
  LogOut,
  Plus,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  X,
  Eye,
} from "lucide-react";
import {
  getGifts,
  Gift,
  getRSVPs,
  RSVP,
  RSVPType,
  getContributions,
  Contribution,
  getAnalyticsStats,
  AnalyticsStats,
} from "../lib/firestoreService";
import { brl } from "@/lib/format";
import { calculatePercentage } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  GIFT_PRIORITIES,
} from "@/lib/constants";
import { ContributionChart } from "@/components/admin/ContributionChart";
import { CategoryStats } from "@/components/admin/CategoryStats";
import { PriorityStats } from "@/components/admin/PriorityStats";
import { SiteImagesDialog } from "@/components/admin/SiteImagesSection";
import { PaletteDialog } from "@/components/admin/PaletteDialog";
import { GeneralSettingsDialog } from "@/components/admin/GeneralSettingsDialog";
import { CategoryDialog } from "@/components/admin/CategoryDialog";
import { ReservedGiftsSection } from "@/components/admin/ReservedGiftsSection";
import { AddRSVPDialog } from "@/components/admin/AddRSVPDialog";
import { VisitsChart } from "@/components/admin/VisitsChart";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { useCategories } from "@/hooks/useCategories";

export function AdminPainel() {
  const { isAdmin, loading, logout } = useAuth();
  const { settings } = useSiteSettings();
  const { allCategories } = useCategories();
  const navigate = useNavigate();

  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    await logout();
    navigate("/");
  };

  const [gifts, setGifts] = useState<Gift[]>([]);
  const [rsvps, setRsvps] = useState<RSVP[]>([]);
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsStats>({ totalViews: 0, daily: [] });
  const [loadingData, setLoadingData] = useState(true);

  const loadData = useCallback(async () => {
    try {
      setLoadingData(true);
      const [giftList, rsvpList, contribList, analyticsData] = await Promise.all([
        getGifts(),
        getRSVPs(),
        getContributions(),
        getAnalyticsStats(),
      ]);
      setGifts(giftList);
      setRsvps(rsvpList);
      setContributions(contribList);
      setAnalytics(analyticsData);
    } catch (error) {
      devLog.error("Erro ao carregar dados:", error);
    } finally {
      setLoadingData(false);
    }
  }, []);

  useEffect(() => {
    if (!loading && !isAdmin && !loggingOut) navigate("/admin/login");
  }, [loading, isAdmin, navigate, loggingOut]);

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

  // RSVP filters
  const [rsvpFilterStatus, setRsvpFilterStatus] = useState<"all" | "confirmed" | "declined">("all");
  const [rsvpFilterReserved, setRsvpFilterReserved] = useState<"all" | "yes" | "no">("all");
  const [rsvpFilterType, setRsvpFilterType] = useState<"all" | RSVPType>("all");
  const [addRsvpOpen, setAddRsvpOpen] = useState(false);

  // Métricas de reservas (cha de panela)
  const reservedGifts = gifts.filter((g) => g.reservedBy);
  const reservedCount = reservedGifts.length;

  // Cálculo de dias para o casamento
  const diffTime = new Date(`${settings.weddingDate}T${settings.weddingTime}:00`).getTime() - new Date().getTime();
  const daysUntil = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  // Cálculo de dias para o chá de panela
  const chaDiffTime = new Date(`${settings.chaDate}T${settings.chaTime}:00`).getTime() - new Date().getTime();
  const daysUntilCha = Math.ceil(chaDiffTime / (1000 * 60 * 60 * 24));

  // Métricas de RSVP (apenas confirmados)
  const attendingRsvps = rsvps.filter((r) => r.attending !== false);
  const declinedRsvps = rsvps.filter((r) => r.attending === false);
  const totalPeopleConfirmed = attendingRsvps.reduce(
    (s, r) => s + (Number(r.guestsCount) || 1),
    0,
  );

  // Set of names that reserved gifts
  const reservedByNames = useMemo(() => {
    return new Set(gifts.filter((g) => g.reservedBy && g.reservedBy !== "Entregue").map((g) => g.reservedBy!.toLowerCase()));
  }, [gifts]);

  const filteredRsvps = useMemo(() => {
    return rsvps.filter((r) => {
      if (rsvpFilterStatus === "confirmed" && r.attending === false) return false;
      if (rsvpFilterStatus === "declined" && r.attending !== false) return false;
      if (rsvpFilterReserved === "yes" && !reservedByNames.has(r.name.toLowerCase())) return false;
      if (rsvpFilterReserved === "no" && reservedByNames.has(r.name.toLowerCase())) return false;
      if (rsvpFilterType !== "all" && r.type !== rsvpFilterType) return false;
      return true;
    });
  }, [rsvps, rsvpFilterStatus, rsvpFilterReserved, rsvpFilterType, reservedByNames]);

  const rsvpTypeLabel = (type?: RSVPType) => {
    if (type === "familia_matheus") return "Família Matheus";
    if (type === "familia_nayana") return "Família Nayana";
    if (type === "amigos") return "Amigos";
    return "—";
  };

  const rsvpTypeBadgeColor = (type?: RSVPType) => {
    if (type === "familia_matheus") return "bg-blue-50 text-blue-700";
    if (type === "familia_nayana") return "bg-pink-50 text-pink-700";
    if (type === "amigos") return "bg-amber-50 text-amber-700";
    return "bg-muted text-muted-foreground";
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

  // Cálculos de Presentes (bruto)
  const totalRaised = gifts.reduce((s, g) => s + g.raised, 0);
  const totalGoal = gifts.filter((g) => !g.noValue).reduce((s, g) => s + g.total, 0);
  const remainingValue = Math.max(0, totalGoal - totalRaised);
  const overallPct =
    totalGoal > 0
      ? Math.min(100, Math.round((totalRaised / totalGoal) * 100))
      : 0;

  // Valor líquido (desconta 1% de taxa do PIX)
  const totalNet = contributions.reduce((s, c) => {
    const fee = c.paymentMethod === "pix" ? 0.01 : 0;
    return s + c.value * (1 - fee);
  }, 0);

  const guaranteedGifts = gifts.filter((g) => !g.noValue && g.raised >= g.total).length;
  const giftsInProgress = gifts.filter(
    (g) => !g.noValue && g.raised > 0 && g.raised < g.total,
  ).length;

  const stats = [
    { label: "Meta da Lista", value: brl(totalGoal), icon: GiftIcon },
    {
      label: "Total Arrecadado",
      value: brl(totalRaised),
      icon: TrendingUp,
      showPct: true,
      subtext: `Líquido: ${brl(Math.round(totalNet))}`,
    },
    {
      label: "Valor Restante",
      value: brl(remainingValue),
      icon: Wallet,
    },
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
      subtext: settings.chaDePanelaEnabled ? `Chá de Panela: ${daysUntilCha} dias` : undefined,
    },
    {
      label: "Total de Pessoas",
      value: totalPeopleConfirmed.toString(),
      icon: Users,
    },
    {
      label: "Famílias/Grupos",
      value: `${attendingRsvps.length}/${rsvps.length}`,
      icon: CheckCircle,
      subtext: `${declinedRsvps.length} recusaram`,
    },
    {
      label: "Total de Acessos",
      value: analytics.totalViews.toString(),
      icon: Eye,
    },
    ...(settings.chaDePanelaEnabled
      ? [
          {
            label: "Presentes Reservados",
            value: `${reservedCount}/${gifts.length}`,
            icon: PackageCheck,
            subtext: `${Math.round((reservedCount / Math.max(gifts.length, 1)) * 100)}% dos presentes`,
          },
        ]
      : []),
  ];

  return (
    <section className="px-4 pt-10 pb-20 max-w-6xl mx-auto space-y-10">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
        <div>
          <p className="font-script text-3xl text-primary">olá, noivos</p>
          <h1 className="text-3xl font-semibold mt-1">Painel Administrativo</h1>
        </div>
        <div className="flex gap-2 flex-wrap">
          <GeneralSettingsDialog />
          <PaletteDialog />
          <CategoryDialog />
          <SiteImagesDialog />
          <Button variant="outline" asChild className="rounded-full gap-2">
            <Link to="/">
              <ArrowLeft className="w-4 h-4" /> Voltar ao Site
            </Link>
          </Button>
          <Button
            variant="outline"
            className="rounded-full gap-2 text-destructive hover:text-destructive"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4" /> Sair
          </Button>
        </div>
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

      {/* Dashboard de Contribuições e Indicadores */}
      <div className="space-y-6">
        <ContributionChart contributions={contributions} />
        <VisitsChart daily={analytics.daily} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CategoryStats gifts={gifts} />
          <PriorityStats gifts={gifts} />
        </div>
        {settings.chaDePanelaEnabled && (
          <ReservedGiftsSection gifts={gifts} onUpdate={loadData} />
        )}
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
            <table className="w-full text-center border-collapse text-sm">
              <thead className="sticky top-0 bg-card z-10 shadow-sm">
                <tr className="bg-muted/50 text-muted-foreground text-[10px] uppercase">
                  <th className="px-6 py-3 font-bold border-b border-border">
                    Presente / Marca
                  </th>
                  <th className="px-6 py-3 font-bold border-b border-border">
                    Categoria
                  </th>
                  <th className="px-6 py-3 font-bold border-b border-border">
                    Prioridade
                  </th>
                  <th className="px-6 py-3 font-bold border-b border-border">
                    Progresso
                  </th>
                  <th className="px-6 py-3 font-bold border-b border-border">
                    Arrecadado
                  </th>
                  <th className="px-6 py-3 font-bold border-b border-border">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {gifts.map((g) => {
                  const pct = g.noValue ? 0 : calculatePercentage(g.raised, g.total);
                  const cat = allCategories.find(
                    (c) => c.value === (g.category ?? "outros"),
                  );
                  const pri = GIFT_PRIORITIES.find(
                    (p) => p.value === (g.priority ?? "media"),
                  );
                  const priColor =
                    (g.priority ?? "media") === "alta"
                      ? "text-red-600 bg-red-50 border-red-200"
                      : (g.priority ?? "media") === "baixa"
                        ? "text-green-600 bg-green-50 border-green-200"
                        : "text-yellow-600 bg-yellow-200 border-yellow-200";
                  return (
                    <tr
                      key={g.id}
                      className="hover:bg-muted/20 transition-colors"
                    >
                      <td className="px-6 py-4 text-center">
                        <p className="font-medium line-clamp-1">{g.title}</p>
                        {g.marca && (
                          <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mt-0.5">
                            <Tag className="w-3 h-3" /> {g.marca}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-sm">
                          {cat?.icon} {cat?.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold border ${priColor}`}
                        >
                          {pri?.icon} {pri?.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 min-w-[150px]">
                        {g.noValue ? (
                          <span className="text-xs text-muted-foreground">—</span>
                        ) : (
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
                        )}
                      </td>
                      <td className="px-6 py-4 text-center font-medium tabular-nums">
                        {brl(g.raised)}
                      </td>
                      <td className="px-6 py-4 text-center tabular-nums text-muted-foreground">
                        {g.noValue ? "—" : brl(g.total)}
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
              const pct = g.noValue ? 0 : calculatePercentage(g.raised, g.total);
              const cat = allCategories.find(
                (c) => c.value === (g.category ?? "outros"),
              );
              const pri = GIFT_PRIORITIES.find(
                (p) => p.value === (g.priority ?? "media"),
              );
              const priColor =
                (g.priority ?? "media") === "alta"
                  ? "text-red-600 bg-red-50 border-red-200"
                  : (g.priority ?? "media") === "baixa"
                    ? "text-green-600 bg-green-50 border-green-200"
                    : "text-yellow-600 bg-yellow-200 border-yellow-200";
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
                  <div className="flex items-center gap-2 text-xs">
                    <span>
                      {cat?.icon} {cat?.label}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-bold border ${priColor}`}
                    >
                      {pri?.icon} {pri?.label}
                    </span>
                  </div>
                  {!g.noValue && (
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
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Arrecadado:</span>
                    <span className="font-medium">{brl(g.raised)}</span>
                  </div>
                  {!g.noValue && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Total:</span>
                      <span className="text-muted-foreground">
                        {brl(g.total)}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Tabela de RSVP */}
        <div className="bg-card rounded-2xl border border-border/60 shadow-sm overflow-hidden">
          <div className="px-4 sm:px-6 py-4 border-b bg-secondary/10 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-lg text-primary flex items-center gap-2">
                <Users className="w-5 h-5" /> Confirmações
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                {filteredRsvps.length} {filteredRsvps.length === 1 ? "convidado" : "convidados"}
                {filteredRsvps.length !== rsvps.length && ` de ${rsvps.length}`}
              </p>
            </div>
            <Button
              size="sm"
              onClick={() => setAddRsvpOpen(true)}
              className="rounded-full gap-1"
            >
              <Plus className="w-4 h-4" /> Adicionar
            </Button>
          </div>

          {/* Filtros */}
          <div className="px-4 sm:px-6 py-3 border-b bg-muted/20 flex flex-wrap gap-2">
            <Select value={rsvpFilterStatus} onValueChange={(v) => setRsvpFilterStatus(v as typeof rsvpFilterStatus)}>
              <SelectTrigger className="w-[130px] h-8 text-xs rounded-full">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="confirmed">Confirmados</SelectItem>
                <SelectItem value="declined">Recusaram</SelectItem>
              </SelectContent>
            </Select>
            <Select value={rsvpFilterReserved} onValueChange={(v) => setRsvpFilterReserved(v as typeof rsvpFilterReserved)}>
              <SelectTrigger className="w-[150px] h-8 text-xs rounded-full">
                <SelectValue placeholder="Reservou presente" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="yes">Reservou</SelectItem>
                <SelectItem value="no">Não reservou</SelectItem>
              </SelectContent>
            </Select>
            <Select value={rsvpFilterType} onValueChange={(v) => setRsvpFilterType(v as typeof rsvpFilterType)}>
              <SelectTrigger className="w-[160px] h-8 text-xs rounded-full">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                <SelectItem value="familia_matheus">Família Matheus</SelectItem>
                <SelectItem value="familia_nayana">Família Nayana</SelectItem>
                <SelectItem value="amigos">Amigos</SelectItem>
              </SelectContent>
            </Select>
            {(rsvpFilterStatus !== "all" || rsvpFilterReserved !== "all" || rsvpFilterType !== "all") && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 rounded-full text-xs gap-1 text-muted-foreground"
                onClick={() => { setRsvpFilterStatus("all"); setRsvpFilterReserved("all"); setRsvpFilterType("all"); }}
              >
                <X className="w-3 h-3" /> Limpar
              </Button>
            )}
          </div>

          {/* Desktop: tabela */}
          <div className="hidden md:block max-h-[400px] overflow-y-auto">
            <table className="w-full text-center border-collapse">
              <thead className="sticky top-0 bg-card z-10 shadow-sm">
                <tr className="bg-muted/50 text-muted-foreground text-[10px] uppercase">
                  <th className="px-4 py-3 font-bold text-center border-b border-border">Data</th>
                  <th className="px-4 py-3 font-bold text-center border-b border-border">Nome</th>
                  <th className="px-4 py-3 font-bold text-center border-b border-border">Status</th>
                  <th className="px-4 py-3 font-bold text-center border-b border-border">Dependentes</th>
                  <th className="px-4 py-3 font-bold text-center border-b border-border">Reservou Presente</th>
                  <th className="px-4 py-3 font-bold text-center border-b border-border">Tipo</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredRsvps.map((r) => {
                  const hasReserved = reservedByNames.has(r.name.toLowerCase());
                  return (
                    <tr
                      key={r.id}
                      className={`hover:bg-muted/20 transition-colors ${r.attending === false ? "opacity-60" : ""}`}
                    >
                      <td className="px-4 py-3 text-center text-xs text-muted-foreground whitespace-nowrap">
                        {formatDate(r.confirmedAt)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <p className="text-sm font-medium">{r.name}</p>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {r.attending === false ? (
                          <span className="text-xs font-medium text-red-500 bg-red-50 px-2 py-0.5 rounded-full">
                            Recusou
                          </span>
                        ) : (
                          <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                            Confirmado
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center text-sm text-muted-foreground">
                        {r.attending === false ? "-" : Math.max(0, r.guestsCount - 1)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {hasReserved ? (
                          <CheckCircle className="w-4 h-4 text-green-500 inline" />
                        ) : (
                          <span className="text-muted-foreground text-xs">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${rsvpTypeBadgeColor(r.type)}`}>
                          {rsvpTypeLabel(r.type)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {filteredRsvps.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground text-sm">
                      Nenhuma confirmação encontrada com os filtros selecionados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile: cards */}
          <div className="md:hidden divide-y max-h-[400px] overflow-y-auto">
            {filteredRsvps.map((r) => {
              const hasReserved = reservedByNames.has(r.name.toLowerCase());
              return (
                <div key={r.id} className={`p-4 space-y-2 ${r.attending === false ? "opacity-60" : ""}`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{r.name}</p>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(r.confirmedAt)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {r.attending === false ? (
                        <span className="text-[10px] font-medium text-red-500 bg-red-50 px-2 py-0.5 rounded-full">
                          Recusou
                        </span>
                      ) : (
                        <span className="text-[10px] font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                          Confirmado
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                    {r.attending !== false && (
                      <span>Grupo: <strong className="text-foreground">{r.guestsCount}</strong></span>
                    )}
                    {hasReserved && (
                      <Badge variant="secondary" className="text-[10px] gap-1">
                        <CheckCircle className="w-3 h-3 text-green-500" /> Reservou presente
                      </Badge>
                    )}
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${rsvpTypeBadgeColor(r.type)}`}>
                      {rsvpTypeLabel(r.type)}
                    </span>
                  </div>
                </div>
              );
            })}
            {filteredRsvps.length === 0 && (
              <div className="p-8 text-center text-muted-foreground text-sm">
                Nenhuma confirmação encontrada com os filtros selecionados.
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-3 bg-muted/30 flex justify-between text-xs font-medium text-muted-foreground">
            <span>
              Total Geral: <strong className="text-foreground">{totalPeopleConfirmed}</strong> pessoas
            </span>
            <span>
              Confirmados: <strong className="text-foreground">{attendingRsvps.length}</strong>
              {" · "}Recusaram: <strong className="text-foreground">{declinedRsvps.length}</strong>
            </span>
          </div>
        </div>

        <AddRSVPDialog
          open={addRsvpOpen}
          onOpenChange={setAddRsvpOpen}
          onAdded={loadData}
        />
      </div>
    </section>
  );
}

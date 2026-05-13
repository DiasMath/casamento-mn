import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { Gift, TrendingUp, Users, ArrowRight } from "lucide-react";
import { mockGifts } from "@/data/mockGifts";
import { brl } from "@/lib/format";

export const Route = createFileRoute("/admin/painel")({
  head: () => ({ meta: [{ title: "Painel — Helena & Mateus" }] }),
  component: AdminPainel,
});

function AdminPainel() {
  const totalRaised = mockGifts.reduce((s, g) => s + g.raised, 0);
  const totalValue = mockGifts.reduce((s, g) => s + g.total, 0);
  const completed = mockGifts.filter((g) => g.raised >= g.total).length;

  const stats = [
    { label: "Total arrecadado", value: brl(totalRaised), icon: TrendingUp },
    { label: "Meta da lista", value: brl(totalValue), icon: Gift },
    { label: "Presentes garantidos", value: `${completed} / ${mockGifts.length}`, icon: Users },
  ];

  return (
    <SiteLayout>
      <section className="px-4 pt-10 pb-20 max-w-5xl mx-auto">
        <div>
          <p className="font-script text-3xl text-primary">olá, noivos</p>
          <h1 className="text-3xl sm:text-4xl font-semibold mt-1">Painel Administrativo</h1>
          <p className="text-foreground/70 mt-2">Acompanhe os presentes e contribuições.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
          {stats.map((s) => (
            <div key={s.label} className="bg-card rounded-2xl p-5 border border-border/60 shadow-[var(--shadow-card)]">
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">{s.label}</p>
                <s.icon className="w-4 h-4 text-primary" />
              </div>
              <p className="text-2xl font-semibold mt-2">{s.value}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 bg-card rounded-2xl p-6 border border-border/60 shadow-[var(--shadow-card)] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="font-medium text-lg">Gerenciar presentes</h2>
            <p className="text-sm text-muted-foreground">Editar, excluir ou adicionar novos itens à lista.</p>
          </div>
          <Link
            to="/cha-de-panela"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground font-medium hover:opacity-90 transition"
          >
            Ir para a lista <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="mt-8 bg-card rounded-2xl border border-border/60 shadow-[var(--shadow-card)] overflow-hidden">
          <div className="px-5 py-4 border-b border-border bg-secondary/40">
            <h2 className="font-medium">Últimas contribuições (mock)</h2>
          </div>
          <ul className="divide-y divide-border">
            {mockGifts.slice(0, 5).map((g, i) => (
              <li key={g.id} className="px-5 py-4 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{g.title}</p>
                  <p className="text-xs text-muted-foreground">Convidado #{i + 1}</p>
                </div>
                <span className="text-sm font-medium tabular-nums">{brl(Math.round(g.raised / 2))}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </SiteLayout>
  );
}

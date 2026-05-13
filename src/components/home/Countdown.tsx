import { useEffect, useState } from "react";
import { WEDDING_DATE } from "@/lib/constants";

function diff() {
  const ms = Math.max(0, WEDDING_DATE.getTime() - Date.now());
  const d = Math.floor(ms / 86400000);
  const h = Math.floor((ms % 86400000) / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return { d, h, m, s };
}

export function Countdown() {
  const [t, setT] = useState(diff);
  useEffect(() => {
    const i = setInterval(() => setT(diff()), 1000);
    return () => clearInterval(i);
  }, []);

  const items = [
    { v: t.d, label: "Dias" },
    { v: t.h, label: "Horas" },
    { v: t.m, label: "Minutos" },
    { v: t.s, label: "Segundos" },
  ];

  return (
    <section className="px-4 py-16 sm:py-20">
      <div className="max-w-4xl mx-auto text-center">
        <p className="font-script text-3xl text-primary">contagem regressiva</p>
        <h2 className="text-2xl sm:text-3xl font-semibold mt-2 text-foreground">
          Faltam pouquinho para o nosso dia
        </h2>
        <div className="grid grid-cols-4 gap-2 sm:gap-4 mt-10">
          {items.map((i) => (
            <div
              key={i.label}
              className="bg-card rounded-2xl p-4 sm:p-6 shadow-[var(--shadow-card)] border border-border/60"
            >
              <div className="text-3xl sm:text-5xl font-semibold tabular-nums text-foreground">
                {i.v.toString().padStart(2, "0")}
              </div>
              <div className="text-[10px] sm:text-xs uppercase tracking-widest text-muted-foreground mt-2">
                {i.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

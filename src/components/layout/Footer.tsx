import { Heart } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useViewMode } from "@/contexts/ViewModeContext";
import { COUPLE } from "@/data/mockGifts";

export function Footer() {
  const { mode, toggle } = useViewMode();
  return (
    <footer className="mt-24 border-t border-border bg-secondary/40">
      <div className="max-w-6xl mx-auto px-4 py-10 flex flex-col items-center gap-5 text-center">
        <Heart className="w-6 h-6 text-primary fill-primary/40" />
        <p className="font-script text-2xl">
          {COUPLE.bride} & {COUPLE.groom}
        </p>
        <p className="text-sm text-muted-foreground max-w-md">
          Obrigado por fazer parte da nossa história. Mal podemos esperar para celebrar com você.
        </p>
        <div className="flex items-center gap-3 mt-2 px-4 py-2 rounded-full bg-background border border-border">
          <span className="text-xs text-muted-foreground">Convidado</span>
          <Switch checked={mode === "admin"} onCheckedChange={toggle} />
          <span className="text-xs text-muted-foreground">Admin</span>
        </div>
        <p className="text-xs text-muted-foreground mt-4">© {new Date().getFullYear()} — Feito com amor</p>
      </div>
    </footer>
  );
}

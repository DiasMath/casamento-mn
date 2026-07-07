import { Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { Flower } from "@/components/decor/Flower";

export function Footer() {
  const { settings } = useSiteSettings();

  return (
    <footer className="relative border-t border-border overflow-hidden">
      <Flower
        className="absolute -top-4 left-6"
        size={70}
        variant="yellow"
        rotate={20}
        opacity={0.45}
      />
      <Flower
        className="absolute -bottom-4 right-6"
        size={90}
        variant="blue"
        rotate={-15}
        opacity={0.45}
      />

      <div className="relative max-w-6xl mx-auto px-4 py-8 flex flex-col items-center gap-5 text-center">
        <Heart className="w-6 h-6 text-primary fill-primary/40" />
        <p className="font-script text-3xl">
          {settings.coupleGroom} & {settings.coupleBride}
        </p>
        <p className="text-sm text-muted-foreground max-w-md">
          Obrigado por fazer parte da nossa história. Mal podemos esperar para
          celebrar com você.
        </p>
        {/* "Feito com amor" — link secreto para o admin */}
        <Link
          to="/admin/login"
          aria-label="Acesso restrito"
          className="text-xs text-muted-foreground/60 mt-4 select-none"
        >
          © {new Date().getFullYear()} — Feito com{" "}
          <span className="inline-flex items-center">
            <Heart className="inline w-3 h-3 mx-0.5 text-muted-foreground/60" />
          </span>{" "}
          amor
        </Link>
      </div>
    </footer>
  );
}

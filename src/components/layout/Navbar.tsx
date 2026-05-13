import { Link } from "@tanstack/react-router";
import { Menu, Heart } from "lucide-react";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetHeader } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { COUPLE } from "@/data/mockGifts";

const links = [
  { label: "Nossa História", hash: "historia" },
  { label: "O Casamento", hash: "casamento" },
  { label: "Confirmar Presença", hash: "rsvp" },
  { label: "Recados", hash: "recados" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 inset-x-0 z-50 backdrop-blur-md bg-background/80 border-b border-border/60">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-3">
        <Link to="/" className="flex items-center gap-2 group">
          <Heart className="w-5 h-5 text-primary fill-primary/40 transition group-hover:scale-110" />
          <span className="font-script text-xl tracking-wide text-foreground">
            {COUPLE.bride} & {COUPLE.groom}
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <a
              key={l.label}
              href={`/#${l.hash}`}
              className="px-3 py-2 text-sm text-foreground/80 hover:text-foreground transition rounded-full hover:bg-secondary"
            >
              {l.label}
            </a>
          ))}
          <Link
            to="/cha-de-panela"
            className="ml-2 px-4 py-2 text-sm font-medium rounded-full bg-accent text-accent-foreground hover:opacity-90 transition shadow-[var(--shadow-soft)]"
          >
            Chá de Panela
          </Link>
        </nav>

        <div className="md:hidden flex items-center gap-2">
          <Link
            to="/cha-de-panela"
            className="px-3 py-1.5 text-xs font-medium rounded-full bg-accent text-accent-foreground"
          >
            Chá
          </Link>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Abrir menu">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[85%] sm:w-80">
              <SheetHeader>
                <SheetTitle className="font-script text-2xl text-left">
                  {COUPLE.bride} & {COUPLE.groom}
                </SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-1 mt-6 px-4">
                {links.map((l) => (
                  <a
                    key={l.label}
                    href={`/#${l.hash}`}
                    onClick={() => setOpen(false)}
                    className="px-4 py-3 rounded-xl hover:bg-secondary text-foreground"
                  >
                    {l.label}
                  </a>
                ))}
                <Link
                  to="/cha-de-panela"
                  onClick={() => setOpen(false)}
                  className="mt-2 px-4 py-3 text-center rounded-xl bg-accent text-accent-foreground font-medium"
                >
                  Chá de Panela
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

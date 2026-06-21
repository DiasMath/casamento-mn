import { Link } from "react-router-dom";
import { Menu, Heart } from "lucide-react";
import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetHeader,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { COUPLE } from "@/lib/constants";

const links = [
  { label: "Nossa História", hash: "historia" },
  { label: "O Casamento", hash: "casamento" },
  { label: "Confirmar Presença", hash: "rsvp" },
  { label: "Lista de Presentes", hash: "presentes" },
  { label: "Recados", hash: "recados" },
];

function scrollToSection(e: React.MouseEvent<HTMLAnchorElement>, hash: string) {
  e.preventDefault();
  const element = document.getElementById(hash);
  if (element) {
    element.scrollIntoView({ behavior: "smooth" });
  }
}

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 inset-x-0 z-50 backdrop-blur-md bg-background/80 border-b border-border/60">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-3">
        <Link to="/" className="flex items-center gap-2 group cursor-pointer">
          <Heart className="w-5 h-5 text-primary fill-primary/40 transition group-hover:scale-110" />
          <span className="font-script text-xl tracking-wide text-foreground whitespace-nowrap">
            {COUPLE.groom} & {COUPLE.bride}
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-5">
          {links.map((l) => (
            <a
              key={l.label}
              href={`/#${l.hash}`}
              onClick={(e) => scrollToSection(e, l.hash)}
              className="relative text-sm text-foreground/80 hover:text-foreground transition group"
            >
              {l.label}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent transition-all duration-300 group-hover:w-full" />
            </a>
          ))}
        </nav>

        <div className="md:hidden flex items-center gap-2">
          <Link
            to="/present-list"
            className="px-4 py-2 text-sm font-medium rounded-full bg-accent text-accent-foreground"
          >
            Presentes
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
                    onClick={(e) => {
                      setOpen(false);
                      scrollToSection(e, l.hash);
                    }}
                    className="px-4 py-3 rounded-xl hover:bg-secondary text-foreground text-left"
                  >
                    {l.label}
                  </a>
                ))}
                <Link
                  to="/present-list"
                  onClick={() => setOpen(false)}
                  className="mt-2 px-4 py-3 text-center rounded-xl text-foreground font-medium"
                >
                  Lista de Presentes
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

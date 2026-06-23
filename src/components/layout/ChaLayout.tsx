import { type ReactNode } from "react";
import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import { COUPLE } from "@/lib/constants";
import { Footer } from "./Footer";

export function ChaLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="fixed top-0 inset-x-0 z-50 backdrop-blur-md bg-background/80 border-b border-border/60">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-center">
          <Link
            to="/cha-de-panela"
            className="flex items-center gap-2 group cursor-pointer"
          >
            <Heart className="w-5 h-5 text-primary fill-primary/40 transition group-hover:scale-110" />
            <span className="font-script text-xl tracking-wide text-foreground whitespace-nowrap">
              {COUPLE.groom} & {COUPLE.bride}
            </span>
          </Link>
        </div>
      </header>
      <main className="flex-1 pt-16 overflow-x-hidden">{children}</main>
      <Footer />
    </div>
  );
}

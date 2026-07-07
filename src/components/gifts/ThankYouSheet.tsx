import { useEffect, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { brl } from "@/lib/format";

interface ThankYouSheetProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  value: number;
  giftName: string;
}

const DURATION = 10;

export function ThankYouSheet({
  open,
  onOpenChange,
  value,
  giftName,
}: ThankYouSheetProps) {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (!open) {
      setProgress(100);
      return;
    }

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev <= 0) {
          clearInterval(interval);
          return 0;
        }
        return prev - 100 / (DURATION * 10);
      });
    }, 100);

    const timer = setTimeout(() => {
      onOpenChange(false);
    }, DURATION * 1000);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [open, onOpenChange]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="rounded-t-3xl max-h-[70vh] sm:max-w-lg sm:mx-auto p-0 overflow-hidden"
      >
        {/* Barra regressiva */}
        <div className="h-1.5 w-full bg-primary/20">
          <div
            className="h-full bg-primary transition-[width] duration-100 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="px-4 pb-8 pt-6 flex flex-col items-center text-center space-y-6">
          <SheetHeader className="text-center">
            <SheetTitle className="font-script text-3xl">Obrigado!</SheetTitle>
            <SheetDescription className="sr-only">
              Pagamento confirmado com sucesso
            </SheetDescription>
          </SheetHeader>

          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Heart className="w-8 h-8 text-primary fill-primary" />
          </div>

          <div className="space-y-2">
            <p className="text-lg font-medium text-foreground">
              Agradecemos pelo presente!
            </p>
            <p className="text-foreground/70">
              Você contribuiu com <strong>{brl(value)}</strong> para{" "}
              <strong>{giftName}</strong>.
            </p>
            <p className="text-sm text-muted-foreground">
              Obrigado pelo carinho! ♥
            </p>
          </div>

          <Button
            onClick={() => onOpenChange(false)}
            className="w-full h-12 rounded-full"
          >
            Fechar
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

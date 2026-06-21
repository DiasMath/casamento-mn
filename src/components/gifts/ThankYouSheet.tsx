import { useEffect, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
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
        {/* Barra verde regressiva */}
        <div className="h-1.5 w-full bg-green-100">
          <div
            className="h-full bg-green-500 transition-[width] duration-100 ease-linear"
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

          <div className="text-6xl">🎉</div>

          <div className="space-y-2">
            <h3 className="text-xl font-bold text-green-600">
              Pagamento Confirmado!
            </h3>
            <p className="text-foreground/70">
              Você contribuiu com <strong>{brl(value)}</strong> para{" "}
              <strong>{giftName}</strong>.
            </p>
            <p className="text-sm text-muted-foreground">
              Obrigado pelo carinho! ❤️
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

import { useEffect, useState } from "react";
import confetti from "canvas-confetti";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { brl } from "@/lib/format";

interface ThankYouSheetProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onClose?: () => void;
  value: number;
  giftName: string;
}

const DURATION = 30;

export function ThankYouSheet({
  open,
  onOpenChange,
  onClose,
  value,
  giftName,
}: ThankYouSheetProps) {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (!open) {
      setProgress(100);
      return;
    }

    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 },
      colors: ["#f59e0b", "#ec4899", "#8b5cf6", "#10b981", "#3b82f6"],
    });

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
      onClose?.();
      onOpenChange(false);
    }, DURATION * 1000);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [open, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-3xl max-w-sm p-0 overflow-hidden">
        {/* Barra regressiva */}
        <div className="h-1.5 w-full bg-primary/20">
          <div
            className="h-full bg-primary transition-[width] duration-100 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="px-4 pb-8 pt-6 flex flex-col items-center text-center space-y-6">
          <DialogHeader className="text-center">
            <DialogTitle className="font-script text-3xl">Obrigado!</DialogTitle>
            <DialogDescription className="sr-only">
              Pagamento confirmado com sucesso
            </DialogDescription>
          </DialogHeader>

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
            onClick={() => { onClose?.(); onOpenChange(false); }}
            className="w-full h-12 rounded-full"
          >
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

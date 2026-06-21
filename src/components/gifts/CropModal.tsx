import { useCallback, useState } from "react";
import Cropper from "react-easy-crop";
import type { Area, Point } from "react-easy-crop";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Loader2, Check } from "lucide-react";
import { getCroppedImg } from "@/lib/cropImage";

interface CropModalProps {
  imageSrc: string;
  open: boolean;
  onClose: () => void;
  onCropComplete: (blob: Blob) => void;
}

export function CropModal({
  imageSrc,
  open,
  onClose,
  onCropComplete,
}: CropModalProps) {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [processing, setProcessing] = useState(false);

  const handleCropAreaChange = useCallback((_: Area, croppedPixels: Area) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const handleConfirm = useCallback(async () => {
    if (!croppedAreaPixels) return;

    setProcessing(true);
    try {
      const blob = await getCroppedImg(imageSrc, croppedAreaPixels);
      if (blob) {
        onCropComplete(blob);
        onClose();
      }
    } catch (error) {
      console.error("Erro ao processar imagem:", error);
    } finally {
      setProcessing(false);
    }
  }, [imageSrc, croppedAreaPixels, onCropComplete, onClose]);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md rounded-3xl p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle className="font-script text-3xl">
            Recortar Imagem
          </DialogTitle>
        </DialogHeader>

        <div className="relative w-full aspect-square bg-black">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1}
            onCropChange={setCrop}
            onCropComplete={handleCropAreaChange}
            onZoomChange={setZoom}
          />
        </div>

        <div className="px-6 pb-2">
          <label className="text-sm text-muted-foreground mb-2 block">
            Zoom
          </label>
          <Slider
            value={[zoom]}
            onValueChange={(v) => setZoom(v[0])}
            min={1}
            max={3}
            step={0.1}
          />
        </div>

        <DialogFooter className="px-6 pb-6 gap-2">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            className="rounded-full"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={processing || !croppedAreaPixels}
            className="rounded-full bg-primary text-primary-foreground hover:opacity-90"
          >
            {processing ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Check className="w-4 h-4 mr-2" />
            )}
            Confirmar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

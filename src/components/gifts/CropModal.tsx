import { useCallback, useState, useMemo } from "react";
import Cropper from "react-easy-crop";
import type { Area, Point } from "react-easy-crop";
import { devLog } from "@/lib/devLog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Loader2, Check, Info, ImageOff } from "lucide-react";
import { getCroppedImg } from "@/lib/cropImage";

function fileToBlob(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const buf = reader.result as ArrayBuffer;
      resolve(new Blob([buf], { type: file.type }));
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

function srcToFile(src: string): Promise<File> {
  return new Promise((resolve, reject) => {
    fetch(src)
      .then((r) => r.blob())
      .then((b) => resolve(new File([b], "image.jpg", { type: b.type })))
      .catch(reject);
  });
}

const ASPECT_OPTIONS = [
  { label: "16:9", value: 16 / 9 },
  { label: "4:3", value: 4 / 3 },
  { label: "1:1", value: 1 },
  { label: "Livre", value: null },
] as const;

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
  const [aspectRatio, setAspectRatio] = useState<number | null>(16 / 9);

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
      devLog.error("Erro ao processar imagem:", error);
    } finally {
      setProcessing(false);
    }
  }, [imageSrc, croppedAreaPixels, onCropComplete, onClose]);

  const handleSkipCrop = useCallback(async () => {
    setProcessing(true);
    try {
      const file = await srcToFile(imageSrc);
      const blob = await fileToBlob(file);
      onCropComplete(blob);
      onClose();
    } catch (error) {
      devLog.error("Erro ao processar imagem original:", error);
    } finally {
      setProcessing(false);
    }
  }, [imageSrc, onCropComplete, onClose]);

  const previewDimensions = useMemo(() => {
    if (!croppedAreaPixels) return null;
    const maxW = 140;
    const scale = maxW / croppedAreaPixels.width;
    const w = Math.min(maxW, croppedAreaPixels.width);
    const h = Math.round(croppedAreaPixels.height * scale);
    return { width: Math.round(w), height: Math.min(h, 80) };
  }, [croppedAreaPixels]);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-lg rounded-3xl p-0 overflow-hidden max-h-[95vh] overflow-y-auto">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle className="font-script text-3xl">
            Recortar Imagem
          </DialogTitle>
          <DialogDescription className="text-left">
            Escolha o formato e arraste para posicionar.
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 space-y-4">
          <div className="flex gap-2">
            {ASPECT_OPTIONS.map((opt) => (
              <button
                key={opt.label}
                type="button"
                onClick={() => {
                  setAspectRatio(opt.value);
                  setCrop({ x: 0, y: 0 });
                  setZoom(1);
                }}
                className={`flex-1 h-9 rounded-full text-sm font-medium transition-all ${
                  aspectRatio === opt.value
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="relative w-full aspect-video bg-black">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={aspectRatio ?? 16 / 9}
            onCropChange={setCrop}
            onCropComplete={handleCropAreaChange}
            onZoomChange={setZoom}
            showGrid={aspectRatio !== null}
            cropShape="rect"
          />
        </div>

        <div className="px-6 space-y-4 pb-2">
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground shrink-0">Zoom</span>
            <Slider
              value={[zoom]}
              onValueChange={(v) => setZoom(v[0])}
              min={1}
              max={3}
              step={0.1}
              className="flex-1"
            />
            <span className="text-xs text-muted-foreground w-10 text-right tabular-nums">
              {zoom.toFixed(1)}x
            </span>
          </div>

          {previewDimensions && (
            <div className="flex items-center gap-3 p-3 bg-card rounded-xl border border-border/60">
              <div className="shrink-0">
                <div
                  className="rounded-lg overflow-hidden bg-secondary border border-border/40"
                  style={{
                    width: previewDimensions.width,
                    height: previewDimensions.height,
                  }}
                >
                  <img
                    src={imageSrc}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    style={{
                      transform: `scale(${zoom}) translate(${-crop.x / zoom}px, ${-crop.y / zoom}px)`,
                      transformOrigin: "top left",
                    }}
                  />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-foreground">
                  {aspectRatio === null
                    ? "Formato livre"
                    : aspectRatio === 16 / 9
                      ? "16:9 paisagem"
                      : aspectRatio === 4 / 3
                        ? "4:3 padrão"
                        : "1:1 quadrado"}
                </p>
                {croppedAreaPixels && (
                  <p className="text-xs text-muted-foreground tabular-nums">
                    {croppedAreaPixels.width} x {croppedAreaPixels.height}px
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="flex items-start gap-2 p-3 bg-primary/5 rounded-xl text-xs text-muted-foreground">
            <Info className="w-4 h-4 shrink-0 mt-0.5 text-primary" />
            <div className="space-y-0.5">
              <p className="font-medium text-foreground">Dicas</p>
              <p>
                Resolução mínima: <strong>800x450px</strong> para melhor
                qualidade no card.
              </p>
            </div>
          </div>
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
            variant="outline"
            onClick={handleSkipCrop}
            disabled={processing}
            className="rounded-full"
          >
            {processing ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <ImageOff className="w-4 h-4 mr-2" />
            )}
            Sem recorte
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

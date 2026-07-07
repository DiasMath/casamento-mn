import { useState, useEffect, useCallback } from "react";
import { ImagePlus, Check, Loader2, Images, BookOpen, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { devLog } from "@/lib/devLog";
import {
  getSiteImages,
  updateSiteImage,
  type SiteImages,
  type SiteImageKey,
} from "@/lib/firestoreService";
import { uploadToCloudinary, isCloudinaryUrl } from "@/lib/cloudinary";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CropModal } from "@/components/gifts/CropModal";

const CAROUSEL_KEYS: SiteImageKey[] = [
  "carousel1",
  "carousel2",
  "carousel3",
  "carousel4",
  "carousel5",
  "carousel6",
];

const STORY_KEYS: SiteImageKey[] = ["story1", "story2", "story3", "story4"];

const IMAGE_LABELS: Record<SiteImageKey, string> = {
  carousel1: "Imagem 1",
  carousel2: "Imagem 2",
  carousel3: "Imagem 3",
  carousel4: "Imagem 4",
  carousel5: "Imagem 5",
  carousel6: "Imagem 6",
  story1: "Capítulo 1 — O primeiro olhar",
  story2: "Capítulo 2 — Cartas e ligações",
  story3: "Capítulo 3 — Nossa primeira viagem",
  story4: "Capítulo 4 — O pedido",
};

function ImageRow({
  imageKey,
  label,
  url,
  isUploading,
  onSelect,
  onDelete,
}: {
  imageKey: SiteImageKey;
  label: string;
  url: string;
  isUploading: boolean;
  onSelect: (key: SiteImageKey, file: File) => void;
  onDelete: (key: SiteImageKey) => void;
}) {
  const hasImage = !!url && isCloudinaryUrl(url);

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 rounded-xl border bg-secondary/20">
      <div className="w-20 h-14 rounded-lg overflow-hidden bg-muted flex items-center justify-center shrink-0">
        {hasImage ? (
          <img src={url} alt={label} className="w-full h-full object-cover" />
        ) : (
          <ImagePlus className="w-5 h-5 text-muted-foreground/50" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground truncate">
          {hasImage ? "Imagem personalizada" : "Usando imagem padrão"}
        </p>
      </div>
      <div className="flex gap-1.5">
        <label>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            disabled={isUploading}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onSelect(imageKey, file);
              e.target.value = "";
            }}
          />
          <Button
            variant={hasImage ? "outline" : "default"}
            size="sm"
            className="rounded-full gap-1"
            disabled={isUploading}
            asChild
          >
            <span>
              {isUploading ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : hasImage ? (
                <Check className="w-3 h-3" />
              ) : (
                <ImagePlus className="w-3 h-3" />
              )}
              {isUploading ? "Enviando..." : hasImage ? "Trocar" : "Enviar"}
            </span>
          </Button>
        </label>
        {hasImage && (
          <>
            <label>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                disabled={isUploading}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) onSelect(imageKey, file);
                  e.target.value = "";
                }}
              />
              <Button
                variant="outline"
                size="sm"
                className="rounded-full gap-1"
                disabled={isUploading}
                asChild
              >
                <span>
                  <Pencil className="w-3 h-3" />
                  Editar
                </span>
              </Button>
            </label>
            <Button
              variant="outline"
              size="sm"
              className="rounded-full gap-1 text-destructive hover:text-destructive"
              disabled={isUploading}
              onClick={() => onDelete(imageKey)}
            >
              <Trash2 className="w-3 h-3" />
              Excluir
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

export function SiteImagesDialog() {
  const [open, setOpen] = useState(false);
  const [images, setImages] = useState<SiteImages>({
    carousel1: "",
    carousel2: "",
    carousel3: "",
    carousel4: "",
    carousel5: "",
    carousel6: "",
    story1: "",
    story2: "",
    story3: "",
    story4: "",
  });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState<SiteImageKey | null>(null);

  const [cropOpen, setCropOpen] = useState(false);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [cropKey, setCropKey] = useState<SiteImageKey | null>(null);

  useEffect(() => {
    if (open) {
      setLoading(true);
      getSiteImages().then((imgs) => {
        setImages(imgs);
        setLoading(false);
      });
    }
  }, [open]);

  const handleFileSelect = useCallback((key: SiteImageKey, file: File) => {
    const url = URL.createObjectURL(file);
    setCropSrc(url);
    setCropKey(key);
    setCropOpen(true);
  }, []);

  const handleCropComplete = useCallback(
    async (blob: Blob) => {
      if (!cropKey) return;
      setUploading(cropKey);
      setCropOpen(false);
      try {
        const url = await uploadToCloudinary(blob);
        await updateSiteImage(cropKey, url);
        setImages((prev) => ({ ...prev, [cropKey]: url }));
        toast.success(`${IMAGE_LABELS[cropKey]} atualizada!`);
      } catch (err) {
        devLog.error(err);
        toast.error("Erro ao enviar imagem.");
      } finally {
        setUploading(null);
        if (cropSrc) URL.revokeObjectURL(cropSrc);
        setCropSrc(null);
        setCropKey(null);
      }
    },
    [cropKey, cropSrc],
  );

  const handleDelete = useCallback(async (key: SiteImageKey) => {
    try {
      await updateSiteImage(key, "");
      setImages((prev) => ({ ...prev, [key]: "" }));
      toast.success(`${IMAGE_LABELS[key]} removida!`);
    } catch (err) {
      devLog.error(err);
      toast.error("Erro ao remover imagem.");
    }
  }, []);

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="rounded-full gap-2">
            <Images className="w-4 h-4" /> Imagens
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader className="sm:pr-12 pt-1">
            <DialogTitle className="flex items-center gap-2">
              <Images className="w-5 h-5" /> Imagens do Site
            </DialogTitle>
            <DialogDescription className="sr-only">
              Gerencie as imagens do carrossel e da história do site
            </DialogDescription>
          </DialogHeader>
          {loading ? (
            <div className="py-8 text-center text-muted-foreground">
              Carregando...
            </div>
          ) : (
            <div className="space-y-6">
              {/* Carrossel */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Images className="w-4 h-4 text-primary" />
                  <h3 className="text-sm font-semibold uppercase tracking-wide">
                    Carrossel Hero
                  </h3>
                </div>
                <div className="space-y-2">
                  {CAROUSEL_KEYS.map((key) => (
                    <ImageRow
                      key={key}
                      imageKey={key}
                      label={IMAGE_LABELS[key]}
                      url={images[key]}
                      isUploading={uploading === key}
                      onSelect={handleFileSelect}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              </div>

              {/* Capítulos */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <BookOpen className="w-4 h-4 text-primary" />
                  <h3 className="text-sm font-semibold uppercase tracking-wide">
                    Nossa História
                  </h3>
                </div>
                <div className="space-y-2">
                  {STORY_KEYS.map((key) => (
                    <ImageRow
                      key={key}
                      imageKey={key}
                      label={IMAGE_LABELS[key]}
                      url={images[key]}
                      isUploading={uploading === key}
                      onSelect={handleFileSelect}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {cropSrc && (
        <CropModal
          imageSrc={cropSrc}
          open={cropOpen}
          onClose={() => {
            setCropOpen(false);
            URL.revokeObjectURL(cropSrc);
            setCropSrc(null);
            setCropKey(null);
          }}
          onCropComplete={handleCropComplete}
        />
      )}
    </>
  );
}

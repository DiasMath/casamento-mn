import { useState, useEffect } from "react";
import { ImagePlus, Check, Loader2, Images, BookOpen } from "lucide-react";
import { toast } from "sonner";
import {
  getSiteImages,
  updateSiteImage,
  type SiteImages,
  type SiteImageKey,
} from "@/lib/firestoreService";
import { isCloudinaryUrl } from "@/lib/cloudinary";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

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
  key,
  label,
  url,
  isUploading,
  onUpload,
}: {
  key: SiteImageKey;
  label: string;
  url: string;
  isUploading: boolean;
  onUpload: (key: SiteImageKey, file: File) => void;
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
      <label>
        <input
          type="file"
          accept="image/*"
          className="hidden"
          disabled={isUploading}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onUpload(key, file);
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

  useEffect(() => {
    if (open) {
      setLoading(true);
      getSiteImages().then((imgs) => {
        setImages(imgs);
        setLoading(false);
      });
    }
  }, [open]);

  const handleUpload = async (key: SiteImageKey, file: File) => {
    setUploading(key);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append(
        "upload_preset",
        import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET as string,
      );
      formData.append("folder", "casamento/site");

      const res = await fetch(
        `https://api.cloudinary.com/v1_5/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: "POST", body: formData },
      );

      if (!res.ok) throw new Error("Falha no upload");

      const data = await res.json();
      const url = data.secure_url as string;

      await updateSiteImage(key, url);
      setImages((prev) => ({ ...prev, [key]: url }));
      toast.success(`${IMAGE_LABELS[key]} atualizada!`);
    } catch (err) {
      console.error(err);
      toast.error("Erro ao enviar imagem.");
    } finally {
      setUploading(null);
    }
  };

  return (
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
                    key_={key}
                    label={IMAGE_LABELS[key]}
                    url={images[key]}
                    isUploading={uploading === key}
                    onUpload={handleUpload}
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
                    key_={key}
                    label={IMAGE_LABELS[key]}
                    url={images[key]}
                    isUploading={uploading === key}
                    onUpload={handleUpload}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

import { useState, useEffect } from "react";
import { ImagePlus, Check, Loader2, Images } from "lucide-react";
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

const IMAGE_LABELS: Record<SiteImageKey, string> = {
  hero: "Foto do Casal (Hero)",
  story1: "Capítulo 1 — O primeiro olhar",
  story2: "Capítulo 2 — Cartas e ligações",
  story3: "Capítulo 3 — Nossa primeira viagem",
  story4: "Capítulo 4 — O pedido",
};

export function SiteImagesDialog() {
  const [open, setOpen] = useState(false);
  const [images, setImages] = useState<SiteImages>({
    hero: "",
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

  const keys = Object.keys(IMAGE_LABELS) as SiteImageKey[];

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
          <div className="space-y-3">
            {keys.map((key) => {
              const url = images[key];
              const hasImage = !!url && isCloudinaryUrl(url);
              const isUploading = uploading === key;

              return (
                <div
                  key={key}
                  className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 rounded-xl border bg-secondary/20"
                >
                  <div className="w-20 h-14 rounded-lg overflow-hidden bg-muted flex items-center justify-center shrink-0">
                    {hasImage ? (
                      <img
                        src={url}
                        alt={IMAGE_LABELS[key]}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ImagePlus className="w-5 h-5 text-muted-foreground/50" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{IMAGE_LABELS[key]}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {hasImage
                        ? "Imagem personalizada"
                        : "Usando imagem padrão"}
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
                        if (file) handleUpload(key, file);
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
                        {isUploading
                          ? "Enviando..."
                          : hasImage
                            ? "Trocar"
                            : "Enviar"}
                      </span>
                    </Button>
                  </label>
                </div>
              );
            })}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

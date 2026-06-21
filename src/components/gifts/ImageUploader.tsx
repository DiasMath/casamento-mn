import { useRef, useState, useCallback } from "react";
import { CropModal } from "./CropModal";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { Button } from "@/components/ui/button";
import { Upload, Loader2, ImageIcon, X } from "lucide-react";
import { toast } from "sonner";

interface ImageUploaderProps {
  value?: string;
  onUpload: (url: string) => void;
  disabled?: boolean;
}

export function ImageUploader({
  value,
  onUpload,
  disabled,
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [cropOpen, setCropOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  const displayUrl = value || previewUrl;

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (!file.type.startsWith("image/")) {
        toast.error("Selecione um arquivo de imagem válido.");
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        toast.error("A imagem deve ter no máximo 10MB.");
        return;
      }

      const url = URL.createObjectURL(file);
      setSelectedFile(url);
      setCropOpen(true);

      if (inputRef.current) {
        inputRef.current.value = "";
      }
    },
    [],
  );

  const handleCropComplete = useCallback(
    async (blob: Blob) => {
      setUploading(true);
      try {
        const cloudinaryUrl = await uploadToCloudinary(blob);
        setPreviewUrl(cloudinaryUrl);
        onUpload(cloudinaryUrl);
        toast.success("Imagem enviada com sucesso!");
      } catch (error) {
        console.error("Erro no upload:", error);
        toast.error("Erro ao enviar imagem. Tente novamente.");
      } finally {
        setUploading(false);
      }
    },
    [onUpload],
  );

  const handleRemove = useCallback(() => {
    setPreviewUrl(null);
    onUpload("");
  }, [onUpload]);

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        className="hidden"
      />

      {displayUrl ? (
        <div className="relative group">
          <div className="aspect-video rounded-2xl overflow-hidden bg-secondary">
            <img
              src={displayUrl}
              alt="Preview do presente"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute inset-0 rounded-2xl bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => inputRef.current?.click()}
              disabled={disabled || uploading}
              className="rounded-full"
            >
              {uploading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-1" />
              ) : (
                <Upload className="w-4 h-4 mr-1" />
              )}
              Trocar
            </Button>
            {!value && (
              <Button
                type="button"
                size="sm"
                variant="destructive"
                onClick={handleRemove}
                disabled={disabled || uploading}
                className="rounded-full"
              >
                <X className="w-4 h-4 mr-1" />
                Remover
              </Button>
            )}
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={disabled || uploading}
          className="w-full aspect-video rounded-2xl border-2 border-dashed border-primary/30 bg-primary/5 hover:bg-primary/10 hover:border-primary/50 transition-colors flex flex-col items-center justify-center gap-3 text-primary/60 hover:text-primary/80"
        >
          {uploading ? (
            <Loader2 className="w-10 h-10 animate-spin" />
          ) : (
            <ImageIcon className="w-10 h-10" />
          )}
          <div className="text-center">
            <p className="text-sm font-medium">
              {uploading ? "Enviando..." : "Clique para selecionar"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              JPG, PNG ou WebP (máx. 10MB)
            </p>
          </div>
        </button>
      )}

      {selectedFile && (
        <CropModal
          imageSrc={selectedFile}
          open={cropOpen}
          onClose={() => {
            setCropOpen(false);
            if (previewUrl === null) {
              URL.revokeObjectURL(selectedFile);
            }
          }}
          onCropComplete={handleCropComplete}
        />
      )}
    </div>
  );
}

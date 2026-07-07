import { useRef, useState, useCallback } from "react";
import { devLog } from "@/lib/devLog";
import { CropModal } from "./CropModal";
import { Button } from "@/components/ui/button";
import { Upload, Loader2, ImageIcon, X, Pencil } from "lucide-react";

interface ImageUploaderProps {
  value?: string;
  onFileReady: (blob: Blob | null) => void;
  hasNewFile?: boolean;
  disabled?: boolean;
}

export function ImageUploader({
  value,
  onFileReady,
  hasNewFile = false,
  disabled,
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [cropOpen, setCropOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  const displayUrl = hasNewFile ? previewUrl : value;

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (!file.type.startsWith("image/")) {
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
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
    (blob: Blob) => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
      onFileReady(blob);
    },
    [onFileReady, previewUrl],
  );

  const handleEdit = useCallback(() => {
    if (!displayUrl) return;
    setSelectedFile(displayUrl);
    setCropOpen(true);
  }, [displayUrl]);

  const handleRemove = useCallback(() => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    onFileReady(null);
  }, [onFileReady, previewUrl]);

  const handleOpenFilePicker = useCallback(() => {
    inputRef.current?.click();
  }, []);

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
              className="w-full h-full object-contain"
            />
          </div>
          <div className="absolute inset-0 rounded-2xl bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={handleEdit}
              disabled={disabled}
              className="rounded-full"
            >
              <Pencil className="w-4 h-4 mr-1" />
              Editar
            </Button>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={handleOpenFilePicker}
              disabled={disabled}
              className="rounded-full"
            >
              <Upload className="w-4 h-4 mr-1" />
              Trocar
            </Button>
            <Button
              type="button"
              size="sm"
              variant="destructive"
              onClick={handleRemove}
              disabled={disabled}
              className="rounded-full"
            >
              <X className="w-4 h-4 mr-1" />
              Remover
            </Button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={handleOpenFilePicker}
          disabled={disabled}
          className="w-full aspect-video rounded-2xl border-2 border-dashed border-primary/30 bg-primary/5 hover:bg-primary/10 hover:border-primary/50 transition-colors flex flex-col items-center justify-center gap-3 text-primary/60 hover:text-primary/80"
        >
          <ImageIcon className="w-10 h-10" />
          <div className="text-center">
            <p className="text-sm font-medium">Clique para selecionar</p>
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
            if (previewUrl === null && selectedFile !== displayUrl) {
              URL.revokeObjectURL(selectedFile);
            }
          }}
          onCropComplete={handleCropComplete}
        />
      )}
    </div>
  );
}

import { useState, useEffect } from "react";
import { Palette, Plus, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { devLog } from "@/lib/devLog";
import {
  getColorPalette,
  updateColorPalette,
  type ColorPalette,
} from "@/lib/firestoreService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function PaletteDialog() {
  const [open, setOpen] = useState(false);
  const [colors, setColors] = useState<ColorPalette[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setLoading(true);
      getColorPalette().then((palette) => {
        setColors(palette);
        setLoading(false);
      });
    }
  }, [open]);

  const handleAddColor = () => {
    const newId = String(Date.now());
    setColors((prev) => [...prev, { id: newId, name: "", hex: "#cccccc" }]);
  };

  const handleRemoveColor = (id: string) => {
    setColors((prev) => prev.filter((c) => c.id !== id));
  };

  const handleUpdateColor = (id: string, field: "name" | "hex", value: string) => {
    setColors((prev) =>
      prev.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    );
  };

  const handleSave = async () => {
    const validColors = colors.filter((c) => c.name.trim() && c.hex);
    if (validColors.length === 0) {
      toast.error("Adicione pelo menos uma cor");
      return;
    }
    setSaving(true);
    try {
      await updateColorPalette(validColors);
      toast.success("Paleta de cores salva!");
      setOpen(false);
    } catch (err) {
      devLog.error(err);
      toast.error("Erro ao salvar paleta");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="rounded-full gap-2">
          <Palette className="w-4 h-4" /> Paleta
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader className="sm:pr-12 pt-1">
          <DialogTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5" /> Paleta de Cores
          </DialogTitle>
          <DialogDescription>
            Defina as cores da paleta que os convidados devem seguir ao comprar presentes.
          </DialogDescription>
        </DialogHeader>
        {loading ? (
          <div className="py-8 text-center text-muted-foreground">
            Carregando...
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-3">
              {colors.map((color) => (
                <div
                  key={color.id}
                  className="flex items-center gap-3 p-3 rounded-xl border bg-secondary/20"
                >
                  <div className="relative">
                    <input
                      type="color"
                      value={color.hex}
                      onChange={(e) =>
                        handleUpdateColor(color.id, "hex", e.target.value)
                      }
                      className="w-10 h-10 rounded-lg border-2 border-white shadow cursor-pointer"
                      style={{ padding: 0, background: "none" }}
                    />
                  </div>
                  <div className="flex-1">
                    <Label className="text-xs text-muted-foreground">Nome</Label>
                    <Input
                      value={color.name}
                      onChange={(e) =>
                        handleUpdateColor(color.id, "name", e.target.value)
                      }
                      placeholder="Ex: Bege"
                      className="h-9 rounded-lg mt-0.5"
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleRemoveColor(color.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
            <Button
              variant="outline"
              className="w-full rounded-full gap-2"
              onClick={handleAddColor}
            >
              <Plus className="w-4 h-4" /> Adicionar cor
            </Button>
            <Button
              className="w-full rounded-full gap-2"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Palette className="w-4 h-4" />
              )}
              {saving ? "Salvando..." : "Salvar paleta"}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

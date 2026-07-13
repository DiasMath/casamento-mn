import { useState, useEffect } from "react";
import { Tags, Plus, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { devLog } from "@/lib/devLog";
import {
  getSiteSettings,
  updateSiteSettings,
  type SiteSettings,
} from "@/lib/firestoreService";
import { clearCategoriesCache } from "@/hooks/useCategories";
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
import { GIFT_CATEGORIES } from "@/lib/constants";

const EMOJI_OPTIONS = [
  "🎁", "🏠", "🍳", "🛏️", "🛋️", "🚿", "👕", "🎨", "📦",
  "🎮", "📱", "💻", "🧹", "🪴", "🧸", "🍽️", "☕", "🧺",
  "👶", "🍼", "🧸", "🎀", "🎈", "🎊", "💐", "🍰", "🧁",
];

interface CustomCategory {
  value: string;
  label: string;
  icon: string;
}

export function CategoryDialog() {
  const [open, setOpen] = useState(false);
  const [categories, setCategories] = useState<CustomCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newIcon, setNewIcon] = useState("🎁");
  const [customIcon, setCustomIcon] = useState("");
  const [useCustomIcon, setUseCustomIcon] = useState(false);

  useEffect(() => {
    if (open) {
      setLoading(true);
      getSiteSettings().then((s) => {
        setCategories(s.customCategories || []);
        setLoading(false);
      });
    }
  }, [open]);

  const handleAdd = () => {
    if (!newLabel.trim()) {
      toast.error("Digite um nome para a categoria");
      return;
    }
    const icon = useCustomIcon ? customIcon.trim() || "🎁" : newIcon;
    const value = newLabel.trim().toLowerCase().replace(/\s+/g, "-");
    if (
      GIFT_CATEGORIES.some((c) => c.value === value) ||
      categories.some((c) => c.value === value)
    ) {
      toast.error("Essa categoria já existe");
      return;
    }
    setCategories((prev) => [
      ...prev,
      { value, label: newLabel.trim(), icon },
    ]);
    setNewLabel("");
    setNewIcon("🎁");
    setCustomIcon("");
    setUseCustomIcon(false);
  };

  const handleRemove = (value: string) => {
    setCategories((prev) => prev.filter((c) => c.value !== value));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateSiteSettings({ customCategories: categories });
      clearCategoriesCache();
      toast.success("Categorias salvas!");
      setOpen(false);
    } catch (err) {
      devLog.error(err);
      toast.error("Erro ao salvar categorias");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="rounded-full gap-2">
          <Tags className="w-4 h-4" /> Categorias
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader className="sm:pr-12 pt-1">
          <DialogTitle className="flex items-center gap-2">
            <Tags className="w-5 h-5" /> Categorias Personalizadas
          </DialogTitle>
          <DialogDescription>
            Adicione categorias extras além das padrão (Cozinha, Quarto, etc.)
          </DialogDescription>
        </DialogHeader>
        {loading ? (
          <div className="py-8 text-center text-muted-foreground">
            Carregando...
          </div>
        ) : (
          <div className="space-y-4">
            {/* Categorias padrão (somente leitura) */}
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">
                Categorias Padrão
              </p>
              <div className="flex flex-wrap gap-2">
                {GIFT_CATEGORIES.map((cat) => (
                  <span
                    key={cat.value}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-secondary/50 text-secondary-foreground text-sm rounded-full"
                  >
                    {cat.icon} {cat.label}
                  </span>
                ))}
              </div>
            </div>

            {/* Categorias personalizadas */}
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">
                Suas Categorias
              </p>
              {categories.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  Nenhuma categoria personalizada ainda.
                </p>
              ) : (
                <div className="space-y-2">
                  {categories.map((cat) => (
                    <div
                      key={cat.value}
                      className="flex items-center gap-3 p-3 rounded-xl border bg-secondary/20"
                    >
                      <span className="text-lg">{cat.icon}</span>
                      <span className="flex-1 text-sm font-medium">
                        {cat.label}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive h-8 w-8"
                        onClick={() => handleRemove(cat.value)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Adicionar nova */}
            <div className="border-t pt-4 space-y-3">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Adicionar Categoria
              </p>
              
              {/* Grid de emojis */}
              {!useCustomIcon && (
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Escolha um ícone:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {EMOJI_OPTIONS.map((e) => (
                      <button
                        key={e}
                        type="button"
                        onClick={() => setNewIcon(e)}
                        className={`w-9 h-9 rounded-lg text-lg flex items-center justify-center transition-all ${
                          newIcon === e
                            ? "bg-primary/20 ring-2 ring-primary scale-110"
                            : "bg-secondary/50 hover:bg-secondary"
                        }`}
                      >
                        {e}
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => setUseCustomIcon(true)}
                    className="text-xs text-primary underline mt-2"
                  >
                    Ou digite um ícone personalizado
                  </button>
                </div>
              )}

              {/* Ícone personalizado */}
              {useCustomIcon && (
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Digite um emoji:</p>
                  <div className="flex gap-2">
                    <Input
                      value={customIcon}
                      onChange={(e) => setCustomIcon(e.target.value)}
                      placeholder="Ex: 🎂"
                      className="h-11 rounded-xl w-20 text-center text-lg"
                      maxLength={2}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setUseCustomIcon(false);
                        setCustomIcon("");
                      }}
                      className="text-xs text-primary underline"
                    >
                      Voltar para sugestões
                    </button>
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Input
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  placeholder="Nome da categoria"
                  className="h-11 rounded-xl flex-1"
                  onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                />
                <Button
                  onClick={handleAdd}
                  className="h-11 rounded-xl gap-1 shrink-0"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <Button
              className="w-full rounded-full gap-2"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Tags className="w-4 h-4" />
              )}
              {saving ? "Salvando..." : "Salvar categorias"}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

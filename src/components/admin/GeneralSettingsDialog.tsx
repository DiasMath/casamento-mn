import { useState, useEffect } from "react";
import { Settings, Save, Loader2, PartyPopper, Gift } from "lucide-react";
import { toast } from "sonner";
import { devLog } from "@/lib/devLog";
import {
  getSiteSettings,
  updateSiteSettings,
  type SiteSettings,
} from "@/lib/firestoreService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function GeneralSettingsDialog() {
  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setLoading(true);
      getSiteSettings().then((s) => {
        setSettings(s);
        setLoading(false);
      });
    }
  }, [open]);

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      await updateSiteSettings(settings);
      toast.success("Configurações salvas! Recarregue a página para ver as mudanças.");
      setOpen(false);
    } catch (err) {
      devLog.error(err);
      toast.error("Erro ao salvar configurações");
    } finally {
      setSaving(false);
    }
  };

  const update = (key: keyof SiteSettings, value: string | boolean) => {
    if (!settings) return;
    setSettings({ ...settings, [key]: value });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="rounded-full gap-2">
          <Settings className="w-4 h-4" /> Configurações
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader className="sm:pr-12 pt-1">
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" /> Configurações Gerais
          </DialogTitle>
          <DialogDescription>
            Configure as informações do casamento e chá de panela. O site se adapta automaticamente.
          </DialogDescription>
        </DialogHeader>
        {loading || !settings ? (
          <div className="py-8 text-center text-muted-foreground">
            Carregando...
          </div>
        ) : (
          <div className="space-y-6">
            {/* Modo do Site */}
            <div className="p-4 bg-secondary/30 rounded-2xl border border-border/60">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {settings.chaDePanelaEnabled ? (
                    <PartyPopper className="w-5 h-5 text-primary" />
                  ) : (
                    <Gift className="w-5 h-5 text-muted-foreground" />
                  )}
                  <div>
                    <p className="text-sm font-semibold">
                      {settings.chaDePanelaEnabled ? "Chá de Panela ativo" : "Modo Casamento"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {settings.chaDePanelaEnabled
                        ? "Rota /cha-de-panela ativa, presentes podem ser reservados"
                        : "Site normal, todos os presentes usam pagamento"}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={settings.chaDePanelaEnabled}
                  onCheckedChange={(v) => update("chaDePanelaEnabled", v)}
                />
              </div>
            </div>

            {/* Noivos */}
            <div>
              <h3 className="text-sm font-semibold text-primary mb-3 uppercase tracking-wide">
                👫 Noivos
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="bride">Noiva</Label>
                  <Input
                    id="bride"
                    value={settings.coupleBride}
                    onChange={(e) => update("coupleBride", e.target.value)}
                    className="h-10 rounded-xl mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="groom">Noivo</Label>
                  <Input
                    id="groom"
                    value={settings.coupleGroom}
                    onChange={(e) => update("coupleGroom", e.target.value)}
                    className="h-10 rounded-xl mt-1"
                  />
                </div>
              </div>
            </div>

            {/* Casamento */}
            <div>
              <h3 className="text-sm font-semibold text-primary mb-3 uppercase tracking-wide">
                💍 Casamento
              </h3>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="weddingDate">Data</Label>
                    <Input
                      id="weddingDate"
                      type="date"
                      value={settings.weddingDate}
                      onChange={(e) => update("weddingDate", e.target.value)}
                      className="h-10 rounded-xl mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="weddingTime">Horário</Label>
                    <Input
                      id="weddingTime"
                      type="time"
                      value={settings.weddingTime}
                      onChange={(e) => update("weddingTime", e.target.value)}
                      className="h-10 rounded-xl mt-1"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="weddingVenueName">Nome do Local</Label>
                  <Input
                    id="weddingVenueName"
                    value={settings.weddingVenueName}
                    onChange={(e) => update("weddingVenueName", e.target.value)}
                    className="h-10 rounded-xl mt-1"
                    placeholder="Ex: Quinta dos Jardins"
                  />
                </div>
                <div>
                  <Label htmlFor="weddingVenueAddress">Endereço</Label>
                  <Input
                    id="weddingVenueAddress"
                    value={settings.weddingVenueAddress}
                    onChange={(e) => update("weddingVenueAddress", e.target.value)}
                    className="h-10 rounded-xl mt-1"
                    placeholder="Ex: Estrada das Acácias, 1200 — Itaipava, RJ"
                  />
                </div>
                <div>
                  <Label htmlFor="weddingMapsUrl">Link do Google Maps (embed)</Label>
                  <Input
                    id="weddingMapsUrl"
                    value={settings.weddingMapsUrl}
                    onChange={(e) => update("weddingMapsUrl", e.target.value)}
                    className="h-10 rounded-xl mt-1"
                    placeholder="Ex: https://www.google.com/maps/embed?pb=..."
                  />
                </div>
              </div>
            </div>

            {/* Chá de Panela */}
            <div>
              <h3 className="text-sm font-semibold text-primary mb-3 uppercase tracking-wide">
                🎁 Chá de Panela
              </h3>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="chaDate">Data</Label>
                    <Input
                      id="chaDate"
                      type="date"
                      value={settings.chaDate}
                      onChange={(e) => update("chaDate", e.target.value)}
                      className="h-10 rounded-xl mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="chaTime">Horário</Label>
                    <Input
                      id="chaTime"
                      type="time"
                      value={settings.chaTime}
                      onChange={(e) => update("chaTime", e.target.value)}
                      className="h-10 rounded-xl mt-1"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="chaVenueAddress">Endereço</Label>
                  <Input
                    id="chaVenueAddress"
                    value={settings.chaVenueAddress}
                    onChange={(e) => update("chaVenueAddress", e.target.value)}
                    className="h-10 rounded-xl mt-1"
                    placeholder="Ex: Rua Parintis, 516 — RJ"
                  />
                </div>
                <div>
                  <Label htmlFor="chaMapsUrl">Link do Google Maps (embed)</Label>
                  <Input
                    id="chaMapsUrl"
                    value={settings.chaMapsUrl}
                    onChange={(e) => update("chaMapsUrl", e.target.value)}
                    className="h-10 rounded-xl mt-1"
                    placeholder="Ex: https://www.google.com/maps/embed?pb=..."
                  />
                </div>
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
                <Save className="w-4 h-4" />
              )}
              {saving ? "Salvando..." : "Salvar configurações"}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

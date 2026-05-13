import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Image, Plus, ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { addGift } from "@/lib/firestoreService";

export function AddGiftForm() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [total, setTotal] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const totalNum = parseFloat(total);
      if (isNaN(totalNum) || totalNum <= 0) {
        throw new Error("O valor total deve ser um número positivo");
      }

      if (!title.trim() || !imageUrl.trim()) {
        throw new Error("Título e URL da imagem são obrigatórios");
      }

      await addGift({
        title: title.trim(),
        image: imageUrl.trim(),
        total: totalNum,
        raised: 0
      });

      toast.success("Presente adicionado com sucesso!");
      // Reset form
      setTitle("");
      setImageUrl("");
      setTotal("");
      // Navigate back to admin panel
      navigate("/admin/painel");
    } catch (error: any) {
      console.error("Error adding gift:", error);
      toast.error(error.message || "Erro ao adicionar presente");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-card rounded-3xl shadow-[var(--shadow-soft)] border border-border/60 p-8">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-12 h-12 rounded-full bg-primary/30 flex items-center justify-center mb-4">
            <Plus className="w-6 h-6 text-primary-foreground" />
          </div>
          <h1 className="font-script text-3xl mt-0">Novo Presente</h1>
          <p className="text-sm text-muted-foreground mt-2">Adicione um novo item à lista de presentes</p>
          <Link
            to="/admin/painel"
            className="mt-4 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-3 h-3" /> Voltar ao painel
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Título do Presente</Label>
            <Input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="h-12 rounded-xl mt-2"
              placeholder="Ex: Jogo de Panelas"
            />
          </div>
          <div>
            <Label htmlFor="imageUrl">URL da Imagem</Label>
            <Input
              id="imageUrl"
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              required
              className="h-12 rounded-xl mt-2"
              placeholder="Ex: https://exemplo.com/imagem.jpg"
            />
          </div>
          <div>
            <Label htmlFor="total">Valor Total (R$)</Label>
            <Input
              id="total"
              type="number"
              value={total}
              onChange={(e) => setTotal(e.target.value)}
              required
              className="h-12 rounded-xl mt-2"
              min="0.01"
              step="0.01"
              placeholder="Ex: 150.00"
            />
          </div>
          <Button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-full bg-primary text-primary-foreground hover:opacity-90"
          >
            {loading ? "Adicionando..." : "Adicionar Presente"}
          </Button>
        </form>
      </div>
    </div>
  );
}
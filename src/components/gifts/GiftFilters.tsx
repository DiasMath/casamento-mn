import { Search, SlidersHorizontal, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { GIFT_CATEGORIES, GIFT_PRIORITIES } from "@/lib/constants";
import type { GiftCategory, GiftPriority } from "@/lib/firestoreService";

export interface GiftFiltersState {
  search: string;
  category: GiftCategory | "todas";
  priority: GiftPriority | "todas";
  showCompleted: boolean;
}

interface GiftFiltersProps {
  filters: GiftFiltersState;
  onFilterChange: (filters: GiftFiltersState) => void;
  isAdmin: boolean;
}

export function GiftFilters({
  filters,
  onFilterChange,
  isAdmin,
}: GiftFiltersProps) {
  const hasActiveFilters =
    filters.search !== "" ||
    filters.category !== "todas" ||
    filters.priority !== "todas" ||
    !filters.showCompleted;

  const clearFilters = () => {
    onFilterChange({
      search: "",
      category: "todas",
      priority: "todas",
      showCompleted: true,
    });
  };

  return (
    <div className="bg-card border border-border/60 rounded-2xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <SlidersHorizontal className="w-4 h-4" />
          Filtros
        </div>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="h-9 text-xs gap-1 text-muted-foreground"
          >
            <X className="w-4 h-4" />
            Limpar
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Busca */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar presente..."
            value={filters.search}
            onChange={(e) =>
              onFilterChange({ ...filters, search: e.target.value })
            }
            className="pl-9 h-9 rounded-xl text-sm"
          />
        </div>

        {/* Categoria */}
        <Select
          value={filters.category}
          onValueChange={(v) =>
            onFilterChange({
              ...filters,
              category: v as GiftFiltersState["category"],
            })
          }
        >
          <SelectTrigger className="h-9 rounded-xl text-sm">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas as categorias</SelectItem>
            {GIFT_CATEGORIES.map((cat) => (
              <SelectItem key={cat.value} value={cat.value}>
                {cat.icon} {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Prioridade */}
        <Select
          value={filters.priority}
          onValueChange={(v) =>
            onFilterChange({
              ...filters,
              priority: v as GiftFiltersState["priority"],
            })
          }
        >
          <SelectTrigger className="h-9 rounded-xl text-sm">
            <SelectValue placeholder="Prioridade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas as prioridades</SelectItem>
            {GIFT_PRIORITIES.map((p) => (
              <SelectItem key={p.value} value={p.value}>
                {p.icon} {p.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Mostrar concluídos (apenas admin) */}
        {isAdmin && (
          <label className="flex items-center gap-2 h-9 px-3 rounded-xl border border-input cursor-pointer hover:bg-accent/50 transition-colors">
            <input
              type="checkbox"
              checked={filters.showCompleted}
              onChange={(e) =>
                onFilterChange({ ...filters, showCompleted: e.target.checked })
              }
              className="rounded border-input w-4 h-4"
            />
            <span className="text-sm">Concluídos</span>
          </label>
        )}
      </div>
    </div>
  );
}

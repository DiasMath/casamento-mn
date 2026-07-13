import { Search, X, SlidersHorizontal, Tag, Star } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useCategories } from "@/hooks/useCategories";
import { GIFT_PRIORITIES } from "@/lib/constants";
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
  const { allCategories } = useCategories();
  const hasActiveFilters =
    filters.search !== "" ||
    filters.category !== "todas" ||
    filters.priority !== "todas";

  const clearFilters = () => {
    onFilterChange({
      search: "",
      category: "todas",
      priority: "todas",
      showCompleted: true,
    });
  };

  return (
    <div className="bg-card border border-border/60 rounded-2xl p-4 sm:p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold">Filtrar presentes</span>
          {hasActiveFilters && (
            <span className="text-[10px] font-bold uppercase tracking-wider bg-primary/15 text-primary px-2 py-0.5 rounded-full">
              Ativo
            </span>
          )}
        </div>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="h-7 text-xs gap-1 rounded-full text-muted-foreground hover:text-foreground"
          >
            <X className="w-3 h-3" />
            Limpar
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Busca */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar presente..."
            value={filters.search}
            onChange={(e) =>
              onFilterChange({ ...filters, search: e.target.value })
            }
            className="pl-10 h-11 rounded-xl text-sm"
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
          <SelectTrigger className="h-11 rounded-xl text-sm">
            <div className="flex items-center gap-2">
              <Tag className="w-3.5 h-3.5 text-muted-foreground" />
              <SelectValue placeholder="Categoria" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">
              <span className="font-medium">Todas as categorias</span>
            </SelectItem>
            {allCategories.map((cat) => (
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
          <SelectTrigger className="h-11 rounded-xl text-sm">
            <div className="flex items-center gap-2">
              <Star className="w-3.5 h-3.5 text-muted-foreground" />
              <SelectValue placeholder="Prioridade" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">
              <span className="font-medium">Todas as prioridades</span>
            </SelectItem>
            {GIFT_PRIORITIES.map((p) => (
              <SelectItem key={p.value} value={p.value}>
                {p.icon} {p.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

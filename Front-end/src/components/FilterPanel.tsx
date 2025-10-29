import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon, ChevronDown, Filter, X } from "lucide-react";
import { FilterState, FilterOptions } from "@/types/filters";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface FilterPanelProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  filterOptions: FilterOptions;
}

export const FilterPanel = ({ filters, onFiltersChange, filterOptions }: FilterPanelProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState<FilterState>(filters);

  const activeFilterCount = Object.entries(filters).filter(([key, value]) => {
    if (key === 'status' && value === 'all') return false;
    if (Array.isArray(value)) return value.length > 0;
    return value !== undefined && value !== '';
  }).length;

  const handleApplyFilters = () => {
    onFiltersChange(localFilters);
    setIsOpen(false);
  };

  const handleClearFilters = () => {
    const clearedFilters: FilterState = { status: 'all' };
    setLocalFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="flex items-center justify-between">
        <CollapsibleTrigger asChild>
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            Filtros
            <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")} />
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-1">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        </CollapsibleTrigger>
        {activeFilterCount > 0 && (
          <Button variant="ghost" size="sm" onClick={handleClearFilters} className="gap-2">
            <X className="h-4 w-4" />
            Limpar filtros
          </Button>
        )}
      </div>

      <CollapsibleContent className="mt-4">
        <div className="rounded-lg border border-border bg-card p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Data Início */}
            <div className="space-y-2">
              <Label>Data Início</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !localFilters.dataInicio && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {localFilters.dataInicio ? format(new Date(localFilters.dataInicio), "PPP") : "Selecione"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={localFilters.dataInicio ? new Date(localFilters.dataInicio) : undefined}
                    onSelect={(date) =>
                      setLocalFilters({ ...localFilters, dataInicio: date ? format(date, "yyyy-MM-dd") : undefined })
                    }
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Data Fim */}
            <div className="space-y-2">
              <Label>Data Fim</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !localFilters.dataFim && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {localFilters.dataFim ? format(new Date(localFilters.dataFim), "PPP") : "Selecione"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={localFilters.dataFim ? new Date(localFilters.dataFim) : undefined}
                    onSelect={(date) =>
                      setLocalFilters({ ...localFilters, dataFim: date ? format(date, "yyyy-MM-dd") : undefined })
                    }
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={localFilters.status || 'all'}
                onValueChange={(value) => setLocalFilters({ ...localFilters, status: value as any })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="Completed">Concluído</SelectItem>
                  <SelectItem value="Pending">Pendente</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Valor Mínimo */}
            <div className="space-y-2">
              <Label>Valor Mínimo ($)</Label>
              <Input
                type="number"
                placeholder="0.00"
                value={localFilters.valorMinimo || ''}
                onChange={(e) =>
                  setLocalFilters({ ...localFilters, valorMinimo: e.target.value ? parseFloat(e.target.value) : undefined })
                }
              />
            </div>

            {/* Valor Máximo */}
            <div className="space-y-2">
              <Label>Valor Máximo ($)</Label>
              <Input
                type="number"
                placeholder="0.00"
                value={localFilters.valorMaximo || ''}
                onChange={(e) =>
                  setLocalFilters({ ...localFilters, valorMaximo: e.target.value ? parseFloat(e.target.value) : undefined })
                }
              />
            </div>

            {/* Banco */}
            <div className="space-y-2">
              <Label>Banco</Label>
              <Select
                value={localFilters.banco?.[0] || ''}
                onValueChange={(value) => setLocalFilters({ ...localFilters, banco: value ? [value] : [] })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos</SelectItem>
                  {filterOptions.bancos.map((banco) => (
                    <SelectItem key={banco} value={banco}>
                      {banco}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Categoria */}
            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select
                value={localFilters.categoria?.[0] || ''}
                onValueChange={(value) => setLocalFilters({ ...localFilters, categoria: value ? [value] : [] })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas</SelectItem>
                  {filterOptions.categorias.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Método de Pagamento */}
            <div className="space-y-2">
              <Label>Método de Pagamento</Label>
              <Select
                value={localFilters.metodoPagamento?.[0] || ''}
                onValueChange={(value) => setLocalFilters({ ...localFilters, metodoPagamento: value ? [value] : [] })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos</SelectItem>
                  {filterOptions.metodosPagamento.map((metodo) => (
                    <SelectItem key={metodo} value={metodo}>
                      {metodo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-4 justify-end">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleApplyFilters}>
              Aplicar Filtros
            </Button>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

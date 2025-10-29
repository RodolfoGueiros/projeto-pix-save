import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Upload } from "lucide-react";
import { TransactionTable } from "@/components/TransactionTable";
import { UploadModal } from "@/components/UploadModal";
import { FilterPanel } from "@/components/FilterPanel";
import { Pagamento, PaginatedResponse } from "@/types/pagamento";
import { FilterState, FilterOptions } from "@/types/filters";
import { toast } from "sonner";

const Index = () => {
  const [transactions, setTransactions] = useState<Pagamento[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  
  // Filter state
  const [filters, setFilters] = useState<FilterState>({ status: 'all' });
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    bancos: [],
    categorias: [],
    metodosPagamento: [],
  });

  const fetchTransactions = async () => {
    setIsLoading(true);
    try {
      // Build query parameters
      const params = new URLSearchParams({
        page: currentPage.toString(),
        size: pageSize.toString(),
      });
      
      // Add filter parameters
      if (filters.dataInicio) params.append('dataInicio', filters.dataInicio);
      if (filters.dataFim) params.append('dataFim', filters.dataFim);
      if (filters.status && filters.status !== 'all') params.append('status', filters.status);
      if (filters.valorMinimo) params.append('valorMinimo', filters.valorMinimo.toString());
      if (filters.valorMaximo) params.append('valorMaximo', filters.valorMaximo.toString());
      if (filters.banco && filters.banco.length > 0) params.append('banco', filters.banco[0]);
      if (filters.categoria && filters.categoria.length > 0) params.append('categoria', filters.categoria[0]);
      if (filters.metodoPagamento && filters.metodoPagamento.length > 0) params.append('metodoPagamento', filters.metodoPagamento[0]);
      
      const response = await fetch(`http://localhost:8080/api/pagamentos?${params.toString()}`);
      if (response.ok) {
        const data: PaginatedResponse<Pagamento> = await response.json();
        setTransactions(data.content);
        setTotalPages(data.totalPages);
        setTotalElements(data.totalElements);
      } else {
        toast.error("Erro ao carregar transações");
      }
    } catch (error) {
      toast.error("Erro ao conectar com o servidor");
      console.error("Fetch error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFilterOptions = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/pagamentos");
      if (response.ok) {
        const data = await response.json();
        const allTransactions = Array.isArray(data) ? data : data.content || [];
        
        const bancos = [...new Set(allTransactions.map((t: Pagamento) => t.banco).filter(Boolean))];
        const categorias = [...new Set(allTransactions.map((t: Pagamento) => t.category))];
        const metodosPagamento = [...new Set(allTransactions.map((t: Pagamento) => t.paymentMethod))];
        
        setFilterOptions({
          bancos: bancos as string[],
          categorias: categorias as string[],
          metodosPagamento: metodosPagamento as string[],
        });
      }
    } catch (error) {
      console.error("Error fetching filter options:", error);
    }
  };

  useEffect(() => {
    fetchFilterOptions();
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [currentPage, filters]);

  const filteredTransactions = useMemo(() => {
    if (!searchTerm) return transactions;
    
    return transactions.filter(
      (transaction) =>
        transaction.transactionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.paymentMethod.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, transactions]);

  const handleFiltersChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    setCurrentPage(0); // Reset to first page when filters change
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <Button
            onClick={() => setIsModalOpen(true)}
            size="lg"
            className="rounded-full px-8 shadow-lg hover:shadow-xl transition-shadow"
          >
            <Upload className="mr-2 h-5 w-5" />
            Insira o comprovante
          </Button>
        </div>

        <div className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-3xl font-bold text-foreground">Histórico de Transações</h1>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Buscar transação"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <FilterPanel
            filters={filters}
            onFiltersChange={handleFiltersChange}
            filterOptions={filterOptions}
          />

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : filteredTransactions.length > 0 ? (
            <TransactionTable
              transactions={filteredTransactions}
              currentPage={currentPage}
              totalPages={totalPages}
              totalElements={totalElements}
              pageSize={pageSize}
              onPageChange={handlePageChange}
            />
          ) : (
            <div className="rounded-lg border border-border bg-card p-12 text-center">
              <p className="text-muted-foreground">
                {searchTerm
                  ? "Nenhuma transação encontrada"
                  : "Nenhuma transação disponível"}
              </p>
            </div>
          )}
        </div>
      </div>

      <UploadModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onUploadSuccess={fetchTransactions}
      />
    </div>
  );
};

export default Index;

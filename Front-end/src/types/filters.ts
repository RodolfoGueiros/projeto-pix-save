export interface FilterState {
  dataInicio?: string;
  dataFim?: string;
  status?: 'Completed' | 'Pending' | 'all';
  valorMinimo?: number;
  valorMaximo?: number;
  banco?: string[];
  categoria?: string[];
  metodoPagamento?: string[];
}

export interface FilterOptions {
  bancos: string[];
  categorias: string[];
  metodosPagamento: string[];
}

export interface Pagamento {
  id: number;
  transactionId: string;
  category: string;
  date: string;
  amount: number;
  paymentMethod: string;
  status: 'Completed' | 'Pending';
  balance: number;
  banco?: string;
  hasComprovante?: boolean;
  comprovanteUrl?: string;
  comprovanteType?: 'image' | 'pdf';
}

export interface PaginatedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

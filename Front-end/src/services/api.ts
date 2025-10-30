// src/services/api.ts
import { Pagamento, PaginatedResponse } from "@/types/pagamento";

// Desenvolvimento local (sem Docker)
// const API_BASE_URL = "http://localhost:8080/api";

// Com Docker (usar esta)
const API_BASE_URL = "/api";

export interface PagamentoBackend {
  id: number;
  nomePagador: string;
  nomeBanco: string;
  valor: number;
  data: string; // formato: yyyy-MM-dd
  hora: string; // formato: HH:mm:ss
}

// Função para converter dados do backend para o formato do frontend
const mapPagamentoToFrontend = (pagamento: PagamentoBackend): Pagamento => {
  // Combinar data e hora
  const dateTime = new Date(`${pagamento.data}T${pagamento.hora}`);
  const formattedDate = dateTime.toLocaleDateString('pt-BR');
  
  return {
    id: pagamento.id,
    transactionId: `TXN-${pagamento.id.toString().padStart(6, '0')}`,
    category: "PIX", // Sempre PIX já que é comprovante PIX
    date: formattedDate,
    amount: pagamento.valor,
    paymentMethod: "PIX",
    status: "Completed",
    balance: pagamento.valor, // Pode ajustar conforme necessidade
    banco: pagamento.nomeBanco,
    hasComprovante: true,
    comprovanteType: 'pdf'
  };
};

export const pagamentoAPI = {
  // Listar todos os pagamentos
  async listarPagamentos(): Promise<Pagamento[]> {
    const response = await fetch(`${API_BASE_URL}/pagamentos`);
    if (!response.ok) {
      throw new Error('Erro ao buscar pagamentos');
    }
    const data: PagamentoBackend[] = await response.json();
    return data.map(mapPagamentoToFrontend);
  },

  // Buscar pagamento por ID
  async buscarPorId(id: number): Promise<Pagamento> {
    const response = await fetch(`${API_BASE_URL}/pagamentos/${id}`);
    if (!response.ok) {
      throw new Error('Pagamento não encontrado');
    }
    const data: PagamentoBackend = await response.json();
    return mapPagamentoToFrontend(data);
  },

  // Upload de comprovante
  async uploadComprovante(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/pagamentos/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Erro ao fazer upload do comprovante');
    }

    return await response.text();
  },

  // Atualizar pagamento
  async atualizarPagamento(id: number, pagamento: Partial<PagamentoBackend>): Promise<Pagamento> {
    const response = await fetch(`${API_BASE_URL}/pagamentos/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(pagamento),
    });

    if (!response.ok) {
      throw new Error('Erro ao atualizar pagamento');
    }

    const data: PagamentoBackend = await response.json();
    return mapPagamentoToFrontend(data);
  },

  // Remover pagamento
  async removerPagamento(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/pagamentos/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Erro ao remover pagamento');
    }
  },
};
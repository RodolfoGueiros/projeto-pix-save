// src/app/services/pagamento.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Pagamento {
  id: number;
  nomePagador: string;
  nomeBanco: string;
  valor: number;
  data: string;
  hora: string;
}

@Injectable({
  providedIn: 'root'
})
export class PagamentoService {
    private apiUrl = '/api/pagamentos';

  constructor(private http: HttpClient) { }

  uploadComprovante(file: File): Observable<string> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.apiUrl}/upload`, formData, { responseType: 'text' });
  }

  listarPagamentos(): Observable<Pagamento[]> {
    return this.http.get<Pagamento[]>(this.apiUrl);
  }

  removerPagamento(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  exportarParaPDF(pagamentos: Pagamento[]): void {
    // Implementação da exportação para PDF será adicionada
  }
}
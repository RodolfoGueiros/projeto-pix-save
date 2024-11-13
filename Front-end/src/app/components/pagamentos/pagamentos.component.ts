// src/app/components/pagamentos/pagamentos.component.ts

import { Component, OnInit } from '@angular/core';
import { PagamentoService, Pagamento } from '../../services/pagamento.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-pagamentos',
  templateUrl: './pagamentos.component.html',
  styleUrls: ['./pagamentos.component.scss']
})
export class PagamentosComponent implements OnInit {
  displayedColumns: string[] = ['id', 'nomePagador', 'nomeBanco', 'valor', 'data', 'hora', 'acoes'];
  dataSource = new MatTableDataSource<Pagamento>();
  
  constructor(
    private pagamentoService: PagamentoService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.carregarPagamentos();
  }

  carregarPagamentos(): void {
    this.pagamentoService.listarPagamentos().subscribe(
      data => {
        this.dataSource.data = data;
      },
      error => {
        this.snackBar.open('Erro ao carregar pagamentos', 'Fechar', { duration: 3000 });
      }
    );
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.pagamentoService.uploadComprovante(file).subscribe(
        response => {
          this.snackBar.open('Comprovante enviado com sucesso!', 'Fechar', { duration: 3000 });
          this.carregarPagamentos();
        },
        error => {
          this.snackBar.open('Erro ao enviar comprovante', 'Fechar', { duration: 3000 });
        }
      );
    }
  }

  removerPagamento(id: number): void {
    if (confirm('Tem certeza que deseja remover este pagamento?')) {
      this.pagamentoService.removerPagamento(id).subscribe(
        () => {
          this.snackBar.open('Pagamento removido com sucesso!', 'Fechar', { duration: 3000 });
          this.carregarPagamentos();
        },
        error => {
          this.snackBar.open('Erro ao remover pagamento', 'Fechar', { duration: 3000 });
        }
      );
    }
  }

  aplicarFiltro(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  exportarPDF(): void {
    this.pagamentoService.exportarParaPDF(this.dataSource.data);
  }
}
package com.rwtech.PixSave.controller;

import com.rwtech.PixSave.entity.Pagamento;
import com.rwtech.PixSave.service.PagamentoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/pagamentos")
public class PagamentoController {
    private final PagamentoService pagamentoService;

    @Autowired
    public PagamentoController(PagamentoService pagamentoService) {
        this.pagamentoService = pagamentoService;
    }

    @PostMapping("/upload")
    public String uploadComprovante(@RequestParam("file") MultipartFile file) throws IOException {
        return pagamentoService.processarComprovante(file);
    }

    @GetMapping
    public List<Pagamento> listarPagamentos() {
        return pagamentoService.listarPagamentos();
    }

    // Novo método para buscar pagamento por ID
    @GetMapping("/{id}")
    public ResponseEntity<Pagamento> buscarPagamentoPorId(@PathVariable Long id) {
        return pagamentoService.buscarPagamentoPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Novo método para atualizar pagamento
    @PutMapping("/{id}")
    public ResponseEntity<Pagamento> atualizarPagamento(@PathVariable Long id, @RequestBody Pagamento pagamento) {
        return pagamentoService.atualizarPagamento(id, pagamento)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Novo método para remover pagamento
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> removerPagamento(@PathVariable Long id) {
        if (pagamentoService.removerPagamento(id)) {
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}
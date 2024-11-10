package com.rwtech.PixSave.controller;

import com.rwtech.PixSave.entity.Pagamento;
import com.rwtech.PixSave.service.PagamentoService;
import org.springframework.beans.factory.annotation.Autowired;
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
        // Aqui chamaremos o método do serviço para processar o PDF e salvar as informações.
        return pagamentoService.processarComprovante(file);
    }

    @GetMapping
    public List<Pagamento> listarPagamentos() {
        return pagamentoService.listarPagamentos();
    }
}

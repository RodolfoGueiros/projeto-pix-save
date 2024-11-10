package com.rwtech.PixSave.service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class PagamentoService {
    private final PagamentoRepository pagamentoRepository;

    @Autowired
    public PagamentoService(PagamentoRepository pagamentoRepository) {
        this.pagamentoRepository = pagamentoRepository;
    }

    public Pagamento salvarPagamento(Pagamento pagamento) {
        return pagamentoRepository.save(pagamento);
    }

    public List<Pagamento> listarPagamentos() {
        return pagamentoRepository.findAll();
    }

    // Método para processar o PDF será adicionado aqui.
    public String processarComprovante(MultipartFile file) {
        try {
            // Carregar o PDF e extrair o texto
            PDDocument document = PDDocument.load(file.getInputStream());
            PDFTextStripper pdfStripper = new PDFTextStripper();
            String textoPDF = pdfStripper.getText(document);
            document.close();

            // Extrair informações do PDF
            Pagamento pagamento = extrairInformacoes(textoPDF);
            pagamentoRepository.save(pagamento);
            return "Comprovante processado e salvo com sucesso!";
        } catch (IOException e) {
            e.printStackTrace();
            return "Erro ao processar o comprovante.";
        }
    }

    private Pagamento extrairInformacoes(String texto) {
        Pagamento pagamento = new Pagamento();

        // Exemplo de extração usando expressões regulares (ajuste conforme o formato do seu PDF)
        Pattern nomePattern = Pattern.compile("Pagador:\\s*(.*)");
        Matcher nomeMatcher = nomePattern.matcher(texto);
        if (nomeMatcher.find()) {
            pagamento.setNomePagador(nomeMatcher.group(1));
        }

        Pattern valorPattern = Pattern.compile("Valor:\\s*R\\$\\s*([\\d,\\.]+)");
        Matcher valorMatcher = valorPattern.matcher(texto);
        if (valorMatcher.find()) {
            pagamento.setValor(new BigDecimal(valorMatcher.group(1).replace(".", "").replace(",", ".")));
        }

        Pattern dataPattern = Pattern.compile("Data:\\s*(\\d{2}/\\d{2}/\\d{4})");
        Matcher dataMatcher = dataPattern.matcher(texto);
        if (dataMatcher.find()) {
            pagamento.setData(LocalDate.parse(dataMatcher.group(1), DateTimeFormatter.ofPattern("dd/MM/yyyy")));
        }

        Pattern horaPattern = Pattern.compile("Hora:\\s*(\\d{2}:\\d{2})");
        Matcher horaMatcher = horaPattern.matcher(texto);
        if (horaMatcher.find()) {
            pagamento.setHora(LocalTime.parse(horaMatcher.group(1)));
        }

        return pagamento;
    }
}
public class PagamentoService {
    private final PagamentoRepository pagamentoRepository;

    public PagamentoService(PagamentoRepository pagamentoRepository) {
        this.pagamentoRepository = pagamentoRepository;
    }

    public String processarComprovante(MultipartFile file) {
        try {
            // Carregar o PDF e extrair o texto
            PDDocument document = PDDocument.load(file.getInputStream());
            PDFTextStripper pdfStripper = new PDFTextStripper();
            String textoPDF = pdfStripper.getText(document);
            document.close();

            // Extrair informações do PDF
            Pagamento pagamento = extrairInformacoes(textoPDF);
            pagamentoRepository.save(pagamento);
            return "Comprovante processado e salvo com sucesso!";
        } catch (IOException e) {
            e.printStackTrace();
            return "Erro ao processar o comprovante.";
        }
    }

    private Pagamento extrairInformacoes(String texto) {
        Pagamento pagamento = new Pagamento();

        // Exemplo de extração usando expressões regulares (ajuste conforme o formato do seu PDF)
        Pattern nomePattern = Pattern.compile("Pagador:\\s*(.*)");
        Matcher nomeMatcher = nomePattern.matcher(texto);
        if (nomeMatcher.find()) {
            pagamento.setNomePagador(nomeMatcher.group(1));
        }

        Pattern valorPattern = Pattern.compile("Valor:\\s*R\\$\\s*([\\d,\\.]+)");
        Matcher valorMatcher = valorPattern.matcher(texto);
        if (valorMatcher.find()) {
            pagamento.setValor(new BigDecimal(valorMatcher.group(1).replace(".", "").replace(",", ".")));
        }

        Pattern dataPattern = Pattern.compile("Data:\\s*(\\d{2}/\\d{2}/\\d{4})");
        Matcher dataMatcher = dataPattern.matcher(texto);
        if (dataMatcher.find()) {
            pagamento.setData(LocalDate.parse(dataMatcher.group(1), DateTimeFormatter.ofPattern("dd/MM/yyyy")));
        }

        Pattern horaPattern = Pattern.compile("Hora:\\s*(\\d{2}:\\d{2})");
        Matcher horaMatcher = horaPattern.matcher(texto);
        if (horaMatcher.find()) {
            pagamento.setHora(LocalTime.parse(horaMatcher.group(1)));
        }

        return pagamento;
    }
}

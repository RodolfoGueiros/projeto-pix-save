package com.rwtech.PixSave.service;

import com.rwtech.PixSave.entity.Pagamento;
import com.rwtech.PixSave.repository.PagamentoRepository;
import net.sourceforge.tess4j.Tesseract;
import net.sourceforge.tess4j.TesseractException;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class PagamentoService {
    private final PagamentoRepository pagamentoRepository;
    private final Tesseract tesseract;

    @Autowired
    public PagamentoService(PagamentoRepository pagamentoRepository) {
        this.pagamentoRepository = pagamentoRepository;

        // Configurando o Tesseract
        this.tesseract = new Tesseract();
        tesseract.setDatapath("C:\\Program Files\\Tesseract-OCR");
        tesseract.setLanguage("por"); // Definindo o idioma como português, se necessário
    }

    public Pagamento salvarPagamento(Pagamento pagamento) {
        return pagamentoRepository.save(pagamento);
    }

    public List<Pagamento> listarPagamentos() {
        return pagamentoRepository.findAll();
    }

    // Método para processar comprovantes (PDF ou Imagem)
    public String processarComprovante(MultipartFile file) {
        String textoExtraido;
        try {
            // Verificar a extensão do arquivo para decidir o método de extração
            if (file.getOriginalFilename().endsWith(".pdf")) {
                // Extrair texto de PDF
                textoExtraido = extrairTextoDePDF(file);
            } else if (file.getOriginalFilename().endsWith(".jpeg") || file.getOriginalFilename().endsWith(".jpg")) {
                // Extrair texto de imagem usando Tesseract OCR
                textoExtraido = tesseract.doOCR(file.getInputStream());
            } else {
                return "Formato de arquivo não suportado.";
            }

            // Extrair informações do texto
            Pagamento pagamento = extrairInformacoes(textoExtraido);
            pagamentoRepository.save(pagamento);
            return "Comprovante processado e salvo com sucesso!";
        } catch (IOException | TesseractException e) {
            e.printStackTrace();
            return "Erro ao processar o comprovante.";
        }
    }

    private String extrairTextoDePDF(MultipartFile file) throws IOException {
        PDDocument document = PDDocument.load(file.getInputStream());
        PDFTextStripper pdfStripper = new PDFTextStripper();
        String textoPDF = pdfStripper.getText(document);
        document.close();
        return textoPDF;
    }

    private Pagamento extrairInformacoes(String texto) {
        Pagamento pagamento = new Pagamento();

        // Exemplo de extração usando expressões regulares (ajuste conforme o formato do seu texto)
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

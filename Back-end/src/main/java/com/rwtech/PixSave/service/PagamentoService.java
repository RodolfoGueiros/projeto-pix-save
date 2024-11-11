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

import java.io.File;
import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
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
        // Definindo o caminho dos arquivos de dados do Tesseract
        tesseract.setDatapath("C:\\Program Files\\Tesseract-OCR\\tessdata");
        // Definindo o idioma como português
        tesseract.setLanguage("por");
    }

    public Pagamento salvarPagamento(Pagamento pagamento) {
        return pagamentoRepository.save(pagamento);
    }

    public List<Pagamento> listarPagamentos() {
        return pagamentoRepository.findAll();
    }

    // Novo método para buscar pagamento por ID
    public Optional<Pagamento> buscarPagamentoPorId(Long id) {
        return pagamentoRepository.findById(id);
    }

    // Novo método para atualizar pagamento
    public Optional<Pagamento> atualizarPagamento(Long id, Pagamento pagamentoAtualizado) {
        return pagamentoRepository.findById(id)
                .map(pagamentoExistente -> {
                    // Atualiza apenas os campos não nulos
                    if (pagamentoAtualizado.getNomePagador() != null) {
                        pagamentoExistente.setNomePagador(pagamentoAtualizado.getNomePagador());
                    }
                    if (pagamentoAtualizado.getNomeBanco() != null) {
                        pagamentoExistente.setNomeBanco(pagamentoAtualizado.getNomeBanco());
                    }
                    if (pagamentoAtualizado.getValor() != null) {
                        pagamentoExistente.setValor(pagamentoAtualizado.getValor());
                    }
                    if (pagamentoAtualizado.getData() != null) {
                        pagamentoExistente.setData(pagamentoAtualizado.getData());
                    }
                    if (pagamentoAtualizado.getHora() != null) {
                        pagamentoExistente.setHora(pagamentoAtualizado.getHora());
                    }
                    return pagamentoRepository.save(pagamentoExistente);
                });
    }

    // Novo método para remover pagamento
    public boolean removerPagamento(Long id) {
        if (pagamentoRepository.existsById(id)) {
            pagamentoRepository.deleteById(id);
            return true;
        }
        return false;
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
                File imageFile = convertMultipartToFile(file);
                textoExtraido = tesseract.doOCR(imageFile);
            } else {
                return "Formato de arquivo não suportado.";
            }

            // Extrair informações do texto
            Pagamento pagamento = extrairInformacoes(textoExtraido);

            // Salvar o pagamento no banco de dados
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

    private File convertMultipartToFile(MultipartFile file) throws IOException {
        File convFile = new File(file.getOriginalFilename());
        file.transferTo(convFile);
        return convFile;
    }

    private Pagamento extrairInformacoes(String texto) {
        Pagamento pagamento = new Pagamento();

        // Extrair nome do pagador
        Pattern nomePattern = Pattern.compile("Nome:\\s*(.*)");
        Matcher nomeMatcher = nomePattern.matcher(texto);
        if (nomeMatcher.find()) {
            pagamento.setNomePagador(nomeMatcher.group(1));
        }

        // Extrair nome do banco do pagador
        Pattern nomeBancoPattern = Pattern.compile("Instituição:\\s*(.*)");
        Matcher nomeBancoMatcher = nomeBancoPattern.matcher(texto);
        if (nomeBancoMatcher.find()) {
            pagamento.setNomeBanco(nomeBancoMatcher.group(1));
        }

        // Extrair valor da transação
        Pattern valorPattern = Pattern.compile("Valor:\\s*R\\$\\s*([\\d,\\.]+)");
        Matcher valorMatcher = valorPattern.matcher(texto);
        if (valorMatcher.find()) {
            pagamento.setValor(new BigDecimal(valorMatcher.group(1).replace(".", "").replace(",", ".")));
        }

        // Extrair data da transação
        Pattern dataPattern = Pattern.compile("Data e Hora:\\s*(\\d{2}/\\d{2}/\\d{4})");
        Matcher dataMatcher = dataPattern.matcher(texto);
        if (dataMatcher.find()) {
            pagamento.setData(LocalDate.parse(dataMatcher.group(1), DateTimeFormatter.ofPattern("dd/MM/yyyy")));
        }

        // Extrair hora da transação
        Pattern horaPattern = Pattern.compile("Data e Hora:\\s*\\d{2}/\\d{2}/\\d{4}\\s*-\\s*(\\d{2}:\\d{2}:\\d{2})");
        Matcher horaMatcher = horaPattern.matcher(texto);
        if (horaMatcher.find()) {
            pagamento.setHora(LocalTime.parse(horaMatcher.group(1)));
        }

        return pagamento;
    }
}
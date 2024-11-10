package com.rwtech.PixSave.entity;
import jakarta.persistence.*;
import lombok.Data;
//import javax.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "pagamento")
@Data
public class Pagamento {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nomePagador;
    private String nomeBanco;
    private BigDecimal valor;
    private LocalDate data;
    private LocalTime hora;
}

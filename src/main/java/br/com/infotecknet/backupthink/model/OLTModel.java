package br.com.infotecknet.backupthink.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "olt_configs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OLTModel {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String nameOLT;

    @Column(nullable = false, unique = true)
    private String IpOlt;

    @Column(nullable = false)
    private String username;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private boolean enabled = true;
}

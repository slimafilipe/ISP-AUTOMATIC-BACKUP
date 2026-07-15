package br.com.infotecknet.backupthink.controller;

import br.com.infotecknet.backupthink.dto.OLTConfigSaveDTO;
import br.com.infotecknet.backupthink.model.OLTModel;
import br.com.infotecknet.backupthink.repository.OLTRepository;
import br.com.infotecknet.backupthink.service.BackupThinkGitService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.io.File;
import java.io.FileNotFoundException;

@RestController
@RequestMapping("/api/v1/olts")
@RequiredArgsConstructor
public class OLTBackupController {
    private final OLTRepository oltRepository;
    private final BackupThinkGitService backupService;

    @GetMapping("/{id}/download-git")
    public ResponseEntity<Resource> downloadFromGit(@PathVariable Long id) {
        try {
            File backupFile = backupService.getBackupFromGit(id);
            Resource resource = new FileSystemResource(backupFile);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentDisposition(ContentDisposition.builder("attachment")
                    .filename(backupFile.getParentFile().getName() + "_backup_config.bin")
                    .build());

            return ResponseEntity.ok()
                    .headers(headers)
                    .contentLength(backupFile.length())
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .body(resource);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping
    public ResponseEntity<OLTModel> addNewOLT(@RequestBody OLTConfigSaveDTO dto) {
        OLTModel newOlt = OLTModel.builder()
                .IpOlt(dto.ip())
                .nameOLT(dto.name())
                .username(dto.username())
                .password(dto.password())
                .enabled(true)
                .build();

        OLTModel save = oltRepository.save(newOlt);
        return ResponseEntity.status(HttpStatus.CREATED).body(save);
    }

    @PostMapping("/{id}/manual-backup")
    public ResponseEntity<Resource> manualBackup(@PathVariable Long id) {
        try {
            File backupFile = backupService.execBackupById(id);

            Resource resource = new FileSystemResource(backupFile);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentDisposition(ContentDisposition.builder("attachment")
                    .filename(backupFile.getName())
                    .build());
            return ResponseEntity.ok()
                    .headers(headers)
                    .contentLength(backupFile.length())
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .body(resource);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            e.printStackTrace();
            System.err.println("ERRO AO ENVIAR ARQUIVO: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}

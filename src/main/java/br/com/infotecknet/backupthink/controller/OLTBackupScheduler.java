package br.com.infotecknet.backupthink.controller;

import br.com.infotecknet.backupthink.service.BackupThinkGitService;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class OLTBackupScheduler {

    private final BackupThinkGitService backupService;

    @Scheduled(cron = "0 0 3 */2 * *")
    public void routineBackup() {
        backupService.execBackupAllOlt();
    }
}

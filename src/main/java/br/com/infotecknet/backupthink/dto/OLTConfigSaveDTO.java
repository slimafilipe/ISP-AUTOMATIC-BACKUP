package br.com.infotecknet.backupthink.dto;

public record OLTConfigSaveDTO(
        String name,
        String ip,
        String username,
        String password
) {}

package br.com.infotecknet.backupthink.dto;

public record LoginResponse(
        String err,
        String id,
        String name,
        String token
) {}

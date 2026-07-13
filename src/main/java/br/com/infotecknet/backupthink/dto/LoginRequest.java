package br.com.infotecknet.backupthink.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record LoginRequest(
        @JsonProperty("password") String password,
        @JsonProperty("username") String username
) {}

package br.com.infotecknet.backupthink.service;

import br.com.infotecknet.backupthink.dto.LoginRequest;
import br.com.infotecknet.backupthink.dto.LoginResponse;
import br.com.infotecknet.backupthink.model.OLTModel;
import br.com.infotecknet.backupthink.repository.OLTRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.eclipse.jgit.api.Git;
import org.eclipse.jgit.api.errors.GitAPIException;
import org.eclipse.jgit.transport.UsernamePasswordCredentialsProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.io.*;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor

public class BackupThinkGitService {

    private final RestTemplate restTemplate;
    private final OLTRepository oltRepository;

    @Value("${github.url}")
    private  String githubUrl;
    @Value("${github.token}")
    private  String githubToken;
    @Value("${github.email}")
    private  String githubEmail;
    @Value("${github.author}")
    private  String githubAuthor;

    private static final String localRepoDir = "./target/git-backups/";


    public void execBackupAllOlt() {
        List<OLTModel> oltEnabled = oltRepository.findAllByEnabledTrue();
        if (oltEnabled.isEmpty()) {
            System.out.println("Nenhuma OLT para processar.");
            return;
        }
        try (Git git = initializeRepoGit()) {
            for (OLTModel olt : oltEnabled) {
                processBackup(git, olt);
            }
            commitAndPushGit(git);
        } catch (Exception e) {
            System.err.println("Erro ao rodar lote de backups: " + e.getMessage());
        }
    }

    public File execBackupById(Long id) {
        OLTModel olt = oltRepository.findById(id).
                orElseThrow(() -> new EntityNotFoundException("OLT não encontrada com id: " + id));
        try (Git git = initializeRepoGit()) {
            processBackup(git, olt);
            commitAndPushGit(git);

            String subPathOlt = localRepoDir + "olts/" + olt.getIpOlt().replace(".", "_") + "/";
            return new File(subPathOlt + olt.getNameOLT() + "_backup_config.bin");
        } catch (Exception e) {
            Throwable cause = e;
            while (cause.getCause() != null) {
                cause = cause.getCause();
            }
            System.err.println("CAUSA REAL DO JGIT: " + cause.getMessage());
            cause.printStackTrace();
            throw new RuntimeException("Erro a processar backup individual" + e.getMessage());
        }
    }

    public File getBackupFromGit(Long id) {
        OLTModel olt = oltRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("OLT não encontrada com id: " + id));
        try(Git git = initializeRepoGit()) {
            UsernamePasswordCredentialsProvider credentialsProvider =
                    new UsernamePasswordCredentialsProvider("oauth2", githubToken);
            git.pull().setCredentialsProvider(credentialsProvider).call();

            String pathOlt = localRepoDir + "olts/" + olt.getIpOlt().replace(".", "_") + "/";
            File file = new File(pathOlt + olt.getNameOLT() + "_backup_config.bin");

            if (!file.exists()) {
                throw new FileNotFoundException("Arquivo de backup não encontrado no repositorio");
            }
            return file;
        } catch (Exception e) {
           throw new RuntimeException("Erro ao recuperar backup: " + e.getMessage());
        }
    }

    public Git initializeRepoGit() throws GitAPIException, IOException {
        File localRepoFolder = new File(localRepoDir);

        UsernamePasswordCredentialsProvider credentialsProvider =
                new UsernamePasswordCredentialsProvider("oauth2", githubToken);

        if (!localRepoFolder.exists()) {
            return Git.cloneRepository()
                    .setURI(githubUrl)
                    .setDirectory(localRepoFolder)
                    .setCredentialsProvider(credentialsProvider)
                    .call();
        } else {
            Git git = Git.open(localRepoFolder);
            git.pull().setCredentialsProvider(credentialsProvider).call();
            return git;
        }
    }

    public void processBackup(Git git, OLTModel olt) {
        String loginUrl = "http://" + olt.getIpOlt() + "/api/login";
        String backupUrl = "http://" + olt.getIpOlt() + "/api/management/config";

        try {
            LoginRequest loginBody = new LoginRequest(olt.getPassword(), olt.getUsername());

            ResponseEntity<LoginResponse> loginResponse = restTemplate.postForEntity(loginUrl, loginBody, LoginResponse.class);
            LoginResponse responseBody = loginResponse.getBody();

            if (responseBody == null || responseBody.token() == null) {
                throw new RuntimeException("Token nulo");
            }

            String oltToken = responseBody.token();

            String subPathOlt = localRepoDir + "olts/" + olt.getIpOlt().replace(".", "_") + "/";
            Files.createDirectories(Paths.get(subPathOlt));

            File backupFile  = new File(subPathOlt + olt.getNameOLT() + "_backup_config.bin");

            String tokenFormated = "Bearer " + oltToken.trim();
            HttpHeaders headers = new HttpHeaders();
            headers.set(HttpHeaders.AUTHORIZATION, tokenFormated);
            headers.set(HttpHeaders.ACCEPT, "application/json, text/plain, */*");

            restTemplate.execute(backupUrl, HttpMethod.GET,
                    clientRequest -> clientRequest.getHeaders().addAll(headers),
                    clientResponse -> {
                        try (InputStream inputStream = clientResponse.getBody()) {

                            byte[] buffer = new byte[4096];
                            int bytesRead = inputStream.read(buffer);

                            if (bytesRead != -1) {
                                String firstLine = new String(buffer, 0, bytesRead, StandardCharsets.UTF_8);

                                if (firstLine.contains("Unauthorized access") || firstLine.contains("\"err\"")) {
                                    throw new RuntimeException("A OLT recusou o token de acesso. Detalhe: " + firstLine.trim());
                                }

                                try (FileOutputStream outputStream = new FileOutputStream(backupFile)) {
                                    outputStream.write(buffer, 0, bytesRead);
                                    while ((bytesRead = inputStream.read(buffer)) != -1) {
                                        outputStream.write(buffer, 0, bytesRead);
                                    }
                                }
                            }
                        }
                        return backupFile;
            }
            );

            git.add().addFilepattern("olts/" + olt.getIpOlt().replace(".", "_") + "/").call();

        } catch (IOException e) {
            throw new RuntimeException("Erro ao processar OLT " + olt.getNameOLT() + ": " + e.getMessage());
        } catch (GitAPIException e) {
            throw new RuntimeException(e);
        }
    }

    public void commitAndPushGit(Git git) throws Exception {

        UsernamePasswordCredentialsProvider credentialsProvider =
                new UsernamePasswordCredentialsProvider("oauth2", githubToken);

        String timeStamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
        git.commit()
                .setMessage("Backup automatico - " + timeStamp)
                .setAuthor(githubAuthor, githubEmail)
                .call();

        git.push().setCredentialsProvider(credentialsProvider).call();
        System.out.print("Backup realizado com sucesso!\n");
    }

}

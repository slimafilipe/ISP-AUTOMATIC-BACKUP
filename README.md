# ISP-AUTOMATIC-BACKUP

Serviço automatizado desenvolvido em Spring Boot responsável por realizar o backup de configurações de gerência de OLTs da fabricante **Think**, centralizando e versionando os arquivos binários (`.bin`) de forma segura em um repositório privado do **GitHub**.
Este projeto surgiu como iniciativa para facilitar o meu dia-a-dia na administração da infraestrutura de rede do ISP onde trabalho. 

---

## 🛠️ Tecnologias Utilizadas

* **Java 25** (Asynchronous Connection Pools & Virtual Threads)
* **Spring Boot 3.x** (Web, Data JPA)
* **H2 Database** (Ambiente de Desenvolvimento/Testes)
* **JGit** (Integração nativa com o protocolo Git via Java)
* **Lombok** (Produtividade e código limpo)

---

## 🏗️ Como a API Funciona

1. **Autenticação na OLT:** A API dispara um `POST /api/login` para a OLT enviando um payload com senha e usuário.
2. **Download do Binário:** Com o `Bearer Token` gerado, o sistema executa um `GET /api/management/config` via streaming direto (`InputStream`) para evitar sobrecarga de memória.
3. **Validação:** O fluxo intercepta se a OLT devolveu uma mensagem de erro em formato JSON (evitando comitar arquivos corrompidos).
4. **Versionamento:** O JGit abre o repositório local, adiciona o arquivo na estrutura (`olts/{IP}/{NOME_OLT}/backup_config.bin`), realiza o commit e faz o `push` para o GitHub.

---

## 🚀 Como Configurar e Rodar

### 1. Clonar o Repositório
```bash
git clone [https://github.com/slimafilipe/cronjob-oltThink_backup.git](https://github.com/slimafilipe/cronjob-oltThink_backup.git)
cd cronjob-oltThink_backup
```
### 2. Configurar as Propriedades da Aplicação
Copie o arquivo application.yaml.example de configuração para o arquivo oficial que o Spring Boot vai ler:
```bash
cp src/main/resources/application.yml.example src/main/resources/application.yml
```
Abra o application.yml gerado e preencha as variáveis do seu ambiente.

### 3. Execute o Projeto
```bash
./mvnw spring-boot:run
```

## 🔌 Endpoints Principais
### Executar Backup Individual

Dispara o processo de login, extração e commit imediato para uma OLT cadastrada no banco de dados. Devolve o download do binário diretamente na requisição.

    URL: http://localhost:8080/api/v1/olts/{id}/manual-backup

    Método: POST

    Resposta de Sucesso: 200 OK (Retorna o arquivo backup_config.bin)

### Executar Backup em Lote

Gera uma rotina sequencial para varrer todas as OLTs que estão com a flag enabled = true no banco de dados, realizando um push unificado com os logs de timestamp.

    URL: http://localhost:8080/api/v1/olts/backup-all

    Método: POST
# 📚 Documentação Técnica — API Projeto Integrador

## 1. Visão Geral

Este projeto é uma **API REST** desenvolvida para apoiar o gerenciamento de Projetos Integradores em ambiente acadêmico. A aplicação permite o cadastro e acompanhamento de usuários, projetos, etapas, tarefas e entregas, sendo construída como exercício prático dos conceitos da disciplina de **Engenharia de Software**.

A escolha tecnológica priorizou simplicidade e portabilidade: a stack roda em qualquer sistema operacional com Node.js instalado, sem necessidade de banco de dados externo ou ferramentas de compilação nativa.

## 2. Stack Tecnológica

| Camada | Tecnologia | Justificativa |
|---|---|---|
| Runtime | Node.js 18+ | Ambiente leve, ampla adoção |
| Framework HTTP | Express 4 | Padrão de mercado para APIs REST em Node |
| CORS | cors | Permite consumo da API por front-ends externos |
| Persistência | Arquivo JSON (próprio) | Zero dependências nativas; portátil |
| Testes | Postman Collection | Formato padrão para documentação de testes de API |
| Automação | Newman | Executor headless de Collections via CLI |
| Relatório | newman-reporter-htmlextra | Geração de relatório HTML detalhado |

## 3. Arquitetura

O projeto adota uma arquitetura em **3 camadas**:

```
┌──────────────────────────────────────────┐
│  Camada de Apresentação (HTTP)           │
│  server.js                                │
│  - Configura Express, middlewares, rotas  │
└────────────────┬─────────────────────────┘
                 │
┌────────────────▼─────────────────────────┐
│  Camada de Controladores                  │
│  routes/usuarios.js, projetos.js, etc.    │
│  - Recebe req, valida, chama repository   │
│  - Retorna res com status HTTP correto    │
└────────────────┬─────────────────────────┘
                 │
┌────────────────▼─────────────────────────┐
│  Camada de Persistência (Repository)      │
│  database.js                              │
│  - CRUD genérico                          │
│  - Cascata referencial                    │
│  - Serialização em JSON                   │
└──────────────────────────────────────────┘
```

### 3.1 Princípios aplicados

- **Single Responsibility**: cada arquivo cuida de uma única responsabilidade (uma entidade, ou uma camada)
- **Open/Closed**: novas entidades podem ser adicionadas sem alterar `database.js`
- **DRY**: validações reutilizáveis (status, FKs); função `enriquecer()` para joins
- **Separation of Concerns**: rotas não conhecem detalhes do armazenamento; o repositório não conhece HTTP

## 4. Modelo de Dados

```
┌──────────────┐         ┌──────────────┐
│  usuarios    │◄────────┤  projetos    │
│  - id PK     │ 1     N │  - id PK     │
│  - nome      │         │  - titulo    │
│  - email UQ  │         │  - usuario_id│
│  - senha     │         │  - status    │
│  - tipo      │         └──────┬───────┘
└──────┬───────┘                │ 1
       │                        │
       │                        │ N
       │ N (responsavel) ┌──────▼───────┐
       └─────────────────┤   etapas     │
                         │  - id PK     │
                         │  - projeto_id│
                         │  - ordem     │
                         └──────┬───────┘
                                │ 1
                                │
                                │ N
                         ┌──────▼───────┐
                         │   tarefas    │
                         │  - id PK     │
                         │  - etapa_id  │
                         │  - responsavel_id (FK usuarios) │
                         └──────────────┘

┌──────────────┐
│   entregas   │
│  - id PK     │
│  - projeto_id│  N───1───► projetos
│  - data_entrega
│  - nota      │
└──────────────┘
```

### 4.1 Dicionário de dados

**usuarios**

| Campo | Tipo | Restrição |
|---|---|---|
| id | integer | PK, autoincrement |
| nome | string | obrigatório |
| email | string | obrigatório, único |
| senha | string | obrigatório (não retornado nas respostas) |
| tipo | string | enum: aluno, professor, coordenador |
| created_at | datetime | gerado automaticamente |

**projetos**

| Campo | Tipo | Restrição |
|---|---|---|
| id | integer | PK |
| titulo | string | obrigatório |
| descricao | string | opcional |
| status | string | enum: planejado, em_andamento, concluido, cancelado |
| usuario_id | integer | FK obrigatório → usuarios.id |

**etapas**

| Campo | Tipo | Restrição |
|---|---|---|
| id | integer | PK |
| projeto_id | integer | FK obrigatório → projetos.id |
| titulo | string | obrigatório |
| ordem | integer | default 1 |
| status | string | enum: pendente, em_andamento, concluida |
| prazo | date | opcional (ISO 8601: YYYY-MM-DD) |

**tarefas**

| Campo | Tipo | Restrição |
|---|---|---|
| id | integer | PK |
| etapa_id | integer | FK obrigatório → etapas.id |
| titulo | string | obrigatório |
| descricao | string | opcional |
| status | string | enum: pendente, em_andamento, concluida |
| responsavel_id | integer | FK opcional → usuarios.id |

**entregas**

| Campo | Tipo | Restrição |
|---|---|---|
| id | integer | PK |
| projeto_id | integer | FK obrigatório → projetos.id |
| titulo | string | obrigatório |
| descricao | string | opcional |
| arquivo_url | string | opcional |
| data_entrega | date | obrigatório |
| status | string | enum: pendente, entregue, avaliada |
| nota | real | opcional (0-10) |

### 4.2 Regras de cascata (ON DELETE CASCADE)

- Excluir um **usuario** → exclui seus **projetos** (e tudo abaixo) e zera o `responsavel_id` em tarefas
- Excluir um **projeto** → exclui suas **etapas**, **tarefas** e **entregas**
- Excluir uma **etapa** → exclui suas **tarefas**

## 5. Endpoints da API

Base URL: `http://localhost:3000`

### Usuários

| Método | Rota | Descrição | Status sucesso |
|---|---|---|---|
| GET | /usuarios | Lista todos | 200 |
| GET | /usuarios/:id | Busca por id | 200 |
| POST | /usuarios | Cria novo | 201 |
| PUT | /usuarios/:id | Atualiza | 200 |
| DELETE | /usuarios/:id | Remove | 204 |

### Projetos, Etapas, Tarefas, Entregas

Mesmo padrão REST: `GET /<recurso>`, `GET /<recurso>/:id`, `POST`, `PUT`, `DELETE`.

### Códigos HTTP utilizados

| Status | Significado | Quando |
|---|---|---|
| 200 OK | Sucesso na leitura/atualização | GET, PUT |
| 201 Created | Recurso criado | POST |
| 204 No Content | Recurso removido | DELETE |
| 400 Bad Request | Validação de campos falhou | POST/PUT com dados inválidos |
| 404 Not Found | Recurso não existe | id inválido |
| 409 Conflict | Violação de unicidade | email duplicado |
| 500 Internal Server Error | Erro inesperado | tratamento global |

## 6. Estratégia de Testes

Os testes seguem a abordagem proposta no artigo de **Renato Groffe** ("Automatizando testes de APIs REST com Postman + Newman"), que descreve a execução de Collections via linha de comando e a geração de relatórios automatizada — fluxo ideal para integração em pipelines CI/CD.

### 6.1 Tipos de teste cobertos

| Tipo | Quantidade | Exemplos |
|---|---|---|
| Funcionais (happy path) | 15 | Criar usuário → status 201 + id retornado |
| Validação (sad path) | 1 | POST sem campos → status 400 |
| Integração entre recursos | 8 | Tarefa referencia etapa que referencia projeto |
| Verificação de cleanup | 5 | DELETE retorna 204; GET subsequente retorna 404 |

### 6.2 Estrutura da Collection

A Collection executa um fluxo end-to-end em ordem numerada:

1. **00 Health check** — confirma que a API responde
2. **01-05 Usuários** — CRUD completo + validação
3. **06-08 Projetos** — usando o usuário criado
4. **09-10 Etapas** — vinculadas ao projeto
5. **11-12 Tarefas** — vinculadas à etapa
6. **13-15 Entregas** — vinculadas ao projeto
7. **16-20 Cleanup** — deleta tudo em ordem inversa

Cada requisição salva variáveis (`usuarioId`, `projetoId`, etc.) que são usadas pelas seguintes — provando o relacionamento entre entidades.

### 6.3 Execução via CLI (Newman)

```bash
npm test
```

Equivale a:

```bash
newman run tests/collection.postman_collection.json \
  -e tests/environment.postman_environment.json \
  -r cli,htmlextra \
  --reporter-htmlextra-export ./reports/relatorio.html
```

### 6.4 Métricas do último run

- 22 requisições
- 21 test scripts
- 40 assertions
- 0 falhas
- Tempo total: ~500ms
- Tempo médio por request: 4ms

## 7. Integração Contínua (CI/CD)

O comando `npm test` foi projetado para ser plugável em pipelines como GitHub Actions, GitLab CI ou Jenkins:

```yaml
# Exemplo .github/workflows/test.yml
name: API Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: npm install
      - run: npm start &
      - run: sleep 3
      - run: npm test
      - uses: actions/upload-artifact@v4
        with:
          name: relatorio-testes
          path: reports/relatorio.html
```

## 8. Evolução futura

Possíveis melhorias para um cenário de produção:

- Substituir persistência em JSON por **PostgreSQL** ou **MongoDB**
- Implementar **autenticação JWT** e hash de senhas (bcrypt)
- Adicionar **paginação** e **filtros** nas listagens
- **Validação de schema** com Joi ou Zod
- **Documentação Swagger/OpenAPI** automática
- **Testes unitários** com Jest, complementando os testes de integração via Postman

## 9. Referências

- GROFFE, Renato. *Automatizando testes de APIs REST com Postman + Newman*. Medium, 2020.
- Express.js Documentation — https://expressjs.com
- Newman Documentation — https://github.com/postmanlabs/newman
- htmlextra Reporter — https://github.com/DannyDainton/newman-reporter-htmlextra
- HTTP Status Codes — RFC 7231 / RFC 5789

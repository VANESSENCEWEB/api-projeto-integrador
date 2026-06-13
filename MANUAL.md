# Manual de Execução — API Projeto Integrador

Este documento descreve o procedimento de instalação, execução e verificação da API REST desenvolvida para a disciplina de Engenharia de Software, incluindo a automação dos testes via Postman + Newman conforme metodologia proposta por Groffe (2020).

---

## Pré-requisitos

A aplicação requer **Node.js versão 18 ou superior**. Para verificar a instalação:

```bash
node --version
npm --version
```

Caso o Node.js não esteja instalado, obtenha-o em https://nodejs.org.

Nenhuma outra ferramenta é necessária: as dependências (Express, CORS, Newman e htmlextra) são gerenciadas pelo npm e instaladas localmente no projeto.

---

## 1. Instalação de Dependências

A partir do diretório raiz do projeto (`api-projeto-integrador/`), execute:

```bash
npm install
```

O comando instalará as bibliotecas declaradas em `package.json`, criando o diretório `node_modules/`.

---

## 2. Execução da API

Para iniciar o servidor HTTP:

```bash
npm start
```

A aplicação será disponibilizada em `http://localhost:3000`. O terminal exibirá:

```
Banco JSON inicializado: ./database.json
API rodando em http://localhost:3000
Documentação na rota GET /
```

Este processo deve permanecer ativo durante a execução dos testes. A rota `GET /` retorna a listagem dos endpoints disponíveis em formato JSON.

---

## 3. Execução dos Testes Automatizados

Em uma nova sessão de terminal, no mesmo diretório, execute:

```bash
npm test
```

O Newman executará a coleção Postman (`tests/collection.postman_collection.json`) utilizando o environment configurado (`tests/environment.postman_environment.json`), realizando 22 requisições HTTP que validam 40 asserções distribuídas entre:

- Verificação de disponibilidade da API (health check)
- Operações CRUD sobre a entidade Usuários
- Validação de campos obrigatórios e regras de negócio
- Operações CRUD sobre Projetos, com integridade referencial a Usuários
- Operações CRUD sobre Etapas, vinculadas a Projetos
- Operações CRUD sobre Tarefas, com atribuição de responsável
- Operações CRUD sobre Entregas, incluindo avaliação com nota
- Limpeza dos dados ao final da execução (cleanup em ordem reversa)

Ao término, o Newman exibirá um sumário com os resultados:

```
| iterations  |  1  |  0  |
| requests    | 22  |  0  |
| assertions  | 40  |  0  |
```

---

## 4. Geração e Análise do Relatório

A execução do comando anterior gera automaticamente o arquivo `reports/relatorio.html`, contendo:

- Sumário estatístico da execução
- Detalhamento de cada requisição (método HTTP, URL, código de status, tempo de resposta)
- Resultado individual de cada asserção
- Métricas de desempenho (tempo médio, mínimo e máximo)

O relatório pode ser visualizado em qualquer navegador. No macOS, o comando `open reports/relatorio.html` abre o arquivo diretamente.

---

## 5. Estrutura Entregue

A entrega contempla:

| Artefato | Localização |
|---|---|
| Código-fonte da API | `server.js`, `database.js`, `routes/` |
| Configuração do projeto | `package.json` |
| Coleção de testes | `tests/collection.postman_collection.json` |
| Environment de testes | `tests/environment.postman_environment.json` |
| Relatório de execução | `reports/relatorio.html` |
| Documentação técnica | `DOCUMENTACAO.md` |
| Manual de execução | `MANUAL.md` |

---

## Execução Manual via Postman (opcional)

A coleção pode também ser executada pela interface gráfica do Postman:

1. Acessar o Postman (desktop ou web)
2. Menu **Import** — selecionar `tests/collection.postman_collection.json`
3. Menu **Import** — selecionar `tests/environment.postman_environment.json`
4. Selecionar o environment "Local - Projeto Integrador" no canto superior direito
5. Executar requisições individualmente, ou via **Run collection** para execução em lote

---

## Resolução de Problemas

**Porta 3000 em uso:**
```bash
lsof -i :3000
kill -9 <PID>
```

**Testes retornam ECONNREFUSED:**
Verificar se a aplicação foi iniciada conforme item 2 deste manual e se a mensagem "API rodando em http://localhost:3000" é exibida.

**Redefinição da base de dados:**
Remover o arquivo `database.json` na raiz do projeto. Ele será recriado vazio na próxima execução.

---

## Mapeamento dos Conceitos de Engenharia de Software

| Conceito | Implementação |
|---|---|
| Arquitetura em camadas | `server.js` (apresentação) — `routes/` (controle) — `database.js` (persistência) |
| Single Responsibility Principle | Cada módulo de rota encapsula uma única entidade |
| Validação de entrada | Verificação de campos obrigatórios e tipos em todas as rotas POST e PUT |
| Tratamento de códigos HTTP | Utilização semântica dos códigos 200, 201, 204, 400, 409 e 500 |
| Integridade referencial | Validação de chaves estrangeiras e cascata em operações DELETE |
| Testes automatizados | Coleção Postman com 40 asserções funcionais e de integração |
| Automação CI/CD | Execução via linha de comando (`npm test`), compatível com pipelines |
| Documentação | Endpoint raiz autodescritivo, MANUAL.md e DOCUMENTACAO.md |
| Relatório de qualidade | Geração automatizada via newman-reporter-htmlextra |

---

## Referência

GROFFE, R. *Automatizando testes de APIs REST com Postman + Newman*. Medium, 2020. Disponível em: https://renatogroffe.medium.com/automatizando-testes-de-apis-rest-com-postman-newman-a90f0d90df09

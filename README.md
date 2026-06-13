# API Projeto Integrador

API REST em Node.js + Express com testes automatizados via Postman + Newman.
Trabalho da disciplina de Engenharia de Software.

## 🚀 Como rodar

```bash
npm install
npm start       # Terminal 1 - inicia a API
npm test        # Terminal 2 - roda os testes e gera relatório
```

Veja o **MANUAL.md** para instruções detalhadas e a **DOCUMENTACAO.md** para a documentação técnica completa.

## 📂 Estrutura

```
api-projeto-integrador/
├── server.js                      # Entry point - Express + middlewares
├── database.js                    # Camada de persistência (Repository)
├── routes/
│   ├── usuarios.js                # CRUD de usuários
│   ├── projetos.js                # CRUD de projetos
│   ├── etapas.js                  # CRUD de etapas
│   ├── tarefas.js                 # CRUD de tarefas
│   └── entregas.js                # CRUD de entregas
├── tests/
│   ├── collection.postman_collection.json     # Collection Postman
│   └── environment.postman_environment.json   # Environment Postman
├── reports/
│   └── relatorio.html             # Gerado por `npm test`
├── package.json
├── MANUAL.md                      # 👈 Guia passo a passo
├── DOCUMENTACAO.md                # 👈 Documentação técnica
└── README.md                      # Este arquivo
```

## 🧪 Testes

- 22 requisições executadas em ~500ms
- 40 assertions, 100% passando
- Relatório HTML detalhado em `reports/relatorio.html`

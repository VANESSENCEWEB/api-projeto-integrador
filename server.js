const express = require('express');
const cors = require('cors');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Log simples de requisições (útil pra ver no terminal o que tá chegando)
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Rota raiz - health check
app.get('/', (req, res) => {
  res.json({
    api: 'Projeto Integrador',
    versao: '1.0.0',
    status: 'online',
    endpoints: [
      'GET    /usuarios',
      'POST   /usuarios',
      'GET    /usuarios/:id',
      'PUT    /usuarios/:id',
      'DELETE /usuarios/:id',
      'GET    /projetos',
      'POST   /projetos',
      'GET    /projetos/:id',
      'PUT    /projetos/:id',
      'DELETE /projetos/:id',
      'GET    /etapas',
      'POST   /etapas',
      'GET    /etapas/:id',
      'PUT    /etapas/:id',
      'DELETE /etapas/:id',
      'GET    /tarefas',
      'POST   /tarefas',
      'GET    /tarefas/:id',
      'PUT    /tarefas/:id',
      'DELETE /tarefas/:id',
      'GET    /entregas',
      'POST   /entregas',
      'GET    /entregas/:id',
      'PUT    /entregas/:id',
      'DELETE /entregas/:id'
    ]
  });
});

// Rotas das entidades
app.use('/usuarios', require('./routes/usuarios'));
app.use('/projetos', require('./routes/projetos'));
app.use('/etapas', require('./routes/etapas'));
app.use('/tarefas', require('./routes/tarefas'));
app.use('/entregas', require('./routes/entregas'));

// Tratamento de rota inexistente
app.use((req, res) => {
  res.status(404).json({ erro: 'Rota não encontrada' });
});

// Tratamento global de erros
app.use((err, req, res, next) => {
  console.error('❌ Erro:', err.message);
  res.status(500).json({ erro: 'Erro interno do servidor', detalhes: err.message });
});

app.listen(PORT, () => {
  console.log(`\n🚀 API rodando em http://localhost:${PORT}`);
  console.log(`📋 Documentação na rota GET /\n`);
});

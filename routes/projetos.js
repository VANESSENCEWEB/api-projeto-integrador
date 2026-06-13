const express = require('express');
const router = express.Router();
const db = require('../database');

const STATUS_VALIDOS = ['planejado', 'em_andamento', 'concluido', 'cancelado'];

const enriquecer = (projeto) => {
  if (!projeto) return null;
  const usuario = db.findById('usuarios', projeto.usuario_id);
  return { ...projeto, responsavel: usuario ? usuario.nome : null };
};

// GET /projetos
router.get('/', (req, res) => {
  res.json(db.findAll('projetos').map(enriquecer));
});

// GET /projetos/:id
router.get('/:id', (req, res) => {
  const projeto = db.findById('projetos', req.params.id);
  if (!projeto) return res.status(404).json({ erro: 'Projeto não encontrado' });
  res.json(enriquecer(projeto));
});

// POST /projetos
router.post('/', (req, res) => {
  const { titulo, descricao, status, usuario_id } = req.body;

  if (!titulo || !usuario_id) {
    return res.status(400).json({ erro: 'Campos obrigatórios: titulo, usuario_id' });
  }

  if (!db.findById('usuarios', usuario_id)) {
    return res.status(400).json({ erro: 'usuario_id não existe' });
  }

  if (status && !STATUS_VALIDOS.includes(status)) {
    return res.status(400).json({ erro: `Status inválido. Use: ${STATUS_VALIDOS.join(', ')}` });
  }

  const novo = db.insert('projetos', {
    titulo,
    descricao: descricao || null,
    status: status || 'em_andamento',
    usuario_id: parseInt(usuario_id, 10)
  });
  res.status(201).json(novo);
});

// PUT /projetos/:id
router.put('/:id', (req, res) => {
  const projeto = db.findById('projetos', req.params.id);
  if (!projeto) return res.status(404).json({ erro: 'Projeto não encontrado' });

  const { titulo, descricao, status, usuario_id } = req.body;

  if (status && !STATUS_VALIDOS.includes(status)) {
    return res.status(400).json({ erro: `Status inválido. Use: ${STATUS_VALIDOS.join(', ')}` });
  }

  const atualizado = db.update('projetos', req.params.id, {
    titulo: titulo ?? projeto.titulo,
    descricao: descricao !== undefined ? descricao : projeto.descricao,
    status: status ?? projeto.status,
    usuario_id: usuario_id ? parseInt(usuario_id, 10) : projeto.usuario_id
  });
  res.json(atualizado);
});

// DELETE /projetos/:id
router.delete('/:id', (req, res) => {
  const removido = db.delete('projetos', req.params.id);
  if (!removido) return res.status(404).json({ erro: 'Projeto não encontrado' });
  res.status(204).send();
});

module.exports = router;

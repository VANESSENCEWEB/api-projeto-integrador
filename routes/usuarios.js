const express = require('express');
const router = express.Router();
const db = require('../database');

// Remove senha do retorno
const semSenha = (u) => {
  if (!u) return null;
  const { senha, ...rest } = u;
  return rest;
};

// GET /usuarios - lista todos
router.get('/', (req, res) => {
  res.json(db.findAll('usuarios').map(semSenha));
});

// GET /usuarios/:id
router.get('/:id', (req, res) => {
  const usuario = db.findById('usuarios', req.params.id);
  if (!usuario) return res.status(404).json({ erro: 'Usuário não encontrado' });
  res.json(semSenha(usuario));
});

// POST /usuarios
router.post('/', (req, res) => {
  const { nome, email, senha, tipo } = req.body;

  if (!nome || !email || !senha || !tipo) {
    return res.status(400).json({ erro: 'Campos obrigatórios: nome, email, senha, tipo' });
  }

  if (!['aluno', 'professor', 'coordenador'].includes(tipo)) {
    return res.status(400).json({ erro: 'Tipo inválido. Use: aluno, professor ou coordenador' });
  }

  if (db.findBy('usuarios', 'email', email)) {
    return res.status(409).json({ erro: 'Email já cadastrado' });
  }

  const novo = db.insert('usuarios', { nome, email, senha, tipo });
  res.status(201).json(semSenha(novo));
});

// PUT /usuarios/:id
router.put('/:id', (req, res) => {
  const usuario = db.findById('usuarios', req.params.id);
  if (!usuario) return res.status(404).json({ erro: 'Usuário não encontrado' });

  const { nome, email, tipo } = req.body;
  const atualizado = db.update('usuarios', req.params.id, {
    nome: nome ?? usuario.nome,
    email: email ?? usuario.email,
    tipo: tipo ?? usuario.tipo
  });
  res.json(semSenha(atualizado));
});

// DELETE /usuarios/:id
router.delete('/:id', (req, res) => {
  const removido = db.delete('usuarios', req.params.id);
  if (!removido) return res.status(404).json({ erro: 'Usuário não encontrado' });
  res.status(204).send();
});

module.exports = router;

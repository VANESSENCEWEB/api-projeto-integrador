const express = require('express');
const router = express.Router();
const db = require('../database');

const STATUS_VALIDOS = ['pendente', 'em_andamento', 'concluida'];

const enriquecer = (tarefa) => {
  if (!tarefa) return null;
  const responsavel = tarefa.responsavel_id ? db.findById('usuarios', tarefa.responsavel_id) : null;
  return { ...tarefa, responsavel_nome: responsavel ? responsavel.nome : null };
};

router.get('/', (req, res) => {
  res.json(db.findAll('tarefas').map(enriquecer));
});

router.get('/:id', (req, res) => {
  const tarefa = db.findById('tarefas', req.params.id);
  if (!tarefa) return res.status(404).json({ erro: 'Tarefa não encontrada' });
  res.json(enriquecer(tarefa));
});

router.post('/', (req, res) => {
  const { etapa_id, titulo, descricao, status, responsavel_id } = req.body;

  if (!etapa_id || !titulo) {
    return res.status(400).json({ erro: 'Campos obrigatórios: etapa_id, titulo' });
  }

  if (!db.findById('etapas', etapa_id)) {
    return res.status(400).json({ erro: 'etapa_id não existe' });
  }

  if (responsavel_id && !db.findById('usuarios', responsavel_id)) {
    return res.status(400).json({ erro: 'responsavel_id não existe' });
  }

  if (status && !STATUS_VALIDOS.includes(status)) {
    return res.status(400).json({ erro: `Status inválido. Use: ${STATUS_VALIDOS.join(', ')}` });
  }

  const nova = db.insert('tarefas', {
    etapa_id: parseInt(etapa_id, 10),
    titulo,
    descricao: descricao || null,
    status: status || 'pendente',
    responsavel_id: responsavel_id ? parseInt(responsavel_id, 10) : null
  });
  res.status(201).json(nova);
});

router.put('/:id', (req, res) => {
  const tarefa = db.findById('tarefas', req.params.id);
  if (!tarefa) return res.status(404).json({ erro: 'Tarefa não encontrada' });

  const { titulo, descricao, status, responsavel_id } = req.body;

  if (status && !STATUS_VALIDOS.includes(status)) {
    return res.status(400).json({ erro: `Status inválido. Use: ${STATUS_VALIDOS.join(', ')}` });
  }

  const atualizada = db.update('tarefas', req.params.id, {
    titulo: titulo ?? tarefa.titulo,
    descricao: descricao !== undefined ? descricao : tarefa.descricao,
    status: status ?? tarefa.status,
    responsavel_id: responsavel_id !== undefined ? (responsavel_id ? parseInt(responsavel_id, 10) : null) : tarefa.responsavel_id
  });
  res.json(atualizada);
});

router.delete('/:id', (req, res) => {
  const removido = db.delete('tarefas', req.params.id);
  if (!removido) return res.status(404).json({ erro: 'Tarefa não encontrada' });
  res.status(204).send();
});

module.exports = router;

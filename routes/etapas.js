const express = require('express');
const router = express.Router();
const db = require('../database');

const STATUS_VALIDOS = ['pendente', 'em_andamento', 'concluida'];

router.get('/', (req, res) => {
  const etapas = db.findAll('etapas').sort((a, b) => {
    if (a.projeto_id !== b.projeto_id) return a.projeto_id - b.projeto_id;
    return a.ordem - b.ordem;
  });
  res.json(etapas);
});

router.get('/:id', (req, res) => {
  const etapa = db.findById('etapas', req.params.id);
  if (!etapa) return res.status(404).json({ erro: 'Etapa não encontrada' });
  res.json(etapa);
});

router.post('/', (req, res) => {
  const { projeto_id, titulo, ordem, status, prazo } = req.body;

  if (!projeto_id || !titulo) {
    return res.status(400).json({ erro: 'Campos obrigatórios: projeto_id, titulo' });
  }

  if (!db.findById('projetos', projeto_id)) {
    return res.status(400).json({ erro: 'projeto_id não existe' });
  }

  if (status && !STATUS_VALIDOS.includes(status)) {
    return res.status(400).json({ erro: `Status inválido. Use: ${STATUS_VALIDOS.join(', ')}` });
  }

  const nova = db.insert('etapas', {
    projeto_id: parseInt(projeto_id, 10),
    titulo,
    ordem: ordem || 1,
    status: status || 'pendente',
    prazo: prazo || null
  });
  res.status(201).json(nova);
});

router.put('/:id', (req, res) => {
  const etapa = db.findById('etapas', req.params.id);
  if (!etapa) return res.status(404).json({ erro: 'Etapa não encontrada' });

  const { titulo, ordem, status, prazo } = req.body;

  if (status && !STATUS_VALIDOS.includes(status)) {
    return res.status(400).json({ erro: `Status inválido. Use: ${STATUS_VALIDOS.join(', ')}` });
  }

  const atualizada = db.update('etapas', req.params.id, {
    titulo: titulo ?? etapa.titulo,
    ordem: ordem !== undefined ? ordem : etapa.ordem,
    status: status ?? etapa.status,
    prazo: prazo !== undefined ? prazo : etapa.prazo
  });
  res.json(atualizada);
});

router.delete('/:id', (req, res) => {
  const removido = db.delete('etapas', req.params.id);
  if (!removido) return res.status(404).json({ erro: 'Etapa não encontrada' });
  res.status(204).send();
});

module.exports = router;

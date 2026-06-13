const express = require('express');
const router = express.Router();
const db = require('../database');

const STATUS_VALIDOS = ['pendente', 'entregue', 'avaliada'];

router.get('/', (req, res) => {
  const entregas = db.findAll('entregas').sort((a, b) => {
    return (a.data_entrega || '').localeCompare(b.data_entrega || '');
  });
  res.json(entregas);
});

router.get('/:id', (req, res) => {
  const entrega = db.findById('entregas', req.params.id);
  if (!entrega) return res.status(404).json({ erro: 'Entrega não encontrada' });
  res.json(entrega);
});

router.post('/', (req, res) => {
  const { projeto_id, titulo, descricao, arquivo_url, data_entrega, status, nota } = req.body;

  if (!projeto_id || !titulo || !data_entrega) {
    return res.status(400).json({ erro: 'Campos obrigatórios: projeto_id, titulo, data_entrega' });
  }

  if (!db.findById('projetos', projeto_id)) {
    return res.status(400).json({ erro: 'projeto_id não existe' });
  }

  if (status && !STATUS_VALIDOS.includes(status)) {
    return res.status(400).json({ erro: `Status inválido. Use: ${STATUS_VALIDOS.join(', ')}` });
  }

  const nova = db.insert('entregas', {
    projeto_id: parseInt(projeto_id, 10),
    titulo,
    descricao: descricao || null,
    arquivo_url: arquivo_url || null,
    data_entrega,
    status: status || 'pendente',
    nota: nota !== undefined ? nota : null
  });
  res.status(201).json(nova);
});

router.put('/:id', (req, res) => {
  const entrega = db.findById('entregas', req.params.id);
  if (!entrega) return res.status(404).json({ erro: 'Entrega não encontrada' });

  const { titulo, descricao, arquivo_url, data_entrega, status, nota } = req.body;

  if (status && !STATUS_VALIDOS.includes(status)) {
    return res.status(400).json({ erro: `Status inválido. Use: ${STATUS_VALIDOS.join(', ')}` });
  }

  const atualizada = db.update('entregas', req.params.id, {
    titulo: titulo ?? entrega.titulo,
    descricao: descricao !== undefined ? descricao : entrega.descricao,
    arquivo_url: arquivo_url !== undefined ? arquivo_url : entrega.arquivo_url,
    data_entrega: data_entrega ?? entrega.data_entrega,
    status: status ?? entrega.status,
    nota: nota !== undefined ? nota : entrega.nota
  });
  res.json(atualizada);
});

router.delete('/:id', (req, res) => {
  const removido = db.delete('entregas', req.params.id);
  if (!removido) return res.status(404).json({ erro: 'Entrega não encontrada' });
  res.status(204).send();
});

module.exports = router;

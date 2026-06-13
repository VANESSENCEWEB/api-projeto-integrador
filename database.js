/**
 * Camada de Persistência - Repository Pattern
 *
 * Usa arquivo JSON local para persistir os dados.
 * Vantagens: zero dependências nativas, portátil, simples.
 * Em produção poderia ser substituído por PostgreSQL/MySQL/MongoDB
 * mantendo a mesma interface pública.
 */

const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, 'database.json');

// Estrutura inicial do banco
const SCHEMA_INICIAL = {
  usuarios: [],
  projetos: [],
  etapas: [],
  tarefas: [],
  entregas: [],
  _seq: { usuarios: 0, projetos: 0, etapas: 0, tarefas: 0, entregas: 0 }
};

// Carrega ou cria o arquivo de banco
function carregar() {
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(SCHEMA_INICIAL, null, 2));
    return JSON.parse(JSON.stringify(SCHEMA_INICIAL));
  }
  return JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
}

let dados = carregar();

function salvar() {
  fs.writeFileSync(DB_FILE, JSON.stringify(dados, null, 2));
}

const db = {
  findAll(tabela) {
    return [...dados[tabela]];
  },

  findById(tabela, id) {
    const idNum = parseInt(id, 10);
    return dados[tabela].find(r => r.id === idNum) || null;
  },

  findBy(tabela, campo, valor) {
    return dados[tabela].find(r => r[campo] === valor) || null;
  },

  insert(tabela, registro) {
    dados._seq[tabela] = (dados._seq[tabela] || 0) + 1;
    const novo = {
      id: dados._seq[tabela],
      ...registro,
      created_at: new Date().toISOString()
    };
    dados[tabela].push(novo);
    salvar();
    return novo;
  },

  update(tabela, id, atualizacoes) {
    const idNum = parseInt(id, 10);
    const idx = dados[tabela].findIndex(r => r.id === idNum);
    if (idx === -1) return null;
    dados[tabela][idx] = { ...dados[tabela][idx], ...atualizacoes };
    salvar();
    return dados[tabela][idx];
  },

  delete(tabela, id) {
    const idNum = parseInt(id, 10);
    const idx = dados[tabela].findIndex(r => r.id === idNum);
    if (idx === -1) return false;
    dados[tabela].splice(idx, 1);

    // Cascata manual (ON DELETE CASCADE)
    if (tabela === 'usuarios') {
      dados.projetos = dados.projetos.filter(p => p.usuario_id !== idNum);
      dados.tarefas.forEach(t => { if (t.responsavel_id === idNum) t.responsavel_id = null; });
    }
    if (tabela === 'projetos') {
      const etapasDoProjeto = dados.etapas.filter(e => e.projeto_id === idNum).map(e => e.id);
      dados.etapas = dados.etapas.filter(e => e.projeto_id !== idNum);
      dados.tarefas = dados.tarefas.filter(t => !etapasDoProjeto.includes(t.etapa_id));
      dados.entregas = dados.entregas.filter(en => en.projeto_id !== idNum);
    }
    if (tabela === 'etapas') {
      dados.tarefas = dados.tarefas.filter(t => t.etapa_id !== idNum);
    }

    salvar();
    return true;
  }
};

console.log('Banco JSON inicializado:', DB_FILE);

module.exports = db;

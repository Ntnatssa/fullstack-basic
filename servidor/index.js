const express = require("express");
const cors = require("cors");
const Database = require("better-sqlite3");

const app = express();
const PORT = 3001;

//Inicializa o banco de dados (o arquivo será criado automaticamente)
const db = new Database("database.db");

//Cria a tabela de projetos caso ela ainda não exista
db.exec(`
    CREATE TABLE IF NOT EXISTS projetos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        valor REAL NOT NULL
    )
`);

// Libere requisicoes vindas do frontend Vite
app.use(cors());
app.use(express.json());

// Rota GET: busca todos os projetos salvos no banco SQLite
app.get("/api/projetos", (req, res) => {
  const statement = db.prepare("SELECT * FROM projetos ORDER BY id DESC");
  const projetos = statement.all();
  res.json(projetos);
});

// Rota POST: insere um novo projeto no banco de dados
app.post("/api/projetos", (req, res) => {
  const { nome, valor } = req.body;

  const statement = db.prepare(
    "INSERT INTO projetos (nome, valor) VALUES (?, ?)",
  );
  const resultado = statement.run(nome, Number(valor) || 0);

  // Retorna o item inserido com o ID gerado pelo SQLite
  res.status(201).json({
    id: resultado.lastInsertRowid,
    nome,
    valor: Number(valor) || 0,
  });
});

// Rota PUT: atualiza o nome e o valor de um projeto existente
app.put("/api/projetos/:id", (req, res) => {
  const { id } = req.params;
  const { nome, valor } = req.body;

  const statement = db.prepare(
    "UPDATE projetos SET nome = ?, valor = ? WHERE id = ?",
  );
  const resultado = statement.run(nome, Number(valor) || 0, id);

  if (resultado.changes > 0) {
    res.json({ id: Number(id), nome, valor: Number(valor) || 0 });
  } else {
    res.status(404).json({ erro: "Projeto não encontrado" });
  }
});

app.delete("/api/projetos/:id", (req, res) => {
  const { id } = req.params;
  const statement = db.prepare("DELETE FROM projetos WHERE id = ?");
  const resultado = statement.run(id);
  if (resultado.changes > 0) {
    res.json({ mensagem: "Projeto removido com sucesso", id: Number(id) });
  } else {
    res.status(404).json({ erro: "Projeto não encontrado" });
  }
});

// Rota de status do sistema
app.get("/api/status", (req, res) => {
  res.json({
    servidorAtivo: true,
    localizacaoAlvo: "Home-Office",
    projetosConcluidos: 3,
    mensagem: "Backend conectado com sucesso ao frontend!",
  });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});

const fs = require("fs");
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

const app = express();
const PORT = 5000;
const DATA_FILE = path.join(__dirname, "clientes.json");

app.use(cors());
app.use(bodyParser.json());
app.use(express.json()); // Garante que o Express pode ler JSON no corpo da requisição

// ✅ Função para ler dados do arquivo JSON
function lerDados() {
  if (!fs.existsSync(DATA_FILE)) {
    return [];
  }
  const dados = fs.readFileSync(DATA_FILE);
  return JSON.parse(dados);
}

// ✅ Função para salvar dados no arquivo JSON
function salvarDados(dados) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(dados, null, 2));
}

// ✅ Rota para obter todos os registros
app.get("/api/data", (req, res) => {
  console.log("📥 Requisição recebida em /api/data");
  const clients = lerDados();
  res.status(200).json(clients);
});

// ✅ Rota para adicionar novos registros

app.post("/api/submit", (req, res) => {
  try {
    console.log("📥 Recebendo dados para salvar:", req.body);

    if (!req.body.clients || !Array.isArray(req.body.clients)) {
      return res
        .status(400)
        .json({ message: "Formato inválido. Esperado um array de clientes." });
    }

    let clients = lerDados(); // Lê os dados atuais do arquivo JSON

    // ✅ NÃO filtra por clientId, apenas adiciona um ID único para cada registro
    const newClients = req.body.clients.map((client) => ({
      ...client,
      id: uuidv4(), // Garante que cada entrada tem um ID único
    }));

    clients.push(...newClients); // Adiciona os novos registros
    salvarDados(clients);

    console.log("✅ Registros salvos com sucesso!", newClients);
    res.json({ message: "Registros salvos com sucesso!", added: newClients });
  } catch (error) {
    console.error("❌ Erro ao salvar registros:", error);
    res.status(500).json({
      message: "Erro interno ao salvar registros.",
      error: error.toString(),
    });
  }
});

// ✅ Rota para atualizar registros
app.put("/api/update/:clientId", (req, res) => {
  const { clientId } = req.params;
  const updatedData = req.body;
  console.log("📥 Atualização do registro:", clientId);

  let clients = lerDados();
  let found = false;

  clients = clients.map((client) => {
    if (client.clientId === clientId) {
      found = true;
      return { ...client, ...updatedData };
    }
    return client;
  });

  if (found) {
    salvarDados(clients);
    res.status(200).json({ message: "✅ Registro atualizado com sucesso." });
  } else {
    res.status(404).json({ message: "⚠️ Registro não encontrado." });
  }
});

// ✅ Rota para excluir registros
app.use(express.json()); // Garante que o Express pode ler JSON no corpo da requisição

app.delete("/api/delete/:id", (req, res) => {
  try {
    const { id } = req.params;
    console.log("🛠️ Tentando excluir o registro com ID:", id);

    if (!id) {
      return res.status(400).json({ message: "ID não fornecido." });
    }

    let clients = lerDados();

    // Verifica se há registros antes de excluir
    if (!Array.isArray(clients) || clients.length === 0) {
      return res
        .status(500)
        .json({ message: "Banco de dados está vazio ou corrompido." });
    }

    const index = clients.findIndex((client) => client.id === id);

    if (index === -1) {
      return res
        .status(404)
        .json({ message: "Registro não encontrado para exclusão." });
    }

    // Remove o registro da lista
    clients.splice(index, 1);

    // Salva os dados atualizados
    salvarDados(clients);

    console.log(`✅ Registro ${id} excluído com sucesso!`);
    res.json({ message: "Registro excluído com sucesso!" });
  } catch (error) {
    console.error("❌ Erro ao excluir registro:", error);
    res.status(500).json({
      message: "Erro interno ao excluir registro.",
      error: error.toString(),
    });
  }
});

// ✅ Servir o Frontend (React)
app.use(express.static(path.join(__dirname, "../my-app/build")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../my-app/build", "index.html"));
});

// ✅ Iniciar o servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando localmente em http://localhost:${PORT}`);
});

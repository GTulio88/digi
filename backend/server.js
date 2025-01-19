const express = require("express");
const cors = require("cors");
const app = express();
const bodyParser = require("body-parser");

app.use(cors()); // Permite requisições de qualquer origem
app.use(bodyParser.json());

let dataStore = [
  {
    date: "2025-01-01",
    hoursWorked: 8,
    clientId: "123",
    clientAddress: "Rua A, 123",
    serviceType: "Instalação",
    status: "OK",
    notes: "Sem problemas.",
  },
];

// Endpoint para buscar dados
app.get("/api/data", (req, res) => {
  res.status(200).json(dataStore);
});

// Endpoint para salvar dados
app.post("/api/submit", (req, res) => {
  const { clients } = req.body;

  if (!Array.isArray(clients)) {
    return res.status(400).json({ error: "Formato de dados inválido" });
  }

  dataStore = [...dataStore, ...clients];
  res.status(200).json({ message: "Dados salvos com sucesso" });
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

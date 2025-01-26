const express = require("express");
const cors = require("cors");
const app = express();
const bodyParser = require("body-parser");

app.use(cors()); // Permite requisições de qualquer origem
app.use(bodyParser.json()); // Middleware para interpretar JSON no corpo das requisições

// Banco de dados em memória
let dataStore = [
  {
    date: "2025-01-01",
    hoursWorked: 8,
    clientId: "1234567",
    clientAddress: "Via Nizza, 123",
    serviceType: "instalacao",
    status: "ok",
    notes: "Sem problemas.",
  },
  {
    date: "2024-02-12",
    hoursWorked: 10,
    clientId: "4035168",
    clientAddress: "Viaduto Nascimento, 31",
    serviceType: "instalacao",
    status: "ok",
    notes: "Concluído com sucesso.",
  },
  // ... outros objetos
];

// Endpoint para buscar todos os dados
app.get("/api/data", (req, res) => {
  res.status(200).json(dataStore);
});

// Endpoint para salvar novos dados
app.post("/api/submit", (req, res) => {
  const { clients } = req.body;

  if (!Array.isArray(clients)) {
    return res.status(400).json({ error: "Formato de dados inválido" });
  }

  dataStore = [...dataStore, ...clients];
  res.status(200).json({ message: "Dados salvos com sucesso" });
});
app.delete("/api/delete/:clientId", (req, res) => {
  const { clientId } = req.params;

  // Log para verificar o valor do clientId recebido
  console.log("Client ID recebido:", clientId);

  const index = dataStore.findIndex((item) => item.clientId === clientId);
  if (index !== -1) {
    dataStore.splice(index, 1); // Remove o item do array
    res.status(200).json({ message: "Registro excluído com sucesso." });
  } else {
    res.status(404).json({ message: "Registro não encontrado." });
  }
});

// Endpoint para atualizar um registro pelo clientId
app.put("/api/update/:clientId", (req, res) => {
  const { clientId } = req.params; // ID original do registro
  const updatedData = req.body; // Dados atualizados, incluindo um novo clientId

  const index = dataStore.findIndex((item) => item.clientId === clientId);
  if (index !== -1) {
    // Permite atualizar o clientId
    dataStore[index] = { ...dataStore[index], ...updatedData };
    res.status(200).json({
      message: "Registro atualizado com sucesso.",
      data: dataStore[index],
    });
  } else {
    res.status(404).json({ message: "Registro não encontrado." });
  }
});
// Inicia o servidor na porta especificada
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { Pool } = require("pg");
require("dotenv").config();

const app = express();

// Configurações para o PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // URL do banco no Render
  ssl: { rejectUnauthorized: false }, // Necessário para conexões seguras
});

// Testa a conexão com o banco de dados
pool.connect((err) => {
  if (err) {
    console.error("Erro ao conectar ao PostgreSQL:", err);
  } else {
    console.log("Conectado ao PostgreSQL!");
  }
});

app.use(
  cors({
    origin: "https://digi-uckg.onrender.com/", // Substitua pela URL do frontend
  })
);

app.use(bodyParser.json()); // Middleware para interpretar JSON no corpo das requisições

// Endpoint para buscar todos os dados
app.get("/api/data", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM clients");
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Erro ao buscar dados:", error);
    res.status(500).json({ error: "Erro ao buscar dados" });
  }
});

// Endpoint para salvar novos dados
app.post("/api/submit", async (req, res) => {
  const { clients } = req.body;

  if (!Array.isArray(clients)) {
    return res.status(400).json({ error: "Formato de dados inválido" });
  }

  try {
    for (const client of clients) {
      await pool.query(
        `INSERT INTO clients (date, hoursWorked, clientId, clientAddress, serviceType, status, notes)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          client.date,
          client.hoursWorked,
          client.clientId,
          client.clientAddress,
          client.serviceType,
          client.status,
          client.notes,
        ]
      );
    }
    res.status(200).json({ message: "Dados salvos com sucesso" });
  } catch (error) {
    console.error("Erro ao salvar dados:", error);
    res.status(500).json({ error: "Erro ao salvar dados" });
  }
});

// Endpoint para excluir um registro pelo clientId
app.delete("/api/delete/:clientId", async (req, res) => {
  const { clientId } = req.params;

  try {
    const result = await pool.query("DELETE FROM clients WHERE clientId = $1", [
      clientId,
    ]);

    if (result.rowCount > 0) {
      res.status(200).json({ message: "Registro excluído com sucesso." });
    } else {
      res.status(404).json({ message: "Registro não encontrado." });
    }
  } catch (error) {
    console.error("Erro ao excluir registro:", error);
    res.status(500).json({ error: "Erro ao excluir registro" });
  }
});

// Endpoint para atualizar um registro pelo clientId
app.put("/api/update/:clientId", async (req, res) => {
  const { clientId } = req.params;
  const updatedData = req.body;

  try {
    const result = await pool.query(
      `UPDATE clients
       SET date = $1, hoursWorked = $2, clientAddress = $3, serviceType = $4, status = $5, notes = $6
       WHERE clientId = $7`,
      [
        updatedData.date,
        updatedData.hoursWorked,
        updatedData.clientAddress,
        updatedData.serviceType,
        updatedData.status,
        updatedData.notes,
        clientId,
      ]
    );

    if (result.rowCount > 0) {
      res.status(200).json({ message: "Registro atualizado com sucesso." });
    } else {
      res.status(404).json({ message: "Registro não encontrado." });
    }
  } catch (error) {
    console.error("Erro ao atualizar registro:", error);
    res.status(500).json({ error: "Erro ao atualizar registro" });
  }
});

// Inicia o servidor na porta especificada
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

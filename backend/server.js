require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const path = require("path");

const app = express();

// Conexão com o MongoDB Atlas
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ Conectado ao MongoDB Atlas!"))
  .catch((err) => console.error("❌ Erro ao conectar ao MongoDB:", err));

app.use(
  cors({
    origin: [
      "https://digi-uckg.onrender.com",
      "http://localhost:5173",
      "https://digi-delta-sooty.vercel.app",
    ],
  })
);
app.use(bodyParser.json());

// ✅ ROTAS DA API (antes do frontend)
app.get("/api/data", async (req, res) => {
  try {
    const clients = await Client.find();
    res.status(200).json(clients);
  } catch (error) {
    console.error("Erro ao buscar dados:", error);
    res.status(500).json({ error: "Erro ao buscar dados" });
  }
});

app.post("/api/submit", async (req, res) => {
  const { clients } = req.body;

  if (!Array.isArray(clients)) {
    return res.status(400).json({ error: "Formato de dados inválido" });
  }

  try {
    await Client.insertMany(clients);
    res.status(200).json({ message: "Dados salvos com sucesso" });
  } catch (error) {
    console.error("Erro ao salvar dados:", error);
    res.status(500).json({ error: "Erro ao salvar dados" });
  }
});

// ✅ Servir o frontend somente após definir as rotas da API
app.use(express.static(path.join(__dirname, "frontend")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "index.html"));
});

// Iniciar o servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

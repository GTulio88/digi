require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const path = require("path");
const Client = require("./Client");

const app = express();

// Conexão com o MongoDB Atlas
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ Conectado ao MongoDB Atlas!"))
  .catch((err) => console.error("❌ Erro ao conectar ao MongoDB:", err));

app.use(cors());
app.use(bodyParser.json());

// Rotas da API
app.get("/api/data", async (req, res) => {
  try {
    const clients = await Client.find();
    res.status(200).json(clients);
  } catch (error) {
    console.error("❌ Erro ao buscar dados:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post("/api/submit", async (req, res) => {
  try {
    console.log("📥 Dados recebidos do frontend:", req.body); // Verificar os dados recebidos

    const { clients } = req.body;

    if (!Array.isArray(clients)) {
      throw new Error("O formato de dados enviado não é um array de clientes.");
    }

    const savedClients = await Client.insertMany(clients);
    res
      .status(201)
      .json({ message: "Dados salvos com sucesso!", data: savedClients });
  } catch (error) {
    console.error("❌ Erro ao salvar dados:", error);

    res.status(500).json({
      success: false,
      message: error.message,
      stack: error.stack,
    });
  }
});

app.use(express.static(path.join(__dirname, "../my-app/build")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../my-app/build", "index.html"));
});

// Iniciar o Servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});

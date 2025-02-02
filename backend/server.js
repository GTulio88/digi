require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const path = require("path");

const app = express();

// ✅ Conexão com o MongoDB Atlas
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

// ✅ Middleware para rastrear requisições
app.use((req, res, next) => {
  console.log(`📥 Requisição recebida: ${req.method} ${req.url}`);
  next();
});

// ✅ ROTAS DA API
app.get("/api/data", async (req, res) => {
  try {
    console.log("📥 Requisição para /api/data recebida");
    const clients = await Client.find();
    res.status(200).json(clients);
  } catch (error) {
    console.error("❌ Erro ao buscar dados:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno ao buscar dados",
      error: error.message, // Mostra a mensagem do erro
      stack: error.stack, // Mostra o stack trace do erro
    });
  }
});

app.post("/api/submit", (req, res) => {
  console.log("✅ Endpoint /api/submit acessado");
  res.status(200).json({ message: "Dados recebidos com sucesso!" });
});

// ✅ Servir o frontend após as rotas da API
app.use(express.static(path.join(__dirname, "../my-app"))); // Certifique-se que o build está na pasta correta

// 🚨 Captura de todas as outras rotas (apenas se não for API)
app.get("*", (req, res) => {
  console.log("🚨 Redirecionamento para o index.html");
  res.sendFile(path.join(__dirname, "../my-app", "index.html"));
});

// ✅ Iniciar o servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});

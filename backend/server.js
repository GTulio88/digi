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
app.get("/api/data", (req, res) => {
  console.log("✅ Endpoint /api/data acessado");
  res.status(200).json({ message: "API funcionando!" });
});

app.post("/api/submit", (req, res) => {
  console.log("✅ Endpoint /api/submit acessado");
  res.status(200).json({ message: "Dados recebidos com sucesso!" });
});

// ✅ Servir o frontend após as rotas da API
app.use(express.static(path.join(__dirname, "frontend"))); // Certifique-se que o build está na pasta correta

// 🚨 Captura de todas as outras rotas (apenas se não for API)
app.get("*", (req, res) => {
  console.log("🚨 Redirecionamento para o index.html");
  res.sendFile(path.join(__dirname, "frontend", "index.html"));
});

// ✅ Iniciar o servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});

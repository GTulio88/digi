require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const path = require("path");
const Client = require("./Clients"); // Importa o modelo Client

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

// Buscar dados
app.get("/api/data", async (req, res) => {
  try {
    console.log("📥 Requisição recebida em /api/data");
    const clients = await Client.find();
    res.status(200).json(clients);
  } catch (error) {
    console.error("❌ Erro ao buscar dados:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno ao buscar dados",
      error: error.message,
      stack: error.stack,
    });
  }
});
// Salvar novos dados
app.post("/api/submit", async (req, res) => {
  try {
    const { clients } = req.body;
    const savedClients = await Client.insertMany(clients);
    res
      .status(201)
      .json({ message: "Dados salvos com sucesso!", data: savedClients });
  } catch (error) {
    console.error("❌ Erro ao salvar dados:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Atualizar registro
app.put("/api/update/:clientId", async (req, res) => {
  try {
    const { clientId } = req.params;
    const updatedClient = await Client.findOneAndUpdate(
      { clientId },
      req.body,
      { new: true }
    );
    if (updatedClient) {
      res.status(200).json({
        message: "Dados atualizados com sucesso!",
        data: updatedClient,
      });
    } else {
      res.status(404).json({ message: "Cliente não encontrado." });
    }
  } catch (error) {
    console.error("❌ Erro ao atualizar dados:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Excluir registro
app.delete("/api/delete/:clientId", async (req, res) => {
  try {
    const { clientId } = req.params;
    const deletedClient = await Client.findOneAndDelete({ clientId });
    if (deletedClient) {
      res.status(200).json({ message: "Registro excluído com sucesso!" });
    } else {
      res.status(404).json({ message: "Cliente não encontrado." });
    }
  } catch (error) {
    console.error("❌ Erro ao excluir dados:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ✅ Servir o frontend
app.use(express.static(path.join(__dirname, "../my-app/build"))); // Certifique-se que o build está correto

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../my-app/build", "index.html"));
});

// ✅ Iniciar o servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});

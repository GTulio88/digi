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

// Definição do Schema para clientes
const clientSchema = new mongoose.Schema({
  date: String,
  hoursWorked: String,
  clientId: String,
  clientAddress: String,
  serviceType: String,
  status: String,
  notes: String,
});

const Client = mongoose.model("Client", clientSchema);

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

// ✅ ROTAS DA API
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
  console.log("Dados recebidos do frontend:", clients);

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

app.delete("/api/delete/:clientId", async (req, res) => {
  const { clientId } = req.params;

  try {
    const result = await Client.deleteOne({ clientId });

    if (result.deletedCount > 0) {
      res.status(200).json({ message: "Registro excluído com sucesso." });
    } else {
      res.status(404).json({ message: "Registro não encontrado." });
    }
  } catch (error) {
    console.error("Erro ao excluir registro:", error);
    res.status(500).json({ error: "Erro ao excluir registro" });
  }
});

app.put("/api/update/:clientId", async (req, res) => {
  const { clientId } = req.params;
  const updatedData = req.body;

  try {
    const result = await Client.updateOne({ clientId }, { $set: updatedData });

    if (result.modifiedCount > 0) {
      res.status(200).json({ message: "Registro atualizado com sucesso." });
    } else {
      res.status(404).json({ message: "Registro não encontrado." });
    }
  } catch (error) {
    console.error("Erro ao atualizar registro:", error);
    res.status(500).json({ error: "Erro ao atualizar registro" });
  }
});

// ✅ SERVIR O FRONTEND APÓS AS ROTAS DA API
app.use(express.static(path.join(__dirname, "frontend")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "index.html"));
});

// Inicia o servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

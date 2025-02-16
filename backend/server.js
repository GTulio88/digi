require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

app.use(cors());
app.use(bodyParser.json());

// Conectar ao MongoDB
mongoose
  .connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ Conectado ao MongoDB"))
  .catch((err) => console.error("❌ Erro ao conectar ao MongoDB:", err));

// Definir Schema do Cliente
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

// ✅ Rota para obter todos os registros
app.get("/api/data", async (req, res) => {
  try {
    const clients = await Client.find();
    res.json(clients);
  } catch (error) {
    res.status(500).json({ message: "Erro ao buscar dados." });
  }
});

// ✅ Rota para adicionar registros
app.post("/api/submit", async (req, res) => {
  try {
    const newClients = req.body.clients.map((client) => new Client(client));
    await Client.insertMany(newClients);
    res.json({ message: "Registros salvos com sucesso!", added: newClients });
  } catch (error) {
    res.status(500).json({ message: "Erro ao salvar registros." });
  }
});

// ✅ Rota para atualizar um registro
app.put("/api/update/:clientId", async (req, res) => {
  try {
    const { clientId } = req.params;
    const updatedData = req.body;
    const updatedClient = await Client.findOneAndUpdate(
      { clientId },
      updatedData,
      { new: true }
    );

    if (!updatedClient)
      return res.status(404).json({ message: "Registro não encontrado." });

    res.json({ message: "Registro atualizado com sucesso!", updatedClient });
  } catch (error) {
    res.status(500).json({ message: "Erro ao atualizar registro." });
  }
});

// ✅ Rota para excluir um registro
app.delete("/api/delete/:clientId", async (req, res) => {
  try {
    const { clientId } = req.params;
    const deletedClient = await Client.findOneAndDelete({ clientId });

    if (!deletedClient)
      return res.status(404).json({ message: "Registro não encontrado." });

    res.json({ message: "Registro excluído com sucesso!" });
  } catch (error) {
    res.status(500).json({ message: "Erro ao excluir registro." });
  }
});

app.listen(PORT, () => console.log(`🚀 Servidor rodando na porta ${PORT}`));

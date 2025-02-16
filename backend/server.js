// Carrega variáveis de ambiente do arquivo .env
require("dotenv").config();
console.log("🔍 Variáveis de ambiente carregadas:");
console.log("MONGO_URI:", process.env.MONGO_URI || "❌ Não definido!");

// Importação de módulos necessários
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

// Criando a instância do aplicativo Express
const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

// Verifica se a variável de ambiente MONGO_URI está definida
if (!MONGO_URI) {
  console.error("❌ ERRO: MONGO_URI não está definido. Configure no Render.");
  process.exit(1); // Sai do processo para evitar execução sem conexão ao banco
}

// Middleware para habilitar CORS e JSON parsing
app.use(cors());
app.use(bodyParser.json());

// Conectar ao MongoDB com tratamento de erros melhorado
mongoose
  .connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ Conectado ao MongoDB!"))
  .catch((err) => {
    console.error("❌ Erro ao conectar ao MongoDB:", err);
    process.exit(1); // Para o servidor se não conseguir conectar ao banco
  });

// Definição do Schema para clientes
const clientSchema = new mongoose.Schema({
  date: String,
  hoursWorked: String,
  clientId: { type: String, unique: true, required: true }, // Garante que clientId seja único
  clientAddress: String,
  serviceType: String,
  status: String,
  notes: String,
});

// Modelo do Cliente
const Client = mongoose.model("Client", clientSchema);

// ✅ Rota para obter todos os registros
app.get("/api/data", async (req, res) => {
  try {
    const clients = await Client.find();
    res.json(clients);
  } catch (error) {
    console.error("❌ Erro ao buscar dados:", error);
    res.status(500).json({ message: "Erro ao buscar dados." });
  }
});

// ✅ Rota para adicionar novos registros
app.post("/api/submit", async (req, res) => {
  try {
    console.log("📥 Recebendo dados:", req.body);

    if (!req.body.clients || !Array.isArray(req.body.clients)) {
      return res
        .status(400)
        .json({ message: "Formato inválido. Esperado um array de clientes." });
    }

    // Garante que cada novo cliente tem um `clientId` único
    for (let client of req.body.clients) {
      if (!client.clientId) {
        return res
          .status(400)
          .json({ message: "Cada cliente deve ter um clientId." });
      }
      const existingClient = await Client.findOne({
        clientId: client.clientId,
      });
      if (existingClient) {
        return res
          .status(400)
          .json({ message: `O clientId ${client.clientId} já existe.` });
      }
    }

    const newClients = await Client.insertMany(req.body.clients);
    res
      .status(201)
      .json({ message: "Registros salvos com sucesso!", added: newClients });
  } catch (error) {
    console.error("❌ Erro ao salvar registros:", error);
    res
      .status(500)
      .json({ message: "Erro ao salvar registros.", error: error.message });
  }
});

// ✅ Rota para atualizar um registro por `clientId`
app.put("/api/update/:clientId", async (req, res) => {
  try {
    const { clientId } = req.params;
    const updatedData = req.body;

    const updatedClient = await Client.findOneAndUpdate(
      { clientId },
      updatedData,
      { new: true }
    );

    if (!updatedClient) {
      return res.status(404).json({ message: "Registro não encontrado." });
    }

    res.json({ message: "Registro atualizado com sucesso!", updatedClient });
  } catch (error) {
    console.error("❌ Erro ao atualizar registro:", error);
    res.status(500).json({ message: "Erro ao atualizar registro." });
  }
});

// ✅ Rota para excluir um registro por `clientId`
app.delete("/api/delete/:clientId", async (req, res) => {
  try {
    const { clientId } = req.params;
    const deletedClient = await Client.findOneAndDelete({ clientId });

    if (!deletedClient) {
      return res.status(404).json({ message: "Registro não encontrado." });
    }

    res.json({ message: "Registro excluído com sucesso!" });
  } catch (error) {
    console.error("❌ Erro ao excluir registro:", error);
    res.status(500).json({ message: "Erro ao excluir registro." });
  }
});

// Iniciar o servidor
app.listen(PORT, () => console.log(`🚀 Servidor rodando na porta ${PORT}`));

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
const PORT = process.env.PORT || 10000;
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
  clientId: { type: String, required: true }, // Garante que clientId seja único
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
      // const existingClient = await Client.findOne({
      //   clientId: client.clientId,
      // });
      // if (existingClient) {
      //   return res
      //     .status(400)
      //     .json({ message: `O clientId ${client.clientId} já existe.` });
      // }
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

    console.log("🔄 Recebendo update para ID:", clientId);
    console.log(
      "📥 Dados recebidos para atualização:",
      JSON.stringify(updatedData, null, 2)
    );

    if (!clientId) {
      return res.status(400).json({ message: "Erro: clientId não fornecido." });
    }

    if (Object.keys(updatedData).length === 0) {
      return res
        .status(400)
        .json({ message: "Erro: Nenhum dado para atualizar." });
    }

    const updatedClient = await Client.findOneAndUpdate(
      { clientId: String(clientId) },
      updatedData,
      { new: true }
    );

    if (!updatedClient) {
      console.warn("⚠️ Registro não encontrado para atualização:", clientId);
      return res.status(404).json({ message: "Registro não encontrado." });
    }

    console.log("✅ Registro atualizado com sucesso:", updatedClient);
    res.json({ message: "Registro atualizado com sucesso!", updatedClient });
  } catch (error) {
    console.error("❌ Erro ao atualizar registro:", error);
    res
      .status(500)
      .json({ message: "Erro ao atualizar registro.", error: error.message });
  }
});

// ✅ Rota para excluir um registro por `clientId`
app.delete("/api/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log("📤 Tentando excluir registro com _id:", id);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Erro: ID inválido." });
    }

    const deletedClient = await Client.findByIdAndDelete(id);

    if (!deletedClient) {
      return res
        .status(404)
        .json({ message: "Erro: Registro não encontrado." });
    }

    res
      .status(200)
      .json({ message: "Registro excluído com sucesso!", deletedClient });
  } catch (error) {
    console.error("❌ Erro ao excluir registro:", error);
    res
      .status(500)
      .json({ message: "Erro ao excluir registro.", error: error.message });
  }
});

// Se nenhuma rota for encontrada, retorna erro 404 para evitar que o frontend seja servido
app.use((req, res, next) => {
  res.status(404).json({ message: "❌ Rota não encontrada." });
});

console.log("🛠️ Rotas Registradas:");
app._router.stack.forEach((r) => {
  if (r.route && r.route.path) {
    console.log(`➡️ ${r.route.stack[0].method.toUpperCase()} ${r.route.path}`);
  }
});

// Iniciar o servidor
app.listen(PORT, () => console.log(`🚀 Servidor rodando na porta ${PORT}`));

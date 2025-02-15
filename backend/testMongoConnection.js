const { MongoClient, ServerApiVersion } = require("mongodb");

// Substitua <db_password> pela sua senha real do MongoDB Atlas

const uri =
  "mongodb+srv://compumaxgti:dhTVUDPTTDnD8m9j@cluster0.feyhx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// Criação do cliente MongoDB
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect(); // Conecta ao cluster MongoDB
    await client.db("admin").command({ ping: 1 }); // Faz um ping para verificar a conexão
    console.log("✅ Conectado com sucesso ao MongoDB!");
  } catch (error) {
    console.error("❌ Erro ao conectar ao MongoDB:", error);
  } finally {
    await client.close(); // Fecha a conexão
  }
}

run().catch(console.dir);

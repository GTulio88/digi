import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000", // URL base da API
  timeout: 10000, // Timeout de 10 segundos
  headers: {
    "Content-Type": "application/json", // Define o tipo de conteúdo como JSON
  },
});

export default api;

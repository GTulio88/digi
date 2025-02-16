import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { v4 as uuidv4 } from "uuid";
import "./App.css";
import Chart from "chart.js/auto";
import TableComponent from "./components/TableComponent";
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
const mongoose = require("mongoose");
require("dotenv").config(); // Para usar variáveis de ambiente

const mongoURI = process.env.MONGO_URI;

mongoose
  .connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB conectado"))
  .catch((err) => console.error("Erro ao conectar ao MongoDB:", err));

function App() {
  const openGraphModal = async () => {
    await fetchData(); // Primeiro, obtém os dados do backend
    setTimeout(() => {
      const newStats = calculateStatistics(tableData);
      console.log("📊 Estatísticas carregadas:", newStats);
      setFilteredStatistics(newStats);
      setShowGraphModal(true);
    }, 500); // Pequeno atraso para garantir que os dados sejam carregados antes do gráfico
  };

  const [showReportModal, setShowReportModal] = useState(false);
  const [filteredReportData, setFilteredReportData] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [showModalEdit, setShowModalEdit] = useState(false); // Controle do modal de ediçã
  const [showTable, setShowTable] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [showGraphModal, setShowGraphModal] = useState(false);
  const [originalClientId, setOriginalClientId] = useState("");
  const [startDate, setStartDate] = useState(""); // Data inicial
  const [endDate, setEndDate] = useState(""); // Data final
  const [filteredStatistics, setFilteredStatistics] = useState({
    installazioneOK: 0,
    installazioneNOK: 0,
    guastoOK: 0,
    guastoNOK: 0,
    totalHoursWorked: "0.00",
    saturdayHoursWorked: "0.00",
  });

  const [statistics, setStatistics] = useState({
    installazioneOK: 0,
    installazioneNOK: 0,
    guastoOK: 0,
    guastoNOK: 0,
    totalHoursWorked: "0.00",
    saturdayHoursWorked: "0.00",
    serviceTypeCount: { installazione: 0, guasto: 0, upgrade: 0 },
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    hoursWorked: "",
    clientId: "",
    clientAddress: "",
    serviceType: "",
    status: "",
    notes: "",
  });
  const [submittedClients, setSubmittedClients] = useState([]);
  const [selectedRow, setSelectedRow] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const processTableData = (data) => {
    return data.map((item) => ({
      ...item,
      id: item.id || uuidv4(), // Se não tiver ID, gera um novo
      date: item.date ? new Date(item.date).toISOString().split("T")[0] : "",
    }));
  };

  async function fetchData() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/data`);

      if (!response.ok) {
        throw new Error(`Erro ao buscar dados: ${response.status}`);
      }

      let data = await response.json();

      console.log(
        "✅ Dados brutos recebidos do backend:",
        JSON.stringify(data, null, 2)
      );

      // Garante que cada registro tem os campos necessários
      data = data.map((item) => ({
        ...item,
        notes: item.notes || "Ok",
      }));

      setTableData(data);
      console.log("📊 Dados processados:", data);

      // Atualiza as estatísticas com os novos dados
      const stats = calculateStatistics(data);
      console.log("📊 Estatísticas calculadas:", stats);
      setStatistics(stats);
    } catch (error) {
      console.error("❌ Erro ao buscar dados:", error);
    }
  }

  const showCenteredToast = (message) => {
    toast(
      ({ closeToast }) => (
        <div
          style={{
            textAlign: "center",
            background: "rgba(0, 0, 0, 0.9)",
            padding: "20px",
            borderRadius: "12px",
            boxShadow: "0 0 15px #00ffea, 0 0 30px #00ffea",
            color: "#fff",
            fontFamily: "Arial, sans-serif",
            fontSize: "18px",
            fontWeight: "bold",
          }}
        >
          <p
            style={{
              marginBottom: "15px",
              textShadow: "0 0 10px #00ffea",
            }}
          >
            {message}
          </p>
          <button
            onClick={closeToast}
            style={{
              background: "linear-gradient(45deg, #00ffea, #00a3ff)",
              color: "#000",
              fontSize: "16px",
              fontWeight: "bold",
              padding: "10px 25px",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              transition: "0.3s",
              boxShadow: "0 0 10px #00ffea",
            }}
            onMouseOver={(e) => {
              e.target.style.boxShadow = "0 0 20px #00ffea";
              e.target.style.transform = "scale(1.1)";
            }}
            onMouseOut={(e) => {
              e.target.style.boxShadow = "0 0 10px #00ffea";
              e.target.style.transform = "scale(1)";
            }}
          >
            OK
          </button>
        </div>
      ),
      {
        position: "top-center", // Centraliza na tela
        autoClose: false, // Mantém aberto até clicar
        closeOnClick: false, // Não fecha ao clicar fora
        draggable: false, // Impede arrastar
        closeButton: false, // Remove o botão de fechar padrão
      }
    );
  };

  const handleSubmit = async (formData) => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const newEntry = {
        ...formData,
        id: uuidv4(), // Garante um ID único para o novo registro
      };

      const response = await fetch(`${API_BASE_URL}/api/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clients: [newEntry] }),
      });

      if (!response.ok) {
        throw new Error("Erro ao enviar dados para o servidor.");
      }

      console.log("✅ Dados enviados com sucesso!");

      setTableData((prev) => [...prev, newEntry]);
    } catch (error) {
      console.error("❌ Erro ao enviar dados:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (showGraphModal && filteredStatistics) {
      console.log("📊 Atualizando gráfico com:", filteredStatistics);
      updatePieChart(filteredStatistics);
    }
  }, [showGraphModal, filteredStatistics]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "hoursWorked") {
      if (value === "") {
        setFormData((prev) => ({
          ...prev,
          [name]: "",
        }));
        return;
      }

      let formattedValue = value.replace(/\D/g, "");

      if (formattedValue.length > 4) return;

      let hours = parseInt(formattedValue.slice(0, -2)) || 0;
      let minutes = parseInt(formattedValue.slice(-2)) || 0;

      if (formattedValue.length < 3) {
        setFormData((prev) => ({
          ...prev,
          [name]: formattedValue,
        }));
        return;
      }

      // if (hours > 12) {
      //   alert("O número de horas não pode exceder 12.");
      //   return;
      // }

      // if (minutes > 59) {
      //   alert("Os minutos não podem exceder 59.");
      //   return;
      // }
      if (hours > 12) {
        showCenteredToast("❗ Verifique a hora inserida!!!");
        return;
      }

      if (minutes > 59) {
        showCenteredToast("❗ Verifique a hora inserida!!!");
        return;
      }

      let displayValue = `${hours}h${minutes.toString().padStart(2, "0")}`;

      setFormData((prev) => ({
        ...prev,
        [name]: displayValue,
      }));
    } else if (name === "clientId") {
      let formattedValue = value.replace(/\D/g, ""); // Remove caracteres não numéricos
      if (formattedValue.length > 7) {
        showCenteredToast("O ID do cliente deve ter no máximo 7 dígitos."); // Exibe alerta
        formattedValue = formattedValue.slice(0, 7); // Trunca para 7 dígitos
      }
      setFormData((prev) => ({
        ...prev,
        [name]: formattedValue, // Atualiza o valor truncado
      }));
    } else if (name === "clientAddress") {
      const titleCaseValue = value
        .toLowerCase()
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");

      setFormData((prev) => ({
        ...prev,
        [name]: titleCaseValue,
      }));
    } else if (name === "notes") {
      const capitalizedValue = value.charAt(0).toUpperCase() + value.slice(1);
      setFormData((prev) => ({
        ...prev,
        [name]: capitalizedValue,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };
  const openReportModal = () => {
    setShowReportModal(true);
  };
  const filterReportDataByDate = () => {
    if (!startDate || !endDate) {
      showCenteredToast("Por favor, selecione um intervalo de datas válido.");
      return;
    }

    const start = new Date(`${startDate}T00:00:00`);
    const end = new Date(`${endDate}T23:59:59`);

    const filteredData = tableData.filter((entry) => {
      const entryDate = new Date(`${entry.date}T00:00:00`);
      return entryDate >= start && entryDate <= end;
    });

    if (filteredData.length === 0) {
      showCenteredToast("Nenhum dado encontrado para esse intervalo.");
      return;
    }

    setFilteredReportData(filteredData);
  };

  const printFullReport = () => {
    if (filteredReportData.length === 0) {
      showCenteredToast("Não há dados para imprimir.");
      return;
    }

    // Formatar os dados como HTML antes de abrir a janela de impressão
    const tableRows = filteredReportData
      .map(
        (entry) => `
        <tr>
          <td>${formatDate(entry.date)}</td>
          <td>${entry.clientId}</td>
          <td>${entry.clientAddress}</td>
          <td>${entry.serviceType}</td>
          <td class="status-cell">${
            entry.status.toLowerCase() === "ok" ? "✅" : "❌"
          }</td>
          <td>${entry.notes}</td>
        </tr>
      `
      )
      .join(""); // Junta todas as linhas

    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>Rapporto Completo</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
              color: #000;
              background-color: #fff;
              text-align: center;
            }
            h2 {
              font-size: 20px;
              font-weight: bold;
              margin-bottom: 15px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 10px;
              font-size: 11px; /* Fonte menor para caber mais dados */
            }
            th, td {
              border: 1px solid #000;
              padding: 6px;
              text-align: left;
              vertical-align: middle; /* Alinhar conteúdo verticalmente */
            }
            th {
              background-color: #ddd;
            }
            .status-cell {
              width: 50px; /* Reduz a largura da coluna */
              text-align: center; /* Centraliza os emojis */
            }
            @media print {
              .print-button {
                display: none;
              }
            }
          </style>
        </head>
        <body>
          <h2>📄 Rapporto Completo</h2>
          <p><strong>📅 Período:</strong> ${formatDate(
            startDate
          )} a ${formatDate(endDate)}</p>
          <table>
            <thead>
              <tr>
                <th>📅 Data</th>
                <th>🆔 ID Cliente</th>
                <th>📍 Indirizzo</th>
                <th>🔧 Tipo di Lavoro</th>
                <th class="status-cell">📊 Status</th>
                <th>📝 Osservazione</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows} <!-- Insere as linhas geradas dinamicamente -->
            </tbody>
          </table>
          <br>
          <button class="print-button" onclick="window.print()">🖨️ Imprimir</button>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const printGraph = () => {
    const canvas = document.getElementById("serviceChart");

    if (!canvas) {
      showCenteredToast("❗ O gráfico não está disponível para impressão.");
      return;
    }

    // Criando a imagem do gráfico
    const image = new Image();
    image.src = canvas.toDataURL("image/png");

    // Formatar datas para exibição no relatório
    const formatDate = (date) => {
      if (!date || typeof date !== "string") return "Data inválida";
      const [year, month, day] = date.split("-");
      return `${day}/${month}/${year}`;
    };

    const formattedStartDate = formatDate(startDate);
    const formattedEndDate = formatDate(endDate);

    // Criando a nova janela para impressão
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>Rapporto di lavoro:</title>
          <style>
            @media print {
              .print-button {
                display: none;
              }
            }
            body {
              text-align: center;
              font-family: Arial, sans-serif;
              padding: 20px;
              color: #000;
              background-color: #fff;
            }
            h2 {
              color: #000;
              font-size: 22px;
              font-weight: bold;
            }
            .stats-container {
              text-align: center;
              max-width: 500px;
              margin: 0 auto;
              font-size: 18px;
              font-weight: bold;
            }
            .stats-container p {
              margin: 8px 0;
              font-size: 16px;
            }
            img {
              max-width: 100%;
              height: auto;
              margin-top: 20px;
              border: 2px solid #000;
              padding: 5px;
            }
          </style>
        </head>
        <body>
          <h2>📊 Rapporto di lavoro:</h2>
          
          <p><strong>📅 Período:</strong> ${formattedStartDate} a ${formattedEndDate}</p>
  
          <div class="stats-container">
            <p>📌 <strong>Installazione OK:</strong> ${filteredStatistics.installazioneOK}</p>
            <p>📌 <strong>Installazione NOK:</strong> ${filteredStatistics.installazioneNOK}</p>
            <p>📌 <strong>Guasto OK:</strong> ${filteredStatistics.guastoOK}</p>
            <p>📌 <strong>Guasto NOK:</strong> ${filteredStatistics.guastoNOK}</p>
            <p>⏳ <strong>Totale di ore lavorate:</strong> ${filteredStatistics.totalHoursWorked} horas</p>
            <p>⏳ <strong>Totale ore sabato:</strong> ${filteredStatistics.saturdayHoursWorked} horas</p>
          </div>
  
          <img src="${image.src}" alt="Gráfico de Serviços" />
          <br><br>
          <button class="print-button" onclick="window.print()">🖨️ Imprimir</button>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const updatePieChart = (stats) => {
    if (!stats) {
      console.error("❌ Erro: Nenhum dado para atualizar o gráfico!");
      return;
    }

    console.log("📊 Estatísticas enviadas para o gráfico:", stats);

    setTimeout(() => {
      const canvas = document.getElementById("serviceChart");
      if (!canvas) {
        console.error("⚠️ O elemento <canvas> não foi encontrado!");
        return;
      }

      const ctx = canvas.getContext("2d");

      if (window.myPieChart instanceof Chart) {
        window.myPieChart.destroy();
      }

      window.myPieChart = new Chart(ctx, {
        type: "pie",
        data: {
          labels: [
            "Installazione OK",
            "Installazione NOK",
            "Guasto OK",
            "Guasto NOK",
          ],
          datasets: [
            {
              label: "Estatísticas",
              data: [
                stats.installazioneOK || 0,
                stats.installazioneNOK || 0,
                stats.guastoOK || 0,
                stats.guastoNOK || 0,
              ],
              backgroundColor: ["#4169E1", "#8B0000", "#40E0D0", "#FF8C00"],
              borderColor: "#ffffff",
              borderWidth: 2,
              hoverOffset: 10,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: true,
              position: "bottom",
              labels: {
                color: "#B8860B",
                font: { size: 14, weight: "bold" },
              },
            },
          },
        },
      });
    }, 1000);
  };

  const filterStatisticsByDate = () => {
    if (!startDate || !endDate) {
      showCenteredToast("Por favor, selecione um intervalo de datas válido.");
      return;
    }

    const start = new Date(`${startDate}T00:00:00`);
    const end = new Date(`${endDate}T23:59:59`);

    console.log(
      "📅 Intervalo de datas filtrado:",
      start.toISOString(),
      " - ",
      end.toISOString()
    );

    const filteredData = tableData.filter((entry) => {
      const entryDate = new Date(`${entry.date}T00:00:00`);
      return entryDate >= start && entryDate <= end;
    });

    console.log("📊 Dados filtrados:", filteredData);

    if (filteredData.length === 0) {
      showCenteredToast("Nenhum dado encontrado para esse intervalo.");
      return;
    }

    // **Atualiza primeiro o estado antes de chamar a atualização do gráfico**
    const newStats = calculateStatistics(filteredData);
    setFilteredStatistics(newStats);

    // **Aguardar a atualização do estado antes de renderizar o gráfico**
    setTimeout(() => {
      updatePieChart(newStats);
    }, 100);
  };

  const handleEdit = (row) => {
    setFormData(row); // Preenche o formulário com os dados da linha
    setOriginalClientId(row.clientId); // Armazena o ID original
    setShowModalEdit(true); // Abre o modal de edição
  };

  const handleDelete = async (row) => {
    console.log("📦 Tentando excluir registro com ID:", row.id);

    if (!row.id) {
      console.error("❌ Erro: O registro não possui um ID único.");
      showCenteredToast("Erro: O registro não possui um ID único.");
      return;
    }

    const confirmDelete = window.confirm(
      `Deseja excluir o registro com ID: ${row.id}?`
    );

    if (confirmDelete) {
      try {
        console.log(
          `🔗 Enviando DELETE para: ${API_BASE_URL}/api/delete/${row.id}`
        );

        const response = await fetch(`${API_BASE_URL}/api/delete/${row.id}`, {
          method: "DELETE",
        });

        console.log("🔄 Status da resposta:", response.status);

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(
            `Erro ao excluir o registro. Servidor respondeu: ${errorText}`
          );
        }

        console.log("✅ Registro excluído com sucesso!");
        setTableData((prevData) =>
          prevData.filter((item) => item.id !== row.id)
        );
        toast.success("✅ Cliente excluido com sucesso!", {
          position: "top-right",
          autoClose: 3000,
        });
      } catch (error) {
        console.error("❌ Erro ao excluir registro:", error);
        toast.error(`❌ Erro ao adicionar cliente: ${error.message}`, {
          position: "top-right",
          autoClose: 5000,
        });
      }
    }
  };

  async function handleSaveEdit(client, updatedData) {
    console.log("📦 Dados do cliente:", client); // Verificar o que está sendo recebido

    try {
      const clientId = client.clientId; // Obtém o clientId do cliente

      if (!clientId) {
        console.error("❌ clientId está indefinido!");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/update/${clientId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) {
        throw new Error("Erro ao atualizar o registro.");
      }

      const result = await response.json();
      console.log("✅ Registro atualizado com sucesso:", result);
      fetchData(); // Atualiza a tabela
      setShowModalEdit(false); // Fecha o modal de edição
    } catch (error) {
      console.error("❌ Erro ao atualizar registro:", error);
    }
  }

  const handleNext = () => {
    // Adiciona a lógica para autocompletar o campo "Horas trabalhadas"
    if (currentStep === 1 && formData.hoursWorked) {
      let hoursWorked = formData.hoursWorked.trim();

      // Se o valor for apenas um número (exemplo: '8')
      if (/^\d+$/.test(hoursWorked)) {
        hoursWorked = `${hoursWorked}h00`; // Adiciona 'h00'
        setFormData((prev) => ({
          ...prev,
          hoursWorked,
        }));
      }
    }

    // Lógica existente no método handleNext
    if (currentStep === 2 && !formData.clientId.trim()) {
      showCenteredToast("Por favor, insira um ID de cliente válido.");
      return;
    }

    if (currentStep < 6) setCurrentStep(currentStep + 1);
  };

  const formatDate = (date) => {
    if (!date || typeof date !== "string") return "Data inválida";
    const [year, month, day] = date.split("-");
    return `${day}/${month}/${year}`;
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleAddAnother = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const newEntry = {
        ...formData,
        id: uuidv4(),
      };

      console.log(
        "📤 Tentando enviar para API:",
        JSON.stringify({ clients: [newEntry] }, null, 2)
      );

      const response = await fetch(`${API_BASE_URL}/api/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clients: [newEntry] }),
      });

      console.log("🔄 Resposta da API:", response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erro ao enviar dados para o servidor: ${errorText}`);
      }

      console.log("✅ Cliente adicionado com sucesso!");

      setSubmittedClients((prev) => [...prev, newEntry]);

      // Adicionando alerta e log de sucesso
      toast.success("✅ Cliente adicionado com sucesso!", {
        position: "top-right",
        autoClose: 3000,
      });
      console.log("✅ Novo cliente salvo:", newEntry);

      // Em vez de resetar tudo, mantém a data e as horas trabalhadas
      setFormData((prev) => ({
        ...prev,
        clientId: "",
        clientAddress: "",
        serviceType: "",
        status: "",
        notes: "",
        date: prev.date, // Mantém a data do cliente anterior
        hoursWorked: prev.hoursWorked, // Mantém as horas trabalhadas
      }));

      setCurrentStep(2); // Volta para o passo de inserir ID do cliente
    } catch (error) {
      console.error("❌ Erro ao adicionar cliente:", error);
      showCenteredToast(`Erro ao adicionar cliente: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setCurrentStep(1);
    setShowModal(false);
  };

  const validateAndSubmit = async () => {
    if (isSubmitting) return; // Evita múltiplos envios
    setIsSubmitting(true);

    try {
      const newEntry = {
        ...formData,
        id: uuidv4(), // Garante um ID único para o novo registro
      };

      console.log("📤 Enviando dados para API:", newEntry);

      const response = await fetch(`${API_BASE_URL}/api/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clients: [newEntry] }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erro ao enviar dados: ${errorText}`);
      }

      console.log("✅ Dados enviados com sucesso!");

      setTableData((prev) => [...prev, newEntry]);

      toast.success("✅ Dados enviados com sucesso!", {
        position: "top-right",
        autoClose: 3000,
      });

      setShowModal(false);
      setCurrentStep(1);
      setFormData({
        date: new Date().toISOString().split("T")[0],
        hoursWorked: "",
        clientId: "",
        clientAddress: "",
        serviceType: "",
        status: "",
        notes: "",
      });
    } catch (error) {
      console.error("❌ Erro ao enviar dados:", error);
      toast.error(`❌ Erro ao enviar dados: ${error.message}`, {
        position: "top-right",
        autoClose: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateStatistics = (data) => {
    if (!data || data.length === 0) {
      console.warn("⚠️ Nenhum dado recebido para calcular estatísticas!");
      return {
        installazioneOK: 0,
        installazioneNOK: 0,
        guastoOK: 0,
        guastoNOK: 0,
        totalHoursWorked: "0.00",
        saturdayHoursWorked: "0.00",
        averageDailyHoursWorked: "0.00",
      };
    }

    let installazioneOK = 0;
    let installazioneNOK = 0;
    let guastoOK = 0;
    let guastoNOK = 0;

    let dailyStats = {}; // Armazena a jornada total de horas e serviços por dia
    let saturdayStats = {}; // Armazena somente os sábados

    console.log("📊 Iniciando processamento de estatísticas...");

    data.forEach((entry, index) => {
      console.log(`🔄 Processando entrada ${index + 1}:`, entry);

      const serviceType = entry.serviceType?.toLowerCase().trim();
      const status = entry.status?.toLowerCase().trim();
      const entryDate = new Date(entry.date).toISOString().split("T")[0]; // Formato YYYY-MM-DD
      const dayOfWeek = new Date(entry.date).getDay(); // Obtém o dia da semana (0 = domingo, 6 = sábado)

      if (status === "ok") {
        if (serviceType === "installazione") {
          installazioneOK++;
        } else if (serviceType === "guasto") {
          guastoOK++;
        }
      } else if (status === "nok") {
        if (serviceType === "installazione") {
          installazioneNOK++;
        } else if (serviceType === "guasto") {
          guastoNOK++;
        }
      }

      // ✅ Armazena a jornada de trabalho diária
      if (entry.hoursWorked) {
        console.log(
          `⏳ Processando jornada trabalhada: "${entry.hoursWorked}"`
        );

        let formattedTime = entry.hoursWorked.replace(/\s+/g, "").toLowerCase();
        let hours = 0,
          minutes = 0;
        const timeMatch = formattedTime.match(/(\d+)h?(\d{1,2})?m?/);

        if (timeMatch) {
          hours = parseInt(timeMatch[1]) || 0;
          minutes = parseInt(timeMatch[2]) || 0;
        }

        const totalMinutes = hours * 60 + minutes;

        // 🔹 Armazena **a jornada total do dia apenas uma vez**
        if (!dailyStats[entryDate]) {
          dailyStats[entryDate] = {
            totalMinutesWorked: totalMinutes,
            serviceCount: 1,
          };
        } else {
          dailyStats[entryDate].serviceCount++; // Apenas incrementa a contagem de serviços
        }

        // ✅ Se for sábado, armazena a jornada do sábado como nos dias normais
        if (dayOfWeek === 6) {
          if (!saturdayStats[entryDate]) {
            saturdayStats[entryDate] = totalMinutes;
          }
        }

        console.log(
          `✅ Jornada em ${entryDate}: ${totalMinutes} min (${(
            totalMinutes / 60
          ).toFixed(2)} h)`
        );
      }
    });

    // 🔥 Calculando a média diária das horas trabalhadas corretamente
    let totalHoursWorked = 0;
    let totalDays = 0;
    let totalDailyAverages = 0;
    let totalSaturdayMinutesWorked = 0;
    let totalSaturdayDays = Object.keys(saturdayStats).length; // Conta os sábados trabalhados

    for (let day in dailyStats) {
      totalDays++;
      let dailyTotalHours = dailyStats[day].totalMinutesWorked / 60;
      let dailyAverage = dailyTotalHours / dailyStats[day].serviceCount; // 🔥 Correção: Considera a jornada do dia e não soma por serviço
      totalHoursWorked += dailyTotalHours;
      totalDailyAverages += dailyAverage;
    }

    for (let day in saturdayStats) {
      totalSaturdayMinutesWorked += saturdayStats[day];
    }

    const averageDailyHoursWorked =
      totalDays > 0 ? (totalDailyAverages / totalDays).toFixed(2) : "0.00";
    const averageSaturdayHoursWorked =
      totalSaturdayDays > 0
        ? (totalSaturdayMinutesWorked / 60 / totalSaturdayDays).toFixed(2)
        : "0.00";

    const finalStats = {
      installazioneOK,
      installazioneNOK,
      guastoOK,
      guastoNOK,
      totalHoursWorked: totalHoursWorked.toFixed(2),
      saturdayHoursWorked: (totalSaturdayMinutesWorked / 60).toFixed(2),
      averageDailyHoursWorked,
      averageSaturdayHoursWorked,
    };

    console.log("📊 Estatísticas finais calculadas:", finalStats);
    return finalStats;
  };

  const openWizard = () => {
    setCurrentStep(1); // Garante que sempre começa do passo 1
    setFormData({
      date: new Date().toISOString().split("T")[0],
      hoursWorked: "",
      clientId: "",
      clientAddress: "",
      serviceType: "",
      status: "",
      notes: "",
    });
    setShowModal(true);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <>
            <label>
              Data do dia trabalhado:
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
              />
            </label>
            <label>
              Horas trabalhadas:
              <input
                type="text"
                name="hoursWorked"
                className="hours-worked"
                value={formData.hoursWorked}
                onChange={handleChange}
                required
                placeholder="Ex: 8h30"
              />
            </label>
          </>
        );
      case 2:
        return (
          <label>
            ID do Cliente:
            <input
              type="number"
              name="clientId"
              value={formData.clientId}
              onChange={handleChange}
              required
              placeholder="Ex.: 1234567"
            />
          </label>
        );
      case 3:
        return (
          <label>
            Endereço do Cliente:
            <input
              type="text"
              name="clientAddress"
              value={formData.clientAddress}
              onChange={handleChange}
              required
              placeholder="Ex.: Rua das Flores"
            />
          </label>
        );
      case 4:
        return (
          <label>
            Tipo de Serviço:
            <select
              name="serviceType"
              value={formData.serviceType}
              onChange={handleChange}
              required
            >
              <option value="">Selecione</option>
              <option value="installazione">Installazione</option>
              <option value="guasto">Guasto</option>
              <option value="upgrade">Upgrade</option>
            </select>
          </label>
        );
      case 5:
        return (
          <label>
            Status:
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              required
            >
              <option value="">Selecione</option>
              <option value="ok">OK</option>
              <option value="nok">NOK</option>
            </select>
          </label>
        );
      case 6:
        return (
          <label>
            Observação:
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
            ></textarea>
          </label>
        );
      default:
        return null;
    }
  };

  return (
    <div className="app-container">
      <header className="header">
        <h1 className="header-title">DIGI INSTALAÇÕES</h1>
      </header>
      <div className="service-grid">
        <div className="service-item" onClick={openWizard}>
          <img src="/icons/user.png" alt="Cadastrar" className="service-icon" />
          <p className="service-text">CADASTRAR</p>
        </div>
        <div
          className="service-item"
          onClick={() => {
            fetchData(); // Chamar a função antes de exibir a tabela
            setShowTable(true);
          }}
        >
          <img
            src="/icons/search.png"
            alt="Consultar"
            className="service-icon"
          />
          <p className="service-text">CONSULTAR</p>
        </div>

        <div className="service-item" onClick={openGraphModal}>
          <img src="/icons/graph.png" alt="Gráfico" className="service-icon" />
          <p className="service-text">GRÁFICO</p>
        </div>

        <div className="service-item" onClick={openReportModal}>
          <img src="/icons/pdf.png" alt="Gerar PDF" className="service-icon" />
          <p className="service-text">GERAR PDF</p>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2 className="modal-title">Assistente de Cadastro</h2>
            <div className="wizard-content">{renderStepContent()}</div>
            <div className="wizard-buttons">
              <button
                type="button"
                className="btn-cancel"
                onClick={handleCancel}
              >
                Cancelar
              </button>
              {currentStep > 1 && (
                <button type="button" className="btn-back" onClick={handleBack}>
                  Voltar
                </button>
              )}
              {currentStep < 6 ? (
                <button type="button" className="btn-next" onClick={handleNext}>
                  Avançar
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    className="btn-add"
                    onClick={handleAddAnother} // Agora mantém a data e horas
                  >
                    Add outro
                  </button>

                  <button
                    type="button"
                    className="btn-submit"
                    onClick={validateAndSubmit} // Envia tudo e fecha o modal
                  >
                    Concluir
                  </button>

                  {selectedRow && (
                    <button onClick={() => handleSaveEdit(client, updatedData)}>
                      Salvar Alterações
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {showReportModal && (
        <div
          className="modal-overlay"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.9)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <div
            className="modal"
            style={{
              width: "90vw",
              height: "90vh",
              backgroundColor: "#111",
              borderRadius: "12px",
              padding: "20px",
              boxShadow: "0px 0px 20px rgba(0, 255, 234, 0.7)",
              color: "#fff",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <h2
              style={{
                color: "#00ffea",
                textShadow: "0 0 10px #00ffea",
                textAlign: "center",
              }}
            >
              📄 Gerar Relatório Completo
            </h2>

            {/* Filtros */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: "10px",
                marginBottom: "10px",
              }}
            >
              <label style={{ flex: 1 }}>
                <span style={{ fontWeight: "bold", color: "#00ffea" }}>
                  De:
                </span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  style={{
                    width: "",
                    padding: "10px",
                    borderRadius: "6px",
                    border: "1px solid #00ffea",
                    background: "#222",
                    color: "#fff",
                    marginTop: "5px",
                  }}
                />
              </label>

              <label style={{ flex: 1 }}>
                <span style={{ fontWeight: "bold", color: "#00ffea" }}>
                  Até:
                </span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  style={{
                    width: "",
                    padding: "10px",
                    borderRadius: "6px",
                    border: "1px solid #00ffea",
                    background: "#222",
                    color: "#fff",
                    marginTop: "5px",
                  }}
                />
              </label>
            </div>

            <button
              onClick={filterReportDataByDate}
              style={{
                width: "100%",
                padding: "12px",
                background: "linear-gradient(45deg, #00ffea, #00a3ff)",
                color: "#000",
                fontWeight: "bold",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                transition: "0.3s",
                boxShadow: "0 0 10px #00ffea",
              }}
              onMouseOver={(e) => {
                e.target.style.boxShadow = "0 0 20px #00ffea";
                e.target.style.transform = "scale(1.05)";
              }}
              onMouseOut={(e) => {
                e.target.style.boxShadow = "0 0 10px #00ffea";
                e.target.style.transform = "scale(1)";
              }}
            >
              🔎 Filtrar
            </button>

            {/* Área da Tabela */}
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                margin: "10px 0",
                borderRadius: "8px",
                padding: "10px",
                backgroundColor: "#222",
              }}
            >
              {filteredReportData.length > 0 ? (
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                  }}
                >
                  <thead>
                    <tr style={{ backgroundColor: "#00ffea", color: "#000" }}>
                      <th style={{ padding: "8px", textAlign: "left" }}>
                        📅 Data
                      </th>
                      <th style={{ padding: "8px", textAlign: "left" }}>
                        🆔 ID Cliente
                      </th>
                      <th style={{ padding: "8px", textAlign: "left" }}>
                        📍 Indirizzo
                      </th>
                      <th style={{ padding: "8px", textAlign: "left" }}>
                        🔧 Tipo Lavoro
                      </th>
                      <th style={{ padding: "8px", textAlign: "left" }}>
                        ✅ Status
                      </th>
                      <th style={{ padding: "8px", textAlign: "left" }}>
                        📝 Osservazione
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredReportData.map((entry, index) => (
                      <tr
                        key={index}
                        style={{ backgroundColor: "#333", color: "#fff" }}
                      >
                        <td style={{ padding: "8px" }}>{entry.date}</td>
                        <td style={{ padding: "8px" }}>{entry.clientId}</td>
                        <td style={{ padding: "8px" }}>
                          {entry.clientAddress}
                        </td>
                        <td style={{ padding: "8px" }}>{entry.serviceType}</td>
                        <td style={{ padding: "8px" }}>{entry.status}</td>
                        <td style={{ padding: "8px" }}>{entry.notes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p style={{ textAlign: "center", color: "#ff003c" }}>
                  Nenhum dado encontrado
                </p>
              )}
            </div>

            {/* Botões Fixos */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: "10px",
              }}
            >
              <button
                onClick={printFullReport}
                style={{
                  flex: 1,
                  padding: "12px",
                  background: "linear-gradient(45deg, #ff00ff, #ff003c)",
                  color: "#fff",
                  fontWeight: "bold",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  transition: "0.3s",
                  boxShadow: "0 0 10px #ff00ff",
                  marginRight: "10px",
                }}
              >
                🖨️ Imprimir Relatório
              </button>

              <button
                onClick={() => setShowReportModal(false)}
                style={{
                  flex: 1,
                  padding: "12px",
                  background: "#ff003c",
                  color: "#fff",
                  fontWeight: "bold",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  transition: "0.3s",
                  boxShadow: "0 0 10px #ff003c",
                }}
              >
                ❌ Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {showTable && (
        <div className="table-overlay">
          <div className="table-container">
            <h2 className="table-title">Dados Cadastrados</h2>
            <TableComponent
              data={tableData}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
            <button className="btn-cancel" onClick={() => setShowTable(false)}>
              Fechar
            </button>
          </div>
        </div>
      )}

      {selectedRow && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Detalhes do Registro</h2>
            <p>
              <strong>Data:</strong> {formatDate(selectedRow.date)}
            </p>
            <p>
              <strong>Horas:</strong> {selectedRow.hoursWorked}
            </p>
            <p>
              <strong>ID do Cliente:</strong> {selectedRow.clientId}
            </p>
            <button onClick={() => setSelectedRow(null)}>Fechar</button>
          </div>
        </div>
      )}
      {showModalEdit && (
        <div className="modalEdit-overlay">
          <div className="modalEdit">
            <h2 className="modalEdit-title">Editar Registro</h2>
            <div className="modalEdit-content">
              <label>
                Data:
                <input
                  type="date"
                  name="date"
                  value={formData.date || ""}
                  onChange={handleChange}
                  required
                />
              </label>
              <label>
                Horas Trabalhadas:
                <input
                  type="text"
                  name="hoursWorked"
                  value={formData.hoursWorked || ""}
                  onChange={handleChange}
                  required
                />
              </label>
              <label>
                ID do Cliente:
                <input
                  type="text"
                  name="clientId"
                  value={formData.clientId || ""}
                  onChange={handleChange}
                  required
                />
              </label>
              <label>
                Endereço do Cliente:
                <input
                  type="text"
                  name="clientAddress"
                  value={formData.clientAddress || ""}
                  onChange={handleChange}
                  required
                />
              </label>
              <label>
                Tipo de Serviço:
                <select
                  name="serviceType"
                  value={formData.serviceType || ""}
                  onChange={handleChange}
                  required
                >
                  <option value="">Selecione</option>
                  <option value="installazione">Installazione</option>
                  <option value="guasto">Guasto</option>
                  <option value="upgrade">Upgrade</option>
                </select>
              </label>
              <label>
                Status:
                <select
                  name="status"
                  value={formData.status || ""}
                  onChange={handleChange}
                  required
                >
                  <option value="">Selecione</option>
                  <option value="ok">OK</option>
                  <option value="nok">NOK</option>
                </select>
              </label>
              <label>
                Observações:
                <textarea
                  name="notes"
                  value={formData.notes || ""}
                  onChange={handleChange}
                />
              </label>
            </div>
            <div className="modalEdit-buttons">
              <button
                className="btn-cancel"
                onClick={() => setShowModalEdit(false)}
              >
                Cancelar
              </button>
              <button
                className="btn-submit"
                onClick={() => handleSaveEdit(formData, formData)} // Passando o formData corretamente
              >
                Salvar Alterações
              </button>
            </div>
          </div>
        </div>
      )}

      {showGraphModal && (
        <div
          className="modal-overlay"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.9)",
            backdropFilter: "blur(10px)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <button
            onClick={() => setShowGraphModal(false)}
            style={{
              position: "absolute",
              top: "15px",
              right: "15px",
              background: "#ff003c",
              color: "white",
              border: "none",
              padding: "10px",
              cursor: "pointer",
              fontSize: "16px",
              boxShadow: "0 0 8px #ff003c",
              borderRadius: "8px",
              transition: "0.3s",
            }}
            onMouseOver={(e) => {
              e.target.style.boxShadow = "0 0 15px #ff003c";
              e.target.style.transform = "scale(1.1)";
            }}
            onMouseOut={(e) => {
              e.target.style.boxShadow = "0 0 8px #ff003c";
              e.target.style.transform = "scale(1)";
            }}
          >
            X
          </button>
          <div
            className="modal"
            style={{
              width: "90vw",
              maxWidth: "700px",
              height: "90vh",
              backgroundColor: "#111",
              borderRadius: "15px",
              padding: "20px",
              boxShadow: "0px 0px 20px rgba(0, 255, 234, 0.9)",
              color: "#fff",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-start",
              overflowY: "auto", // Adiciona rolagem se necessário
            }}
          >
            <h2 style={{ color: "#00ffea", textShadow: "0 0 10px #00ffea" }}>
              📊 Statistiche Del Mese:
            </h2>

            {/* Estatísticas */}
            <div style={{ textAlign: "left", fontSize: "18px" }}>
              <p>
                <strong>✅ Installazione OK:</strong>{" "}
                {filteredStatistics.installazioneOK}
              </p>
              <p>
                <strong>❌ Installazione NOK:</strong>{" "}
                {filteredStatistics.installazioneNOK}
              </p>
              <p>
                <strong>🔧 Guasti OK:</strong> {filteredStatistics.guastoOK}
              </p>
              <p>
                <strong>⚠️ Guasti NOK:</strong> {filteredStatistics.guastoNOK}
              </p>
              <p>
                <strong>⏳ Totale di ore:</strong>{" "}
                {filteredStatistics.totalHoursWorked} horas
              </p>
              <p>
                <strong>📅 Totale di ore Sabato:</strong>{" "}
                {filteredStatistics.saturdayHoursWorked} horas
              </p>
            </div>
            {/* Campos de Filtro por Data */}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: "10px",
                marginBottom: "15px",
              }}
            >
              <label style={{ color: "#fff" }}>
                <span style={{ fontWeight: "bold", color: "#00ffea" }}>
                  De:
                </span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  style={{
                    padding: "8px",
                    backgroundColor: "#222",
                    color: "#fff",
                    border: "1px solid #00ffea",
                    borderRadius: "6px",
                    marginLeft: "5px",
                  }}
                />
              </label>

              <label style={{ color: "#fff" }}>
                <span style={{ fontWeight: "bold", color: "#00ffea" }}>
                  Até:
                </span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  style={{
                    padding: "8px",
                    backgroundColor: "#222",
                    color: "#fff",
                    border: "1px solid #00ffea",
                    borderRadius: "6px",
                    marginLeft: "5px",
                  }}
                />
              </label>

              {/* Botão de Filtrar */}
              <button
                onClick={filterStatisticsByDate}
                style={{
                  padding: "10px",
                  backgroundColor: "#00ffea",
                  color: "#000",
                  fontWeight: "bold",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  boxShadow: "0px 0px 10px #00ffea",
                  marginLeft: "10px",
                  transition: "0.3s",
                }}
                onMouseOver={(e) => {
                  e.target.style.boxShadow = "0 0 20px #00ffea";
                  e.target.style.transform = "scale(1.1)";
                }}
                onMouseOut={(e) => {
                  e.target.style.boxShadow = "0 0 10px #00ffea";
                  e.target.style.transform = "scale(1)";
                }}
              >
                🔍 Filtrar
              </button>
            </div>

            {/* Gráfico */}
            <h3
              style={{
                color: "#ff00ff",
                textShadow: "0 0 10px rgb(25, 178, 216)",
              }}
            >
              📈 Gráfico de Serviços:
            </h3>
            <div
              style={{
                width: "100%",
                maxWidth: "500px",
                height: "400px",
                margin: "0 auto",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <canvas id="serviceChart"></canvas>
            </div>

            {/* Botão de Impressão */}
            <button
              onClick={printGraph}
              style={{
                padding: "12px 20px",
                backgroundColor: "#00ffea",
                color: "#000",
                fontWeight: "bold",
                border: "none",
                cursor: "pointer",
                boxShadow: "0px 0px 10px #00ffea",
                marginTop: "20px",
                borderRadius: "8px",
                transition: "0.3s",
              }}
              onMouseOver={(e) => {
                e.target.style.boxShadow = "0 0 20px #00ffea";
                e.target.style.transform = "scale(1.1)";
              }}
              onMouseOut={(e) => {
                e.target.style.boxShadow = "0 0 10px #00ffea";
                e.target.style.transform = "scale(1)";
              }}
            >
              🖨️ Imprimir Gráfico
            </button>
          </div>
        </div>
      )}

      <ToastContainer />
    </div>
  );
}

export default App;

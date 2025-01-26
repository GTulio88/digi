import React, { useState, useEffect } from "react";
import "./App.css";
import TableComponent from "./components/TableComponent";
const API_BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://seu-dominio.vercel.app" // Substitua pelo domínio real
    : "http://localhost:5000";

function App() {
  const [showModal, setShowModal] = useState(false);
  const [showModalEdit, setShowModalEdit] = useState(false); // Controle do modal de ediçã
  const [showTable, setShowTable] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [originalClientId, setOriginalClientId] = useState("");
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

  useEffect(() => {
    if (showTable) {
      fetchData();
    }
  }, [showTable]);

  const processTableData = (data) => {
    return data.map((item) => ({
      ...item,
      date: item.date ? new Date(item.date).toISOString().split("T")[0] : "", // Normaliza o formato da data
    }));
  };

  const fetchData = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/data`);
      if (!response.ok) {
        throw new Error(`Erro ao buscar dados: ${response.status}`);
      }
      const rawData = await response.json();
      console.log("Dados brutos:", rawData);
      const processedData = processTableData(rawData);
      console.log("Dados processados:", processedData);
      setTableData(processedData);
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
    }
  };

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

      if (hours > 12) {
        alert("O número de horas não pode exceder 12.");
        return;
      }

      if (minutes > 59) {
        alert("Os minutos não podem exceder 59.");
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
        alert("O ID do cliente deve ter no máximo 7 dígitos."); // Exibe alerta
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

  const handleEdit = (row) => {
    setFormData(row); // Preenche o formulário com os dados da linha
    setOriginalClientId(row.clientId); // Armazena o ID original
    setShowModalEdit(true); // Abre o modal de edição
  };
  const handleDelete = async (row) => {
    const confirmDelete = window.confirm(
      `Tem certeza que deseja excluir o registro com ID ${row.clientId}?`
    );

    if (confirmDelete) {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/delete/${String(row.clientId)}`, // Força o tipo para string
          {
            method: "DELETE",
          }
        );

        if (!response.ok) {
          throw new Error("Erro ao excluir o registro.");
        }

        // Atualiza o estado após a exclusão
        setTableData((prevData) =>
          prevData.filter((item) => item.clientId !== row.clientId)
        );

        alert("Registro excluído com sucesso!");
      } catch (error) {
        console.error("Erro ao excluir registro:", error);
        alert("Erro ao excluir registro.");
      }
    }
  };

  const handleSaveEdit = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/update/${originalClientId}`, // Use o clientId original
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData), // Envia os dados atualizados
        }
      );

      if (!response.ok) {
        throw new Error("Erro ao atualizar o registro.");
      }

      const updatedRecord = await response.json();

      // Atualiza a tabela com os dados editados
      setTableData((prevData) =>
        prevData.map((item) =>
          item.clientId === originalClientId ? formData : item
        )
      );

      alert("Registro atualizado com sucesso!");
      setShowModalEdit(false); // Fecha o modal de edição
    } catch (error) {
      console.error("Erro ao atualizar registro:", error);
      alert("Erro ao atualizar registro.");
    }
  };

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
      alert("Por favor, insira um ID de cliente válido.");
      return;
    }

    if (currentStep < 6) setCurrentStep(currentStep + 1);
  };
  const formatDate = (date) => {
    if (!date || typeof date !== "string") {
      return "Data inválida"; // Retorne um valor padrão ou mensagem de erro
    }
    const [year, month, day] = date.split("-");
    return `${day}/${month}/${year.slice(-2)}`;
  };
  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleAddAnother = () => {
    setSubmittedClients((prev) => [...prev, formData]);
    setFormData((prev) => ({
      ...prev,
      clientId: "",
      clientAddress: "",
      serviceType: "",
      status: "",
      notes: "",
    }));
    setCurrentStep(2);
  };

  const handleCancel = () => {
    setCurrentStep(1);
    setShowModal(false);
  };

  const validateAndSubmit = async () => {
    const [hours, minutes] = formData.hoursWorked.split("h").map(Number);

    if (isNaN(hours) || isNaN(minutes)) {
      alert("Formato de horas trabalhadas inválido.");
      return;
    }

    if (hours > 12 || minutes > 59) {
      alert("Os valores de horas ou minutos são inválidos.");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clients: [...submittedClients, formData] }),
      });

      if (!response.ok) {
        throw new Error(`Erro ao enviar dados: ${response.status}`);
      }

      const data = await response.json();
      console.log("Dados enviados com sucesso:", data);

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
      setSubmittedClients([]);
    } catch (error) {
      console.error("Erro ao enviar dados:", error);
    }
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
              <option value="instalacao">Instalação</option>
              <option value="reparo">Reparo</option>
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
        <div className="service-item" onClick={() => setShowModal(true)}>
          <img src="/icons/user.png" alt="Cadastrar" className="service-icon" />
          <p className="service-text">CADASTRAR</p>
        </div>
        <div className="service-item" onClick={() => setShowTable(true)}>
          <img
            src="/icons/search.png"
            alt="Consultar"
            className="service-icon"
          />
          <p className="service-text">CONSULTAR</p>
        </div>
        <div className="service-item" onClick={() => alert("Gráfico clicado!")}>
          <img src="/icons/graph.png" alt="Gráfico" className="service-icon" />
          <p className="service-text">GRÁFICO</p>
        </div>
        <div
          className="service-item"
          onClick={() => alert("Gerar PDF clicado!")}
        >
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
                    onClick={handleAddAnother}
                  >
                    Adicionar
                  </button>
                  <button
                    type="button"
                    className="btn-submit"
                    onClick={validateAndSubmit}
                  >
                    Concluir
                  </button>
                  {selectedRow && (
                    <button
                      type="button"
                      className="btn-submit"
                      onClick={handleSaveEdit}
                    >
                      Salvar Alterações
                    </button>
                  )}
                </>
              )}
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
                  <option value="instalacao">Instalação</option>
                  <option value="reparo">Reparo</option>
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
              <button className="btn-submit" onClick={handleSaveEdit}>
                Salvar Alterações
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;

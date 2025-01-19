import React, { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [showModal, setShowModal] = useState(false);
  const [showTable, setShowTable] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    hoursWorked: "8",
    clientId: "",
    clientAddress: "",
    serviceType: "",
    status: "",
    notes: "",
  });
  const [submittedClients, setSubmittedClients] = useState([]);

  useEffect(() => {
    if (showTable) {
      fetchData();
    }
  }, [showTable]);

  const fetchData = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/data");
      if (!response.ok) {
        throw new Error(`Erro ao buscar dados: ${response.status}`);
      }
      const data = await response.json();
      setTableData(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "hoursWorked" && (isNaN(value) || value < 8 || value > 12)) {
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNext = () => {
    if (currentStep < 6) setCurrentStep(currentStep + 1);
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

  const handleSubmit = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ clients: [...submittedClients, formData] }),
      });
      const data = await response.json();
      console.log("Dados enviados com sucesso:", data);
      setShowModal(false);
      setCurrentStep(1);
      setFormData({
        date: new Date().toISOString().split("T")[0],
        hoursWorked: "8",
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
                type="number"
                name="hoursWorked"
                className="hours-worked"
                value={formData.hoursWorked}
                onChange={handleChange}
                min="8"
                max="12"
                required
              />
            </label>
          </>
        );
      case 2:
        return (
          <label>
            ID do Cliente:
            <input
              type="text"
              name="clientId"
              value={formData.clientId}
              onChange={handleChange}
              required
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
        <h1 className="header-title">SERVIÇOS</h1>
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
                    Add Cliente
                  </button>
                  <button
                    type="button"
                    className="btn-submit"
                    onClick={handleSubmit}
                  >
                    Concluir
                  </button>
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
            <table className="futuristic-table">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Horas</th>
                  <th>ID Cliente</th>
                  <th>Endereço</th>
                  <th>Serviço</th>
                  <th>Status</th>
                  <th>Observação</th>
                </tr>
              </thead>
              <tbody>
                {tableData.map((row, index) => (
                  <tr key={index}>
                    <td>{row.date}</td>
                    <td>{row.hoursWorked}</td>
                    <td>{row.clientId}</td>
                    <td>{row.clientAddress}</td>
                    <td>{row.serviceType}</td>
                    <td>{row.status}</td>
                    <td>{row.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button className="btn-cancel" onClick={() => setShowTable(false)}>
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;

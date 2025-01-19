import "./App.css";

function Services() {
  return (
    <div className="services-container">
      <h1 className="services-title">SERVIÇOS</h1>
      <div className="services-grid">
        <div className="service-item">
          <img src="/icons/client.png" alt="Cadastrar" />
          <p>Cadastrar</p>
        </div>
        <div className="service-item">
          <img src="/icons/edit.png" alt="Editar" />
          <p>Editar</p>
        </div>
        <div className="service-item">
          <img src="/icons/consultar.png" alt="Pesquisar" />
          <p>Pesquisar</p>
        </div>
        <div className="service-item">
          <img src="icons/grafico.png" alt="Gráfico" />
          <p>Gráfico</p>
        </div>
        <div className="service-item">
          <img src="/icons/report.png" alt="Relatório" />
          <p>Relatório</p>
        </div>
        <div className="service-item">
          <img src="/icons/print.png" alt="Imprimir" />
          <p>Imprimir</p>
        </div>
      </div>
    </div>
  );
}

export default Services;

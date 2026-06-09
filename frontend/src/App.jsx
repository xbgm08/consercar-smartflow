import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import ClientesPage from './pages/ClientesPage';
import FornecedoresPage from './pages/FornecedoresPage';
import FuncionariosPage from './pages/FuncionariosPage';
import InsumosPage from './pages/InsumosPage';
import SeguradorasPage from './pages/SeguradorasPage';
import ServicosPage from './pages/ServicosPage';
import TempoPage from './pages/TempoPage';
import VeiculosPage from './pages/VeiculosPage';
import FatoServicosPage from './pages/FatoServicosPage';
import FatoConsumoPage from './pages/FatoConsumoPage';
import PrevisaoEstoquePage from './pages/PrevisaoEstoquePage';
import './styles/App.css';

function App() {
  const powerBiUrl = "https://app.powerbi.com/view?r=eyJrIjoiZTlkOTA4N2QtNTZhNS00MGM0LTgyYjQtYjdiNWUxY2EyMDhjIiwidCI6IjE3MGZhMTAxLTQwODgtNDYxNy1hZTFjLTgxYjIzZGRlZjk4MyJ9";

  return (
    <BrowserRouter>
      {/* Menu Superior (Navbar) */}
      <nav className="navbar">
        <Link to="/" className="navbar-logo">SmartFlow</Link>
        <div className="navbar-links">
          <Link className="nav-link" to="/clientes">Clientes</Link>
          <Link className="nav-link" to="/fornecedores">Fornecedores</Link>
          <Link className="nav-link" to="/funcionarios">Funcionários</Link>
          <Link className="nav-link" to="/insumos">Insumos</Link>
          <Link className="nav-link" to="/seguradoras">Seguradoras</Link>
          <Link className="nav-link" to="/servicos">Serviços</Link>
          <Link className="nav-link" to="/tempo">Tempo</Link>
          <Link className="nav-link" to="/veiculos">Veículos</Link>
          <Link className="nav-link" to="/ordens-servico">Ordens de Serviço</Link>
          <Link className="nav-link" to="/consumo-insumos">Consumo de Insumos</Link>
          <Link className="nav-link" to="/previsao-estoque">Previsão de Estoque</Link>

          <a
            className="nav-link nav-link-dashboard"
            href={powerBiUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            Dashboard
          </a>
        </div>
      </nav>

      {/* Áreas das Páginas */}
      <Routes>
        <Route path="/clientes" element={<ClientesPage />} />
        <Route path="/fornecedores" element={<FornecedoresPage />} />
        <Route path="/funcionarios" element={<FuncionariosPage />} />
        <Route path="/insumos" element={<InsumosPage />} />
        <Route path="/seguradoras" element={<SeguradorasPage />} />
        <Route path="/servicos" element={<ServicosPage />} />
        <Route path="/tempo" element={<TempoPage />} />
        <Route path="/veiculos" element={<VeiculosPage />} />
        <Route path="/ordens-servico" element={<FatoServicosPage />} />
        <Route path="/consumo-insumos" element={<FatoConsumoPage />} />
        <Route path="/previsao-estoque" element={<PrevisaoEstoquePage />} />

        {/* Rota Inicial */}
        <Route path="/" element={
          <div className="home-container">
            <h1 className="home-titulo">Bem-vindo ao CONSERCAR SmartFlow</h1>
            <p className="home-subtitulo">Acompanhe os resultados da oficina em tempo real ou selecione uma opção no menu superior.</p>
            <div className="home-iframe-wrapper">
              <iframe
                title="Dashboard Consercar"
                width="100%"
                height="100%"
                src={powerBiUrl}
                frameBorder="0"
                allowFullScreen={true}>
              </iframe>
            </div>
          </div>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
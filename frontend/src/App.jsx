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
import './styles/App.css';

function App() {
  return (
    <BrowserRouter>
      {/* Menu Superior (Navbar) */}
      <nav className="navbar">
        <h2 className="navbar-logo">SmartFlow</h2>

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

        {/* Rota Inicial */}
        <Route path="/" element={
          <div className="home-container">
            <h1 className="home-titulo">Bem-vindo ao CONSERCAR SmartFlow</h1>
            <p className="home-subtitulo">Selecione uma opção no menu acima para começar a gerir a oficina.</p>
          </div>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
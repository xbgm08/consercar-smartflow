import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import ClientesPage from './pages/ClientesPage';
import './styles/App.css';

function App() {
  return (
    <BrowserRouter>
      {/* Menu Superior (Navbar) */}
      <nav className="navbar">
        <h2 className="navbar-logo">SmartFlow</h2>
        
        <div className="navbar-links">
          <Link className="nav-link" to="/clientes">Clientes</Link>
        </div>
      </nav>

      {/* Áreas das Páginas */}
      <Routes>
        <Route path="/clientes" element={<ClientesPage />} />
        
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
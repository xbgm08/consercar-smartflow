import React, { useState, useEffect } from 'react';
import api from '../services/api';
import '../styles/ClientesPage.css';

export default function ClientesPage() {
  const [clientes, setClientes] = useState([]);
  const [editId, setEditId] = useState(null);
  const [popup, setPopup] = useState({ visivel: false, mensagem: '', tipo: '' });
  const [formData, setFormData] = useState({
    nome: '',
    cpf: '',
    email: '',
    telefone: '',
    rua: '',
    numero: '',
    bairro: '',
    cep: '',
    municipio: '',
    uf: ''
  });

  useEffect(() => {
    carregarClientes();
  }, []);

  const mostrarPopup = (mensagem, tipo) => {
    setPopup({ visivel: true, mensagem, tipo });
    setTimeout(() => {
      setPopup({ visivel: false, mensagem: '', tipo: '' });
    }, 3000);
  };

  const carregarClientes = async () => {
    try {
      const response = await api.get('/clientes/');
      setClientes(response.data);
    } catch (error) {
      console.error("Erro ao procurar clientes", error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await api.put(`/clientes/${editId}`, formData);
        mostrarPopup('Cliente atualizado com sucesso!', 'sucesso');
      } else {
        await api.post('/clientes/', formData);
        mostrarPopup('Cliente gravado com sucesso!', 'sucesso');
      }

      setFormData({
        nome: '', cpf: '', email: '', telefone: '',
        rua: '', numero: '', bairro: '', cep: '', municipio: '', uf: ''
      });
      setEditId(null);
      carregarClientes();
    } catch (error) {
      const msgErro = error.response?.data?.detail || "Erro ao gravar cliente. Verifique os dados.";
      mostrarPopup(msgErro, 'erro');
      console.error("Erro ao gravar cliente", error);
    }
  };

  const handleEdit = (cliente) => {
    setFormData({
      nome: cliente.nome || '',
      cpf: cliente.cpf || '',
      email: cliente.email || '',
      telefone: cliente.telefone || '',
      rua: cliente.rua || '',
      numero: cliente.numero || '',
      bairro: cliente.bairro || '',
      cep: cliente.cep || '',
      municipio: cliente.municipio || '',
      uf: cliente.uf || ''
    });
    setEditId(cliente.cliente_key);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Tem a certeza que deseja excluir este cliente?")) {
      try {
        await api.delete(`/clientes/${id}`);
        mostrarPopup('Cliente excluido com sucesso!', 'sucesso');
        carregarClientes();
      } catch (error) {
        mostrarPopup("Erro ao excluir cliente. Pode estar associado a um serviço.", 'erro');
        console.error("Erro ao excluir cliente", error);
      }
    }
  };

  const popupStyle = {
    position: 'fixed',
    top: '20px',
    right: '20px',
    padding: '15px 25px',
    borderRadius: '8px',
    color: 'white',
    fontWeight: 'bold',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    zIndex: 1000,
    transition: 'opacity 0.3s ease-in-out',
    opacity: popup.visivel ? 1 : 0,
    pointerEvents: popup.visivel ? 'auto' : 'none',
    backgroundColor: popup.tipo === 'sucesso' ? '#0f766e' : '#dc2626',
  };

  return (
    <div className="clientes-container">
      
      <div style={popupStyle}>
        {popup.tipo === 'sucesso' ? '✅ ' : '⚠️ '}
        {popup.mensagem}
      </div>

      <h1 className="clientes-titulo">Gestão de Clientes</h1>
      <p className="clientes-subtitulo">Registe e gira os dados dos clientes da oficina</p>

      {/* Formulário */}
      <div className="clientes-card-form">
        <h2 className="clientes-form-titulo">
          {editId ? 'Editar Cliente' : 'Novo Cliente'}
        </h2>

        <form onSubmit={handleSubmit}>

          {/* Dados Pessoais */}
          <h3 className="clientes-form-section-titulo">Dados Pessoais</h3>
          <div className="clientes-grid">
            <input
              type="text" name="nome" placeholder="Nome Completo"
              value={formData.nome} onChange={handleChange} required
              className="clientes-input"
            />
            <input
              type="text" name="cpf" placeholder="CPF (Apenas números)"
              value={formData.cpf} onChange={handleChange} required maxLength="11"
              className="clientes-input"
            />
            <input
              type="text" name="telefone" placeholder="Telefone"
              value={formData.telefone} onChange={handleChange}
              className="clientes-input"
            />
            <input
              type="email" name="email" placeholder="E-mail"
              value={formData.email} onChange={handleChange}
              className="clientes-input"
            />
          </div>

          {/* Endereço */}
          <h3 className="clientes-form-section-titulo">Endereço</h3>
          <div className="clientes-grid">
            <input
              type="text" name="cep" placeholder="CEP"
              value={formData.cep} onChange={handleChange} maxLength="8"
              className="clientes-input"
            />
            <input
              type="text" name="rua" placeholder="Rua / Avenida"
              value={formData.rua} onChange={handleChange}
              className="clientes-input"
            />
            <input
              type="text" name="numero" placeholder="Número"
              value={formData.numero} onChange={handleChange}
              className="clientes-input"
            />
            <input
              type="text" name="bairro" placeholder="Bairro"
              value={formData.bairro} onChange={handleChange}
              className="clientes-input"
            />
            <input
              type="text" name="municipio" placeholder="Município / Cidade"
              value={formData.municipio} onChange={handleChange}
              className="clientes-input"
            />
            <input
              type="text" name="uf" placeholder="UF (Ex: SP)"
              value={formData.uf} onChange={handleChange} maxLength="2"
              className="clientes-input clientes-input-uf" 
            />
          </div>

          <div className="clientes-botoes">
            {editId && (
              <button
                type="button"
                onClick={() => {
                  setEditId(null);
                  setFormData({ nome: '', cpf: '', email: '', telefone: '', rua: '', numero: '', bairro: '', cep: '', municipio: '', uf: '' });
                }}
                className="clientes-btn-cancelar"
              >
                Cancelar
              </button>
            )}
            <button type="submit" className="clientes-btn-salvar">
              {editId ? 'Atualizar Cliente' : 'Salvar Cliente'}
            </button>
          </div>
        </form>
      </div>

      {/* Tabela */}
      <div className="clientes-card-tabela">
        <table className="clientes-tabela">
          <thead>
            <tr>
              <th>Nome</th>
              <th>CPF</th>
              <th>Contato</th>
              <th>Cidade/UF</th>
              <th className="clientes-th-acoes">Ações</th>
            </tr>
          </thead>
          <tbody>
            {clientes.length > 0 ? (
              clientes.map((cliente) => (
                <tr key={cliente.cliente_key} className="clientes-linha">
                  <td className="clientes-td-nome">{cliente.nome}</td>
                  <td>{cliente.cpf}</td>
                  <td>
                    {cliente.telefone} <br />
                    <span className="clientes-td-email">{cliente.email}</span>
                  </td>
                  <td>{cliente.municipio ? `${cliente.municipio} - ${cliente.uf}` : '-'}</td>
                  <td className="clientes-td-acoes">
                    <button onClick={() => handleEdit(cliente)} className="btn-acao-editar">Editar</button>
                    <span className="clientes-separador">|</span>
                    <button onClick={() => handleDelete(cliente.cliente_key)} className="btn-acao-excluir">Excluir</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="clientes-td-vazia">
                  Nenhum cliente encontrado. Comece a efetuar os registos!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
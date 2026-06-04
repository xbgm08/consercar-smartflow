import React, { useState, useEffect } from 'react';
import api from '../services/api';
import '../styles/ClientesPage.css';

export default function ClientesPage() {
  const [clientes, setClientes] = useState([]);
  const [formData, setFormData] = useState({
    nome: '',
    cpf_cnpj: '',
    telefone: '',
    email: ''
  });
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    carregarClientes();
  }, []);

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
      } else {
        await api.post('/clientes/', formData);
      }
      setFormData({ nome: '', cpf_cnpj: '', telefone: '', email: '' });
      setEditId(null);
      carregarClientes();
    } catch (error) {
      console.error("Erro ao guardar cliente", error);
    }
  };

  const handleEdit = (cliente) => {
    setFormData({
      nome: cliente.nome || '',
      cpf_cnpj: cliente.cpf_cnpj || '',
      telefone: cliente.telefone || '',
      email: cliente.email || ''
    });
    setEditId(cliente.cliente_key); // Utilizamos a chave primária do seu modelo
  };

  const handleDelete = async (id) => {
    if (window.confirm("Tem a certeza que deseja excluir este cliente?")) {
      try {
        await api.delete(`/clientes/${id}`);
        carregarClientes();
      } catch (error) {
        console.error("Erro ao eliminar", error);
      }
    }
  };

  return (
    <div className="clientes-container">
      <h1 className="clientes-titulo">Gestão de Clientes</h1>
      <p className="clientes-subtitulo">Registe e gira os dados dos clientes da oficina</p>

      {/* Formulário */}
      <div className="clientes-card-form">
        <h2 style={{ color: '#1e3a8a', marginBottom: '1rem' }}>
          {editId ? 'Editar Cliente' : 'Novo Cliente'}
        </h2>
        
        <form onSubmit={handleSubmit}>
          <div className="clientes-grid">
            <input 
              type="text" name="nome" placeholder="Nome Completo / Empresa" 
              value={formData.nome} onChange={handleChange} required
              className="clientes-input"
            />
            <input 
              type="text" name="cpf_cnpj" placeholder="CPF ou CNPJ" 
              value={formData.cpf_cnpj} onChange={handleChange} required
              className="clientes-input"
            />
            <input 
              type="text" name="telefone" placeholder="Telefone" 
              value={formData.telefone} onChange={handleChange} required
              className="clientes-input"
            />
            <input 
              type="email" name="email" placeholder="E-mail" 
              value={formData.email} onChange={handleChange} required
              className="clientes-input"
            />
          </div>

          <div className="clientes-botoes">
            {editId && (
              <button 
                type="button" 
                onClick={() => { setEditId(null); setFormData({nome: '', cpf_cnpj: '', telefone: '', email: ''}) }}
                className="clientes-btn-cancelar"
              >
                Cancelar
              </button>
            )}
            <button type="submit" className="clientes-btn-salvar">
              {editId ? 'Atualizar Cliente' : 'Guardar Cliente'}
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
              <th>CPF/CNPJ</th>
              <th>Telefone</th>
              <th>E-mail</th>
              <th style={{ textAlign: 'center' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {clientes.length > 0 ? (
              clientes.map((cliente) => (
                <tr key={cliente.cliente_key} className="clientes-linha">
                  <td style={{ fontWeight: 'bold', color: '#1e3a8a' }}>{cliente.nome}</td>
                  <td>{cliente.cpf_cnpj}</td>
                  <td>{cliente.telefone}</td>
                  <td>{cliente.email}</td>
                  <td style={{ textAlign: 'center' }}>
                    <button onClick={() => handleEdit(cliente)} className="btn-acao-editar">Editar</button>
                    <span style={{ color: '#cbd5e1' }}>|</span>
                    <button onClick={() => handleDelete(cliente.cliente_key)} className="btn-acao-excluir">Excluir</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
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
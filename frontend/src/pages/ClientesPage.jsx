import React, { useState, useEffect } from 'react';
import api from '../services/api';
import '../styles/ClientesPage.css';

export default function ClientesPage() {
  const [clientes, setClientes] = useState([]);
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

      setFormData({
        nome: '', cpf: '', email: '', telefone: '',
        rua: '', numero: '', bairro: '', cep: '', municipio: '', uf: ''
      });
      setEditId(null);
      carregarClientes();
    } catch (error) {
      console.error("Erro ao guardar cliente", error);
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

          {/* Dados Pessoais */}
          <h3 style={{ fontSize: '1rem', color: '#64748b', marginBottom: '0.5rem' }}>Dados Pessoais</h3>
          <div className="clientes-grid" style={{ marginBottom: '1.5rem' }}>
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
          <h3 style={{ fontSize: '1rem', color: '#64748b', marginBottom: '0.5rem' }}>Endereço</h3>
          <div className="clientes-grid" style={{ marginBottom: '1.5rem' }}>
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
              className="clientes-input" style={{ textTransform: 'uppercase' }}
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
              {editId ? 'Atualizar Cliente' : 'Guardar Cliente'}
            </button>
          </div>
        </form>
      </div>

      {/* Tabela */}
      <div className="clientes-card-tabela" style={{ overflowX: 'auto' }}>
        <table className="clientes-tabela">
          <thead>
            <tr>
              <th>Nome</th>
              <th>CPF</th>
              <th>Contato</th>
              <th>Cidade/UF</th>
              <th style={{ textAlign: 'center' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {clientes.length > 0 ? (
              clientes.map((cliente) => (
                <tr key={cliente.cliente_key} className="clientes-linha">
                  <td style={{ fontWeight: 'bold', color: '#1e3a8a' }}>{cliente.nome}</td>
                  <td>{cliente.cpf}</td>
                  <td>
                    {cliente.telefone} <br />
                    <span style={{ fontSize: '0.85rem', color: '#64748b' }}>{cliente.email}</span>
                  </td>
                  <td>{cliente.municipio ? `${cliente.municipio} - ${cliente.uf}` : '-'}</td>
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
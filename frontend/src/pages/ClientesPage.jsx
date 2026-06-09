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
      console.error("Erro ao salvar cliente", error);
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
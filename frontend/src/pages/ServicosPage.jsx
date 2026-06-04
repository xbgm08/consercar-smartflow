import React, { useState, useEffect } from 'react';
import api from '../services/api';
import '../styles/ServicosPage.css';

export default function ServicosPage() {
  const [servicos, setServicos] = useState([]);
  const [formData, setFormData] = useState({
    nome_servico: '',
    descricao: '',
    preco_base: '',
    tempo_estimado_horas: ''
  });
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    carregarServicos();
  }, []);

  const carregarServicos = async () => {
    try {
      const response = await api.get('/servicos/');
      setServicos(response.data);
    } catch (error) {
      console.error("Erro ao procurar serviços", error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await api.put(`/servicos/${editId}`, formData);
      } else {
        await api.post('/servicos/', formData);
      }
      setFormData({ nome_servico: '', descricao: '', preco_base: '', tempo_estimado_horas: '' });
      setEditId(null);
      carregarServicos();
    } catch (error) {
      console.error("Erro ao guardar serviço", error);
    }
  };

  const handleEdit = (servico) => {
    setFormData({
      nome_servico: servico.nome_servico || '',
      descricao: servico.descricao || '',
      preco_base: servico.preco_base || '',
      tempo_estimado_horas: servico.tempo_estimado_horas || ''
    });
    setEditId(servico.servico_key);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Tem a certeza que deseja eliminar este serviço?")) {
      try {
        await api.delete(`/servicos/${id}`);
        carregarServicos();
      } catch (error) {
        console.error("Erro ao eliminar", error);
      }
    }
  };

  return (
    <div className="servicos-container">
      <h1 className="servicos-titulo">Catálogo de Serviços</h1>
      <p className="servicos-subtitulo">Faça a gestão dos serviços prestados, preços base e tempos estimados</p>

      {/* Formulário */}
      <div className="servicos-card-form">
        <h2 style={{ color: '#1e3a8a', marginBottom: '1rem' }}>
          {editId ? 'Editar Serviço' : 'Novo Serviço'}
        </h2>
        
        <form onSubmit={handleSubmit}>
          <div className="servicos-grid">
            <input 
              type="text" name="nome_servico" placeholder="Nome do Serviço (Ex: Revisão Geral)" 
              value={formData.nome_servico} onChange={handleChange} required
              className="servicos-input"
            />
            <input 
              type="text" name="descricao" placeholder="Descrição / Categoria" 
              value={formData.descricao} onChange={handleChange} required
              className="servicos-input"
            />
            <input 
              type="number" step="0.01" name="preco_base" placeholder="Preço Base (R$)" 
              value={formData.preco_base} onChange={handleChange} required
              className="servicos-input"
            />
            <input 
              type="number" step="0.1" name="tempo_estimado_horas" placeholder="Tempo Estimado (Horas)" 
              value={formData.tempo_estimado_horas} onChange={handleChange} required
              className="servicos-input"
            />
          </div>

          <div className="servicos-botoes">
            {editId && (
              <button 
                type="button" 
                onClick={() => { setEditId(null); setFormData({nome_servico: '', descricao: '', preco_base: '', tempo_estimado_horas: ''}) }}
                className="servicos-btn-cancelar"
              >
                Cancelar
              </button>
            )}
            <button type="submit" className="servicos-btn-salvar">
              {editId ? 'Atualizar Serviço' : 'Guardar Serviço'}
            </button>
          </div>
        </form>
      </div>

      {/* Tabela */}
      <div className="servicos-card-tabela">
        <table className="servicos-tabela">
          <thead>
            <tr>
              <th>Serviço</th>
              <th>Descrição</th>
              <th>Preço Base</th>
              <th>Tempo Estimado</th>
              <th style={{ textAlign: 'center' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {servicos.length > 0 ? (
              servicos.map((servico) => (
                <tr key={servico.servico_key} className="servicos-linha">
                  <td style={{ fontWeight: 'bold', color: '#1e3a8a' }}>{servico.nome_servico}</td>
                  <td>{servico.descricao}</td>
                  <td style={{ fontWeight: 'bold', color: '#059669' }}>
                    R$ {Number(servico.preco_base).toFixed(2)}
                  </td>
                  <td>{servico.tempo_estimado_horas}h</td>
                  <td style={{ textAlign: 'center' }}>
                    <button onClick={() => handleEdit(servico)} className="btn-acao-editar">Editar</button>
                    <span style={{ color: '#cbd5e1' }}>|</span>
                    <button onClick={() => handleDelete(servico.servico_key)} className="btn-acao-excluir">Eliminar</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
                  Nenhum serviço registado. Crie o seu primeiro serviço!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
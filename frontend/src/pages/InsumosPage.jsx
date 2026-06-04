import React, { useState, useEffect } from 'react';
import api from '../services/api';
import '../styles/InsumosPage.css';

export default function InsumosPage() {
  const [insumos, setInsumos] = useState([]);
  const [formData, setFormData] = useState({
    codigo_sku: '',
    nome_insumo: '',
    categoria: '',
    unidade_medida: ''
  });
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    carregarInsumos();
  }, []);

  const carregarInsumos = async () => {
    try {
      const response = await api.get('/insumos/');
      setInsumos(response.data);
    } catch (error) {
      console.error("Erro ao procurar insumos", error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        // Atualizar (PUT)
        await api.put(`/insumos/${editId}`, formData);
      } else {
        // Criar (POST)
        await api.post('/insumos/', formData);
      }
      setFormData({ codigo_sku: '', nome_insumo: '', categoria: '', unidade_medida: '' });
      setEditId(null);
      carregarInsumos();
    } catch (error) {
      console.error("Erro ao guardar insumo", error);
      alert("Ocorreu um erro ao guardar. Verifique a consola.");
    }
  };

  const handleEdit = (insumo) => {
    setFormData({
      codigo_sku: insumo.codigo_sku || '',
      nome_insumo: insumo.nome_insumo || '',
      categoria: insumo.categoria || '',
      unidade_medida: insumo.unidade_medida || ''
    });
    setEditId(insumo.insumo_key);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Tem a certeza que deseja excluir este insumo?")) {
      try {
        await api.delete(`/insumos/${id}`);
        carregarInsumos();
      } catch (error) {
        console.error("Erro ao eliminar", error);
      }
    }
  };

  return (
    <div className="insumos-container">
      <h1 className="insumos-titulo">Gestão de Insumos</h1>
      <p className="insumos-subtitulo">Cadastre tintas, lixas, vernizes e outras peças de reposição</p>

      {/* Cartão do Formulário */}
      <div className="insumos-card-form">
        <h2 style={{ color: '#1e3a8a', marginBottom: '1rem' }}>
          {editId ? 'Editar Insumo' : 'Novo Insumo'}
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="insumos-grid">
            <input
              type="text" name="codigo_sku" placeholder="SKU (Ex: TNT-001)"
              value={formData.codigo_sku} onChange={handleChange} required
              className="insumos-input"
            />
            <input
              type="text" name="nome_insumo" placeholder="Nome (Ex: Tinta Branca)"
              value={formData.nome_insumo} onChange={handleChange} required
              className="insumos-input"
            />
            <input
              type="text" name="categoria" placeholder="Categoria (Ex: Pintura)"
              value={formData.categoria} onChange={handleChange} required
              className="insumos-input"
            />
            <input
              type="text" name="unidade_medida" placeholder="Medida (Ex: Litro)"
              value={formData.unidade_medida} onChange={handleChange} required
              className="insumos-input"
            />
          </div>

          <div className="insumos-botoes">
            {editId && (
              <button
                type="button"
                onClick={() => { setEditId(null); setFormData({ codigo_sku: '', nome_insumo: '', categoria: '', unidade_medida: '' }) }}
                className="insumos-btn-cancelar"
              >
                Cancelar
              </button>
            )}
            <button type="submit" className="insumos-btn-salvar">
              {editId ? 'Atualizar Insumo' : 'Guardar Insumo'}
            </button>
          </div>
        </form>
      </div>

      {/* Cartão da Tabela */}
      <div className="insumos-card-tabela">
        <table className="insumos-tabela">
          <thead>
            <tr>
              <th>SKU</th>
              <th>Nome do Insumo</th>
              <th>Categoria</th>
              <th>Medida</th>
              <th style={{ textAlign: 'center' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {insumos.length > 0 ? (
              insumos.map((insumo) => (
                <tr key={insumo.insumo_key} className="insumos-linha">
                  <td style={{ fontWeight: 'bold', color: '#64748b' }}>{insumo.codigo_sku}</td>
                  <td style={{ fontWeight: 'bold', color: '#1e3a8a' }}>{insumo.nome_insumo}</td>
                  <td>{insumo.categoria}</td>
                  <td>{insumo.unidade_medida}</td>
                  <td style={{ textAlign: 'center' }}>
                    <button onClick={() => handleEdit(insumo)} className="btn-acao-editar">Editar</button>
                    <span style={{ color: '#cbd5e1' }}>|</span>
                    <button onClick={() => handleDelete(insumo.insumo_key)} className="btn-acao-excluir">Excluir</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
                  O stock está vazio. Registe o seu primeiro insumo!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
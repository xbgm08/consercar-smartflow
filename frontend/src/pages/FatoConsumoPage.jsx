import React, { useState, useEffect } from 'react';
import api from '../services/api';
import '../styles/FatoConsumoPage.css';

export default function FatoConsumoPage() {
  const [fatos, setFatos] = useState([]);
  const [servicos, setServicos] = useState([]);
  const [veiculos, setVeiculos] = useState([]);
  const [insumos, setInsumos] = useState([]);
  const [fornecedores, setFornecedores] = useState([]);
  const [funcionarios, setFuncionarios] = useState([]);
  const [editId, setEditId] = useState(null);
  const [popup, setPopup] = useState({ visivel: false, mensagem: '', tipo: '' });
  const [formData, setFormData] = useState({
    servico_key: '',
    veiculo_key: '',
    insumo_key: '',
    fornecedor_key: '',
    funcionario_key: '',
    quantidade_prevista: '',
    quantidade_real: '',
    desperdicio: '',
    custo_unitario: '',
    custo_total_insumo: ''
  });


  useEffect(() => {
    carregarFatos();
    carregarDimensoes();
  }, []);

  const mostrarPopup = (mensagem, tipo) => {
    setPopup({ visivel: true, mensagem, tipo });
    setTimeout(() => {
      setPopup({ visivel: false, mensagem: '', tipo: '' });
    }, 3000);
  };

  const carregarFatos = async () => {
    try {
      const response = await api.get('/fato-consumo/');
      setFatos(response.data);
    } catch (error) {
      console.error("Erro ao procurar histórico de consumo", error);
    }
  };

  const carregarDimensoes = async () => {
    try {
      const resServicos = await api.get('/servicos/');
      setServicos(resServicos.data);

      const resVeiculos = await api.get('/veiculos/');
      setVeiculos(resVeiculos.data);

      const resInsumos = await api.get('/insumos/');
      setInsumos(resInsumos.data);

      const resFornecedores = await api.get('/fornecedores/');
      setFornecedores(resFornecedores.data);

      const resFuncionarios = await api.get('/funcionarios/');
      setFuncionarios(resFuncionarios.data);
    } catch (error) {
      console.error("Erro ao carregar dimensões para o formulário", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      if (name === 'quantidade_real' || name === 'custo_unitario') {
        const qtd = parseFloat(newData.quantidade_real || 0);
        const custo = parseFloat(newData.custo_unitario || 0);
        if (qtd > 0 && custo > 0) {
          newData.custo_total_insumo = (qtd * custo).toFixed(2);
        }
      }
      return newData;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        servico_key: parseInt(formData.servico_key),
        veiculo_key: parseInt(formData.veiculo_key),
        insumo_key: parseInt(formData.insumo_key),
        fornecedor_key: parseInt(formData.fornecedor_key),
        funcionario_key: parseInt(formData.funcionario_key),
        quantidade_prevista: parseFloat(formData.quantidade_prevista),
        quantidade_real: parseFloat(formData.quantidade_real),
        desperdicio: parseFloat(formData.desperdicio),
        custo_unitario: parseFloat(formData.custo_unitario),
        custo_total_insumo: parseFloat(formData.custo_total_insumo),
        tempo_key: parseInt(new Date().toISOString().slice(0, 10).replace(/-/g, ''))
      };

      if (editId) {
        await api.put(`/fato-consumo/${editId}`, payload);
        mostrarPopup('Registo de consumo atualizado com sucesso!', 'sucesso');
      } else {
        await api.post('/fato-consumo/', payload);
        mostrarPopup('Registo de consumo gravado com sucesso!', 'sucesso');
      }

      setFormData({
        servico_key: '', veiculo_key: '', insumo_key: '', fornecedor_key: '', funcionario_key: '',
        quantidade_prevista: '', quantidade_real: '', desperdicio: '', custo_unitario: '', custo_total_insumo: ''
      });
      setEditId(null);
      carregarFatos();
    } catch (error) {
      const msgErro = error.response?.data?.detail || "Erro inesperado ao salvar o registo de consumo.";
      mostrarPopup(msgErro, 'erro');
      console.error("Erro ao salvar registo de consumo", error);
    }
  };

  const handleEdit = (fato) => {
    setFormData({
      servico_key: fato.servico_key || '',
      veiculo_key: fato.veiculo_key || '',
      insumo_key: fato.insumo_key || '',
      fornecedor_key: fato.fornecedor_key || '',
      funcionario_key: fato.funcionario_key || '',
      quantidade_prevista: fato.quantidade_prevista || '',
      quantidade_real: fato.quantidade_real || '',
      desperdicio: fato.desperdicio || '',
      custo_unitario: fato.custo_unitario || '',
      custo_total_insumo: fato.custo_total_insumo || ''
    });
    setEditId(fato.fato_consumo_key);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Tem a certeza que deseja excluir este registo de consumo?")) {
      try {
        await api.delete(`/fato-consumo/${id}`);
        mostrarPopup('Registo de consumo excluido com sucesso!', 'sucesso');
        carregarFatos();
      } catch (error) {
        mostrarPopup('Erro ao excluir o registo de consumo.', 'erro');
        console.error("Erro ao excluir registo de consumo", error);
      }
    }
  };

  const getNomeInsumo = (id) => insumos.find(i => i.insumo_key === id)?.nome_insumo || id;
  const getDescricaoServico = (id) => servicos.find(s => s.servico_key === id)?.descricao_servico || id;

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
    <div className="fato-consumo-container">

      <div style={popupStyle}>
        {popup.tipo === 'sucesso' ? '✅ ' : '⚠️ '}
        {popup.mensagem}
      </div>

      <h1 className="fato-consumo-titulo">Consumo de Insumos</h1>
      <p className="fato-consumo-subtitulo">Registe os materiais gastos nos serviços para alimentar a IA</p>

      {/* Formulário */}
      <div className="fato-consumo-card-form">
        <h2 className="fato-consumo-form-titulo">
          {editId ? 'Editar Consumo' : 'Novo Registo de Consumo'}
        </h2>

        <form onSubmit={handleSubmit}>

          <h3 className="fato-consumo-form-section-titulo">Relacionamentos (Dimensões)</h3>
          <div className="fato-consumo-grid">
            <select name="servico_key" value={formData.servico_key} onChange={handleChange} required className="fato-consumo-input">
              <option value="">Serviço Realizado</option>
              {servicos.map(s => <option key={s.servico_key} value={s.servico_key}>{s.descricao_servico}</option>)}
            </select>

            <select name="veiculo_key" value={formData.veiculo_key} onChange={handleChange} required className="fato-consumo-input">
              <option value="">Veículo</option>
              {veiculos.map(v => <option key={v.veiculo_key} value={v.veiculo_key}>{v.placa} ({v.modelo})</option>)}
            </select>

            <select name="insumo_key" value={formData.insumo_key} onChange={handleChange} required className="fato-consumo-input">
              <option value="">Insumo Utilizado</option>
              {insumos.map(i => <option key={i.insumo_key} value={i.insumo_key}>{i.nome_insumo}</option>)}
            </select>

            <select name="fornecedor_key" value={formData.fornecedor_key} onChange={handleChange} required className="fato-consumo-input">
              <option value="">Fornecedor</option>
              {fornecedores.map(f => <option key={f.fornecedor_key} value={f.fornecedor_key}>{f.razao_social}</option>)}
            </select>

            <select name="funcionario_key" value={formData.funcionario_key} onChange={handleChange} required className="fato-consumo-input">
              <option value="">Mecânico</option>
              {funcionarios.map(f => <option key={f.funcionario_key} value={f.funcionario_key}>{f.nome_tecnico}</option>)}
            </select>
          </div>

          <h3 className="fato-consumo-form-section-titulo">Quantidades e Custos (Fatos)</h3>
          <div className="fato-consumo-grid">
            <input
              type="number" step="0.01" name="quantidade_prevista" placeholder="Qtd. Prevista"
              value={formData.quantidade_prevista} onChange={handleChange} required
              className="fato-consumo-input"
            />
            <input
              type="number" step="0.01" name="quantidade_real" placeholder="Qtd. Realmente Usada"
              value={formData.quantidade_real} onChange={handleChange} required
              className="fato-consumo-input"
            />
            <input
              type="number" step="0.01" name="desperdicio" placeholder="Desperdício (Perda)"
              value={formData.desperdicio} onChange={handleChange} required
              className="fato-consumo-input"
            />
            <input
              type="number" step="0.01" name="custo_unitario" placeholder="Custo Unitário (R$)"
              value={formData.custo_unitario} onChange={handleChange} required
              className="fato-consumo-input"
            />
            <input
              type="number" step="0.01" name="custo_total_insumo" placeholder="Custo Total (R$)"
              value={formData.custo_total_insumo} onChange={handleChange} required
              className="fato-consumo-input"
            />
          </div>

          <div className="fato-consumo-botoes">
            {editId && (
              <button type="button" onClick={() => { setEditId(null); setFormData({ servico_key: '', veiculo_key: '', insumo_key: '', fornecedor_key: '', funcionario_key: '', quantidade_prevista: '', quantidade_real: '', desperdicio: '', custo_unitario: '', custo_total_insumo: '' }); }} className="fato-consumo-btn-cancelar">
                Cancelar
              </button>
            )}
            <button type="submit" className="fato-consumo-btn-salvar">
              {editId ? 'Atualizar Registo' : 'Salvar Consumo'}
            </button>
          </div>
        </form>
      </div>

      {/* Tabela */}
      <div className="fato-consumo-card-tabela">
        <table className="fato-consumo-tabela">
          <thead>
            <tr>
              <th>ID</th>
              <th>Serviço</th>
              <th>Insumo</th>
              <th>Qtd. Real</th>
              <th>Custo Total</th>
              <th className="fato-consumo-th-acoes">Ações</th>
            </tr>
          </thead>
          <tbody>
            {fatos.length > 0 ? (
              fatos.map((fato) => (
                <tr key={fato.fato_consumo_key} className="fato-consumo-linha">
                  <td className="fato-consumo-td-destaque"># {fato.fato_consumo_key}</td>
                  <td>{getDescricaoServico(fato.servico_key)}</td>
                  <td>{getNomeInsumo(fato.insumo_key)}</td>
                  <td>{fato.quantidade_real}</td>
                  <td>R$ {fato.custo_total_insumo}</td>
                  <td className="fato-consumo-td-acoes">
                    <button onClick={() => handleEdit(fato)} className="btn-acao-editar">Editar</button>
                    <span className="fato-consumo-separador">|</span>
                    <button onClick={() => handleDelete(fato.fato_consumo_key)} className="btn-acao-excluir">Excluir</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="fato-consumo-td-vazia">
                  Nenhum histórico de consumo encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
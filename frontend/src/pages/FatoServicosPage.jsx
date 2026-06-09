import React, { useState, useEffect } from 'react';
import api from '../services/api';
import '../styles/FatoServicosPage.css';

export default function FatoServicosPage() {
  const [fatos, setFatos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [veiculos, setVeiculos] = useState([]);
  const [servicos, setServicos] = useState([]);
  const [funcionarios, setFuncionarios] = useState([]);
  const [seguradoras, setSeguradoras] = useState([]);

  const [formData, setFormData] = useState({
    cliente_key: '',
    veiculo_key: '',
    servico_key: '',
    funcionario_key: '',
    seguradora_key: '',
    valor_total_servico: '',
    valor_pecas: '',
    custo_mao_obra: '',
    duracao_servico_dias: ''
  });

  const [editId, setEditId] = useState(null);

  useEffect(() => {
    carregarFatos();
    carregarDimensoes();
  }, []);

  const carregarFatos = async () => {
    try {
      const response = await api.get('/fato-servicos/');
      setFatos(response.data);
    } catch (error) {
      console.error("Erro ao procurar ordens de serviço", error);
    }
  };

  const carregarDimensoes = async () => {
    try {
      const resClientes = await api.get('/clientes/');
      setClientes(resClientes.data);

      const resVeiculos = await api.get('/veiculos/');
      setVeiculos(resVeiculos.data);

      const resServicos = await api.get('/servicos/');
      setServicos(resServicos.data);

      const resFuncionarios = await api.get('/funcionarios/');
      setFuncionarios(resFuncionarios.data);

      const resSeguradoras = await api.get('/seguradoras/');
      setSeguradoras(resSeguradoras.data);
    } catch (error) {
      console.error("Erro ao carregar dimensões para o formulário", error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        cliente_key: parseInt(formData.cliente_key),
        veiculo_key: parseInt(formData.veiculo_key),
        servico_key: parseInt(formData.servico_key),
        funcionario_key: parseInt(formData.funcionario_key),
        seguradora_key: parseInt(formData.seguradora_key),
        valor_total_servico: parseFloat(formData.valor_total_servico),
        valor_pecas: parseFloat(formData.valor_pecas),
        custo_mao_obra: parseFloat(formData.custo_mao_obra),
        duracao_servico_dias: parseInt(formData.duracao_servico_dias),
        tempo_key: parseInt(new Date().toISOString().slice(0, 10).replace(/-/g, ''))
      };

      if (editId) {
        await api.put(`/fato-servicos/${editId}`, payload);
      } else {
        await api.post('/fato-servicos/', payload);
      }

      setFormData({
        cliente_key: '', veiculo_key: '', servico_key: '', funcionario_key: '', seguradora_key: '',
        valor_total_servico: '', valor_pecas: '', custo_mao_obra: '', duracao_servico_dias: ''
      });
      setEditId(null);
      carregarFatos();
    } catch (error) {
      console.error("Erro ao guardar ordem de serviço", error);
    }
  };

  const handleEdit = (fato) => {
    setFormData({
      cliente_key: fato.cliente_key || '',
      veiculo_key: fato.veiculo_key || '',
      servico_key: fato.servico_key || '',
      funcionario_key: fato.funcionario_key || '',
      seguradora_key: fato.seguradora_key || '',
      valor_total_servico: fato.valor_total_servico || '',
      valor_pecas: fato.valor_pecas || '',
      custo_mao_obra: fato.custo_mao_obra || '',
      duracao_servico_dias: fato.duracao_servico_dias || ''
    });
    setEditId(fato.fato_key);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Tem a certeza que deseja excluir esta Ordem de Serviço?")) {
      try {
        await api.delete(`/fato-servicos/${id}`);
        carregarFatos();
      } catch (error) {
        console.error("Erro ao eliminar", error);
      }
    }
  };

  const getNomeCliente = (id) => clientes.find(c => c.cliente_key === id)?.nome || id;
  const getDescricaoServico = (id) => servicos.find(s => s.servico_key === id)?.descricao_servico || id;

  return (
    <div className="fato-servicos-container">
      <h1 className="fato-servicos-titulo">Ordens de Serviço</h1>
      <p className="fato-servicos-subtitulo">Registe e gira os serviços (Tabela Fato) realizados na oficina</p>

      {/* Formulário */}
      <div className="fato-servicos-card-form">
        <h2 className="fato-servicos-form-titulo">
          {editId ? 'Editar Ordem de Serviço' : 'Nova Ordem de Serviço'}
        </h2>

        <form onSubmit={handleSubmit}>

          <h3 className="fato-servicos-form-section-titulo">Identificação (Dimensões)</h3>
          <div className="fato-servicos-grid">
            <select name="cliente_key" value={formData.cliente_key} onChange={handleChange} required className="fato-servicos-input">
              <option value="">Selecione o Cliente</option>
              {clientes.map(c => <option key={c.cliente_key} value={c.cliente_key}>{c.nome}</option>)}
            </select>

            <select name="veiculo_key" value={formData.veiculo_key} onChange={handleChange} required className="fato-servicos-input">
              <option value="">Selecione o Veículo</option>
              {veiculos.map(v => <option key={v.veiculo_key} value={v.veiculo_key}>{v.placa} ({v.modelo})</option>)}
            </select>

            <select name="servico_key" value={formData.servico_key} onChange={handleChange} required className="fato-servicos-input">
              <option value="">Selecione o Serviço</option>
              {servicos.map(s => <option key={s.servico_key} value={s.servico_key}>{s.descricao_servico}</option>)}
            </select>

            <select name="funcionario_key" value={formData.funcionario_key} onChange={handleChange} required className="fato-servicos-input">
              <option value="">Técnico Responsável</option>
              {funcionarios.map(f => <option key={f.funcionario_key} value={f.funcionario_key}>{f.nome_tecnico}</option>)}
            </select>

            <select name="seguradora_key" value={formData.seguradora_key} onChange={handleChange} className="fato-servicos-input">
              <option value="">Sem Seguradora (Particular)</option>
              {seguradoras.map(seg => (
                <option key={seg.seguradora_key} value={seg.seguradora_key}>
                  {seg.nome || seg.razao_social || `Seguradora #${seg.seguradora_key}`}
                </option>
              ))}
            </select>
          </div>

          <h3 className="fato-servicos-form-section-titulo">Valores e Métricas (Fatos)</h3>
          <div className="fato-servicos-grid">
            <input
              type="number" step="0.01" name="valor_pecas" placeholder="Valor das Peças (R$)"
              value={formData.valor_pecas} onChange={handleChange} required
              className="fato-servicos-input"
            />
            <input
              type="number" step="0.01" name="custo_mao_obra" placeholder="Custo Mão de Obra (R$)"
              value={formData.custo_mao_obra} onChange={handleChange} required
              className="fato-servicos-input"
            />
            <input
              type="number" step="0.01" name="valor_total_servico" placeholder="Valor Total Cobrado (R$)"
              value={formData.valor_total_servico} onChange={handleChange} required
              className="fato-servicos-input"
            />
            <input
              type="number" name="duracao_servico_dias" placeholder="Duração do Serviço (Dias)"
              value={formData.duracao_servico_dias} onChange={handleChange} required
              className="fato-servicos-input"
            />
          </div>

          <div className="fato-servicos-botoes">
            {editId && (
              <button
                type="button"
                onClick={() => {
                  setEditId(null);
                  setFormData({ cliente_key: '', veiculo_key: '', servico_key: '', funcionario_key: '', seguradora_key: '', valor_total_servico: '', valor_pecas: '', custo_mao_obra: '', duracao_servico_dias: '' });
                }}
                className="fato-servicos-btn-cancelar"
              >
                Cancelar
              </button>
            )}
            <button type="submit" className="fato-servicos-btn-salvar">
              {editId ? 'Atualizar Serviço' : 'Guardar Serviço'}
            </button>
          </div>
        </form>
      </div>

      {/* Tabela */}
      <div className="fato-servicos-card-tabela">
        <table className="fato-servicos-tabela">
          <thead>
            <tr>
              <th>ID Serviço</th>
              <th>Cliente</th>
              <th>Serviço Executado</th>
              <th>Valor Total</th>
              <th>Dias</th>
              <th className="fato-servicos-th-acoes">Ações</th>
            </tr>
          </thead>
          <tbody>
            {fatos.length > 0 ? (
              fatos.map((fato) => (
                <tr key={fato.fato_key} className="fato-servicos-linha">
                  <td className="fato-servicos-td-destaque"># {fato.fato_key}</td>
                  <td>{getNomeCliente(fato.cliente_key)}</td>
                  <td>{getDescricaoServico(fato.servico_key)}</td>
                  <td>R$ {fato.valor_total_servico}</td>
                  <td>{fato.duracao_servico_dias}</td>
                  <td className="fato-servicos-td-acoes">
                    <button onClick={() => handleEdit(fato)} className="btn-acao-editar">Editar</button>
                    <span className="fato-servicos-separador">|</span>
                    <button onClick={() => handleDelete(fato.fato_key)} className="btn-acao-excluir">Excluir</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="fato-servicos-td-vazia">
                  Nenhuma ordem de serviço encontrada.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
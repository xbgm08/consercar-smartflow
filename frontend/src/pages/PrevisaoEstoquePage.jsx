import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import api from '../services/api';
import '../styles/PrevisaoEstoquePage.css';

export default function PrevisaoEstoquePage() {
  const [insumos, setInsumos] = useState([]);
  const [insumoSelecionado, setInsumoSelecionado] = useState('');
  const [estoqueAtual, setEstoqueAtual] = useState('');
  
  const [resultadoIA, setResultadoIA] = useState(null);
  const [dadosGrafico, setDadosGrafico] = useState([]);
  const [loading, setLoading] = useState(false);
  const [popup, setPopup] = useState({ visivel: false, mensagem: '', tipo: '' });

  useEffect(() => {
    carregarInsumos();
  }, []);

  const mostrarPopup = (mensagem, tipo) => {
    setPopup({ visivel: true, mensagem, tipo });
    setTimeout(() => {
      setPopup({ visivel: false, mensagem: '', tipo: '' });
    }, 3000);
  };

  const carregarInsumos = async () => {
    try {
      const response = await api.get('/insumos/');
      setInsumos(response.data);
    } catch (error) {
      console.error("Erro ao carregar insumos", error);
    }
  };

  const handlePrever = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResultadoIA(null);

    try {
      const response = await api.post('/ia/prever-estoque', {
        insumo_key: parseInt(insumoSelecionado),
        estoque_atual: parseFloat(estoqueAtual)
      });
      
      setResultadoIA(response.data);
      prepararDadosGrafico(response.data.grafico);
    } catch (error) {
      mostrarPopup("Erro ao rodar a IA ou histórico insuficiente.", "erro");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const prepararDadosGrafico = (graficoAPI) => {
    if (!graficoAPI) return;
    
    const dadosFormatados = [];
    const historicoRecente = graficoAPI.historico.slice(-30);
    
    historicoRecente.forEach(ponto => {
      dadosFormatados.push({ dia: `Dia ${ponto.dia}`, ConsumoReal: ponto.consumo, PrevisaoIA: null });
    });

    const ultimoPontoReal = historicoRecente[historicoRecente.length - 1];
    if (ultimoPontoReal) {
      dadosFormatados[dadosFormatados.length - 1].PrevisaoIA = ultimoPontoReal.consumo;
    }

    graficoAPI.previsao.forEach(ponto => {
      dadosFormatados.push({ dia: `Dia ${ponto.dia}`, ConsumoReal: null, PrevisaoIA: ponto.consumo });
    });

    setDadosGrafico(dadosFormatados);
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
    backgroundColor: popup.tipo === 'sucesso' ? '#427A77' : '#dc2626',
  };

  return (
    <div className="fato-servicos-container">
      <div style={popupStyle}>
        {popup.tipo === 'sucesso' ? '✅ ' : '⚠️ '}
        {popup.mensagem}
      </div>

      <h1 className="fato-servicos-titulo">Inteligência Artificial</h1>
      <p className="fato-servicos-subtitulo">Previsão de Estoque e Análise de Demanda com Regressão Linear</p>

      {/* Formulário de Input para a IA */}
      <div className="fato-servicos-card-form">
        <h2 className="fato-servicos-form-titulo">Configurar Análise</h2>
        <form onSubmit={handlePrever} className="fato-servicos-grid">
          <select 
            value={insumoSelecionado} 
            onChange={(e) => setInsumoSelecionado(e.target.value)} 
            required 
            className="fato-servicos-input"
          >
            <option value="">Selecione o Insumo para Analisar</option>
            {insumos.map(i => <option key={i.insumo_key} value={i.insumo_key}>{i.nome_insumo}</option>)}
          </select>

          <input
            type="number" step="0.01" placeholder="Quantidade Atual na Prateleira"
            value={estoqueAtual} onChange={(e) => setEstoqueAtual(e.target.value)} required
            className="fato-servicos-input"
          />

          <button type="submit" className="fato-servicos-btn-salvar" disabled={loading}>
            {loading ? 'A processar...' : 'Rodar IA de Previsão'}
          </button>
        </form>
      </div>

      {/* Resultado da IA e o Gráfico */}
      {resultadoIA && (
        <div className="fato-servicos-card-form" style={{ marginTop: '20px' }}>
          
          {/* Alertas Visuais */}
          {resultadoIA.status === 'alerta_gerado' ? (
            <div style={{ backgroundColor: '#fee2e2', padding: '15px', borderRadius: '8px', borderLeft: '5px solid #dc2626', marginBottom: '20px' }}>
              <h3 style={{ color: '#dc2626', margin: '0 0 10px 0' }}>⚠️ ALERTA CRÍTICO DE RUTURA</h3>
              <p>O consumo projetado para os próximos 7 dias é de <b>{resultadoIA.consumo_previsto_7_dias} unidades</b>.</p>
              <p>
                Se não comprar mais, o estoque ficará{' '}
                {resultadoIA.estoque_projetado_final < 0 
                  ? <b>negativo ({resultadoIA.estoque_projetado_final}).</b> 
                  : <b>abaixo do nível de segurança ({resultadoIA.estoque_projetado_final} unidades).</b>
                }
              </p>
              <h4 style={{ marginTop: '10px' }}>Sugestão de Compra da IA: {resultadoIA.sugestao_compra} unidades</h4>
            </div>
          ) : (
            <div style={{ backgroundColor: '#dcfce7', padding: '15px', borderRadius: '8px', borderLeft: '5px solid #16a34a', marginBottom: '20px' }}>
              <h3 style={{ color: '#16a34a', margin: '0 0 10px 0' }}>✅ ESTOQUE SAUDÁVEL</h3>
              <p>O consumo projetado para os próximos 7 dias é de <b>{resultadoIA.consumo_previsto_7_dias} unidades</b>.</p>
              <p>Você tem o suficiente. O saldo projetado no fim da semana é de {resultadoIA.estoque_projetado_final} unidades.</p>
            </div>
          )}

          {/* O Gráfico */}
          <h3 className="fato-servicos-form-section-titulo">Projeção de Consumo</h3>
          <div style={{ width: '100%', height: 400, marginTop: '20px' }}>
            <ResponsiveContainer>
              <LineChart data={dadosGrafico} margin={{ top: 20, right: 30, left: 20, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                
                <XAxis 
                  dataKey="dia" 
                  label={{ 
                    value: 'Linha do Tempo (Dias)', 
                    position: 'insideBottom', 
                    offset: -15,
                    fill: '#64748b',
                    fontSize: 14
                  }} 
                />
                
                <YAxis 
                  label={{ 
                    value: 'Quantidade Consumida', 
                    angle: -90, 
                    position: 'insideLeft',
                    offset: 0,
                    fill: '#64748b',
                    fontSize: 14,
                    style: { textAnchor: 'middle' }
                  }} 
                />
                
                <Tooltip />
                <Legend verticalAlign="top" height={36} />
                
                <Line 
                  type="monotone" 
                  name="Histórico Real" 
                  dataKey="ConsumoReal" 
                  stroke="#427A77" 
                  strokeWidth={3} 
                  activeDot={{ r: 8 }} 
                />
                <Line 
                  type="monotone" 
                  name="Previsão da IA" 
                  dataKey="PrevisaoIA" 
                  stroke="#dc2626" 
                  strokeWidth={3} 
                  strokeDasharray="5 5" 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

        </div>
      )}
    </div>
  );
}
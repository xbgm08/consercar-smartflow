import React, { useState, useEffect } from 'react';
import api from '../services/api';
import '../styles/TempoPage.css';

export default function TempoPage() {
    const [tempos, setTempos] = useState([]);
    const [formData, setFormData] = useState({
        data_completa: '',
        dia: '',
        mes: '',
        ano: '',
        trimestre: ''
    });
    const [editId, setEditId] = useState(null);

    useEffect(() => {
        carregarTempos();
    }, []);

    const carregarTempos = async () => {
        try {
            const response = await api.get('/tempo/');
            setTempos(response.data);
        } catch (error) {
            console.error("Erro ao procurar datas", error);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleDateChange = (e) => {
        const dataSelecionada = e.target.value;
        if (dataSelecionada) {
            const [ano, mes, dia] = dataSelecionada.split('-');
            const trimestreCalc = Math.ceil(parseInt(mes) / 3);

            setFormData({
                ...formData,
                data_completa: dataSelecionada,
                dia: dia,
                mes: mes,
                ano: ano,
                trimestre: trimestreCalc.toString()
            });
        } else {
            setFormData({ ...formData, data_completa: '' });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editId) {
                await api.put(`/tempo/${editId}`, formData);
            } else {
                await api.post('/tempo/', formData);
            }
            setFormData({ data_completa: '', dia: '', mes: '', ano: '', trimestre: '' });
            setEditId(null);
            carregarTempos();
        } catch (error) {
            console.error("Erro ao guardar data", error);
        }
    };

    const handleEdit = (tempo) => {
        setFormData({
            data_completa: tempo.data_completa || '',
            dia: tempo.dia || '',
            mes: tempo.mes || '',
            ano: tempo.ano || '',
            trimestre: tempo.trimestre || ''
        });
        setEditId(tempo.tempo_key);
    };

    const handleDelete = async (id) => {
        if (window.confirm("Tem a certeza que deseja eliminar este registo de tempo?")) {
            try {
                await api.delete(`/tempo/${id}`);
                carregarTempos();
            } catch (error) {
                console.error("Erro ao eliminar", error);
            }
        }
    };

    return (
        <div className="tempo-container">
            <h1 className="tempo-titulo">Gestão de Calendário (Tempo)</h1>
            <p className="tempo-subtitulo">Faça a gestão das datas do seu Data Warehouse para os relatórios</p>

            {/* Formulário */}
            <div className="tempo-card-form">
                <h2 style={{ color: '#1e3a8a', marginBottom: '1rem' }}>
                    {editId ? 'Editar Data' : 'Nova Data'}
                </h2>

                <form onSubmit={handleSubmit}>
                    <div className="tempo-grid">
                        <input
                            type="date" name="data_completa"
                            value={formData.data_completa} onChange={handleDateChange} required
                            className="tempo-input"
                        />
                        <input
                            type="number" name="dia" placeholder="Dia (1-31)"
                            value={formData.dia} onChange={handleChange} required
                            className="tempo-input"
                        />
                        <input
                            type="number" name="mes" placeholder="Mês (1-12)"
                            value={formData.mes} onChange={handleChange} required
                            className="tempo-input"
                        />
                        <input
                            type="number" name="ano" placeholder="Ano (Ex: 2026)"
                            value={formData.ano} onChange={handleChange} required
                            className="tempo-input"
                        />
                        <input
                            type="number" name="trimestre" placeholder="Trimestre (1-4)"
                            value={formData.trimestre} onChange={handleChange} required
                            className="tempo-input"
                        />
                    </div>

                    <div className="tempo-botoes">
                        {editId && (
                            <button
                                type="button"
                                onClick={() => { setEditId(null); setFormData({ data_completa: '', dia: '', mes: '', ano: '', trimestre: '' }) }}
                                className="tempo-btn-cancelar"
                            >
                                Cancelar
                            </button>
                        )}
                        <button type="submit" className="tempo-btn-salvar">
                            {editId ? 'Atualizar Data' : 'Guardar Data'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Tabela */}
            <div className="tempo-card-tabela">
                <table className="tempo-tabela">
                    <thead>
                        <tr>
                            <th>Data Completa</th>
                            <th>Dia</th>
                            <th>Mês</th>
                            <th>Ano</th>
                            <th>Trimestre</th>
                            <th style={{ textAlign: 'center' }}>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tempos.length > 0 ? (
                            tempos.map((tempo) => (
                                <tr key={tempo.tempo_key} className="tempo-linha">
                                    <td style={{ fontWeight: 'bold', color: '#1e3a8a' }}>{tempo.data_completa}</td>
                                    <td>{tempo.dia}</td>
                                    <td>{tempo.mes}</td>
                                    <td>{tempo.ano}</td>
                                    <td>{tempo.trimestre}º Trim.</td>
                                    <td style={{ textAlign: 'center' }}>
                                        <button onClick={() => handleEdit(tempo)} className="btn-acao-editar">Editar</button>
                                        <span style={{ color: '#cbd5e1' }}>|</span>
                                        <button onClick={() => handleDelete(tempo.tempo_key)} className="btn-acao-excluir">Eliminar</button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
                                    Nenhum registo de tempo encontrado no calendário.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
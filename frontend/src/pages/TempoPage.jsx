import React, { useState, useEffect } from 'react';
import api from '../services/api';
import '../styles/TempoPage.css';

export default function TempoPage() {
    const [tempos, setTempos] = useState([]);
    const [formData, setFormData] = useState({
        data: '',
        dia_semana: '',
        mes: '',
        trimestre: '',
        ano: ''
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
            const dateObj = new Date(dataSelecionada + 'T00:00:00');
            const diasSemana = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
            const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
            const numMes = dateObj.getMonth();
            const trimestreCalc = Math.floor(numMes / 3) + 1;

            setFormData({
                ...formData,
                data: dataSelecionada,
                dia_semana: diasSemana[dateObj.getDay()],
                mes: meses[numMes],
                trimestre: trimestreCalc.toString(),
                ano: dateObj.getFullYear().toString()
            });
        } else {
            setFormData({ data: '', dia_semana: '', mes: '', trimestre: '', ano: '' });
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
            setFormData({ data: '', dia_semana: '', mes: '', trimestre: '', ano: '' });
            setEditId(null);
            carregarTempos();
        } catch (error) {
            console.error("Erro ao salvar data", error);
        }
    };

    const handleEdit = (tempo) => {
        setFormData({
            data: tempo.data || '',
            dia_semana: tempo.dia_semana || '',
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

            <div className="tempo-card-form">
                <h2 className="tempo-form-titulo">
                    {editId ? 'Editar Data' : 'Nova Data'}
                </h2>

                <form onSubmit={handleSubmit}>
                    <div className="tempo-grid">
                        <input type="date" name="data" value={formData.data} onChange={handleDateChange} required className="tempo-input" />
                        <input type="text" name="dia_semana" placeholder="Dia da Semana" value={formData.dia_semana} onChange={handleChange} required className="tempo-input" />
                        <input type="text" name="mes" placeholder="Mês" value={formData.mes} onChange={handleChange} required className="tempo-input" />
                        <input type="number" name="trimestre" placeholder="Trimestre (1-4)" value={formData.trimestre} onChange={handleChange} required className="tempo-input" />
                        <input type="number" name="ano" placeholder="Ano (Ex: 2026)" value={formData.ano} onChange={handleChange} required className="tempo-input" />
                    </div>

                    <div className="tempo-botoes">
                        {editId && (
                            <button type="button" onClick={() => { setEditId(null); setFormData({ data: '', dia_semana: '', mes: '', trimestre: '', ano: '' }) }} className="tempo-btn-cancelar">
                                Cancelar
                            </button>
                        )}
                        <button type="submit" className="tempo-btn-salvar">
                            {editId ? 'Atualizar Data' : 'Salvar Data'}
                        </button>
                    </div>
                </form>
            </div>

            <div className="tempo-card-tabela">
                <table className="tempo-tabela">
                    <thead>
                        <tr>
                            <th>Data</th>
                            <th>Dia da Semana</th>
                            <th>Mês</th>
                            <th>Trimestre</th>
                            <th>Ano</th>
                            <th className="tempo-th-acoes">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tempos.length > 0 ? (
                            tempos.map((tempo) => (
                                <tr key={tempo.tempo_key} className="tempo-linha">
                                    <td className="tempo-td-data">{tempo.data}</td>
                                    <td>{tempo.dia_semana}</td>
                                    <td>{tempo.mes}</td>
                                    <td>{tempo.trimestre}º Trim.</td>
                                    <td>{tempo.ano}</td>
                                    <td className="tempo-td-acoes">
                                        <button onClick={() => handleEdit(tempo)} className="btn-acao-editar">Editar</button>
                                        <span className="tempo-separador">|</span>
                                        <button onClick={() => handleDelete(tempo.tempo_key)} className="btn-acao-excluir">Eliminar</button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className="tempo-td-vazia">
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
import React, { useState, useEffect } from 'react';
import api from '../services/api';
import '../styles/VeiculosPage.css';

export default function VeiculosPage() {
    const [veiculos, setVeiculos] = useState([]);
    const [formData, setFormData] = useState({
        placa: '',
        marca: '',
        modelo: '',
        ano: '',
        cor: ''
    });
    const [editId, setEditId] = useState(null);

    useEffect(() => {
        carregarVeiculos();
    }, []);

    const carregarVeiculos = async () => {
        try {
            const response = await api.get('/veiculos/');
            setVeiculos(response.data);
        } catch (error) {
            console.error("Erro ao procurar veículos", error);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editId) {
                await api.put(`/veiculos/${editId}`, formData);
            } else {
                await api.post('/veiculos/', formData);
            }
            setFormData({ placa: '', marca: '', modelo: '', ano: '', cor: '' });
            setEditId(null);
            carregarVeiculos();
        } catch (error) {
            console.error("Erro ao guardar veículo", error);
        }
    };

    const handleEdit = (veiculo) => {
        setFormData({
            placa: veiculo.placa || '',
            marca: veiculo.marca || '',
            modelo: veiculo.modelo || '',
            ano: veiculo.ano || '',
            cor: veiculo.cor || ''
        });
        setEditId(veiculo.veiculo_key);
    };

    const handleDelete = async (id) => {
        if (window.confirm("Tem a certeza que deseja eliminar este veículo?")) {
            try {
                await api.delete(`/veiculos/${id}`);
                carregarVeiculos();
            } catch (error) {
                console.error("Erro ao eliminar", error);
            }
        }
    };

    return (
        <div className="veiculos-container">
            <h1 className="veiculos-titulo">Gestão de Veículos</h1>
            <p className="veiculos-subtitulo">Registe os dados dos automóveis associados aos serviços da oficina</p>

            {/* Formulário */}
            <div className="veiculos-card-form">
                <h2 style={{ color: '#1e3a8a', marginBottom: '1rem' }}>
                    {editId ? 'Editar Veículo' : 'Novo Veículo'}
                </h2>

                <form onSubmit={handleSubmit}>
                    <div className="veiculos-grid">
                        <input
                            type="text" name="placa" placeholder="Matrícula / Placa (Ex: ABC-1234)"
                            value={formData.placa} onChange={handleChange} required
                            className="veiculos-input"
                        />
                        <input
                            type="text" name="marca" placeholder="Marca (Ex: Toyota)"
                            value={formData.marca} onChange={handleChange} required
                            className="veiculos-input"
                        />
                        <input
                            type="text" name="modelo" placeholder="Modelo (Ex: Corolla)"
                            value={formData.modelo} onChange={handleChange} required
                            className="veiculos-input"
                        />
                        <input
                            type="number" name="ano" placeholder="Ano (Ex: 2022)"
                            value={formData.ano} onChange={handleChange} required
                            className="veiculos-input"
                        />
                        <input
                            type="text" name="cor" placeholder="Cor"
                            value={formData.cor} onChange={handleChange} required
                            className="veiculos-input"
                        />
                    </div>

                    <div className="veiculos-botoes">
                        {editId && (
                            <button
                                type="button"
                                onClick={() => { setEditId(null); setFormData({ placa: '', marca: '', modelo: '', ano: '', cor: '' }) }}
                                className="veiculos-btn-cancelar"
                            >
                                Cancelar
                            </button>
                        )}
                        <button type="submit" className="veiculos-btn-salvar">
                            {editId ? 'Atualizar Veículo' : 'Guardar Veículo'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Tabela */}
            <div className="veiculos-card-tabela">
                <table className="veiculos-tabela">
                    <thead>
                        <tr>
                            <th>Matrícula / Placa</th>
                            <th>Marca</th>
                            <th>Modelo</th>
                            <th>Ano</th>
                            <th>Cor</th>
                            <th style={{ textAlign: 'center' }}>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {veiculos.length > 0 ? (
                            veiculos.map((veiculo) => (
                                <tr key={veiculo.veiculo_key} className="veiculos-linha">
                                    <td style={{ fontWeight: 'bold', color: '#1e3a8a' }}>{veiculo.placa}</td>
                                    <td>{veiculo.marca}</td>
                                    <td>{veiculo.modelo}</td>
                                    <td>{veiculo.ano}</td>
                                    <td>{veiculo.cor}</td>
                                    <td style={{ textAlign: 'center' }}>
                                        <button onClick={() => handleEdit(veiculo)} className="btn-acao-editar">Editar</button>
                                        <span style={{ color: '#cbd5e1' }}>|</span>
                                        <button onClick={() => handleDelete(veiculo.veiculo_key)} className="btn-acao-excluir">Eliminar</button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
                                    Nenhum veículo registado.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
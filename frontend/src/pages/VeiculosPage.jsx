import React, { useState, useEffect } from 'react';
import api from '../services/api';
import '../styles/VeiculosPage.css';

export default function VeiculosPage() {
    const [veiculos, setVeiculos] = useState([]);
    const [formData, setFormData] = useState({
        placa: '',
        chassi: '',
        marca: '',
        modelo: '',
        ano: '',
        tipo_veiculo: ''
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
            setFormData({ placa: '', chassi: '', marca: '', modelo: '', ano: '', tipo_veiculo: '' });
            setEditId(null);
            carregarVeiculos();
        } catch (error) {
            console.error("Erro ao salvar veículo", error);
        }
    };

    const handleEdit = (veiculo) => {
        setFormData({
            placa: veiculo.placa || '',
            chassi: veiculo.chassi || '',
            marca: veiculo.marca || '',
            modelo: veiculo.modelo || '',
            ano: veiculo.ano || '',
            tipo_veiculo: veiculo.tipo_veiculo || ''
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
                <h2 className="veiculos-form-titulo">
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
                            type="text" name="chassi" placeholder="Chassi (17 caracteres)"
                            value={formData.chassi} onChange={handleChange}
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
                        <select name="tipo_veiculo" value={formData.tipo_veiculo} onChange={handleChange} required className="veiculos-input">
                            <option value="">Tipo de Veículo</option>
                            <option value="Hatch">Hatch</option>
                            <option value="Sedan">Sedan</option>
                            <option value="SUV">SUV</option>
                            <option value="Picape">Picape</option>
                            <option value="Utilitário">Utilitário</option>
                        </select>
                    </div>

                    <div className="veiculos-botoes">
                        {editId && (
                            <button
                                type="button"
                                onClick={() => { setEditId(null); setFormData({ placa: '', chassi: '', marca: '', modelo: '', ano: '', tipo_veiculo: '' }) }}
                                className="veiculos-btn-cancelar"
                            >
                                Cancelar
                            </button>
                        )}
                        <button type="submit" className="veiculos-btn-salvar">
                            {editId ? 'Atualizar Veículo' : 'Salvar Veículo'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Tabela */}
            <div className="veiculos-card-tabela">
                <table className="veiculos-tabela">
                    <thead>
                        <tr>
                            <th>Placa</th>
                            <th>Chassi</th>
                            <th>Marca</th>
                            <th>Modelo</th>
                            <th>Ano</th>
                            <th>Tipo</th>
                            <th className="veiculos-th-acoes">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {veiculos.length > 0 ? (
                            veiculos.map((veiculo) => (
                                <tr key={veiculo.veiculo_key} className="veiculos-linha">
                                    <td className="veiculos-td-placa">{veiculo.placa}</td>
                                    <td>{veiculo.chassi || '-'}</td>
                                    <td>{veiculo.marca}</td>
                                    <td>{veiculo.modelo}</td>
                                    <td>{veiculo.ano}</td>
                                    <td>{veiculo.tipo_veiculo}</td>
                                    <td className="veiculos-td-acoes">
                                        <button onClick={() => handleEdit(veiculo)} className="btn-acao-editar">Editar</button>
                                        <span className="veiculos-separador">|</span>
                                        <button onClick={() => handleDelete(veiculo.veiculo_key)} className="btn-acao-excluir">Eliminar</button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7" className="veiculos-td-vazia">
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
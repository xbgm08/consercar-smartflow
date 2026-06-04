import React, { useState, useEffect } from 'react';
import api from '../services/api';
import '../styles/FornecedoresPage.css';

export default function FornecedoresPage() {
    const [fornecedores, setFornecedores] = useState([]);
    const [formData, setFormData] = useState({
        razao_social: '',
        cnpj: '',
        tempo_entrega_dias: ''
    });

    const [editId, setEditId] = useState(null);

    useEffect(() => {
        carregarFornecedores();
    }, []);

    const carregarFornecedores = async () => {
        try {
            const response = await api.get('/fornecedores/');
            setFornecedores(response.data);
        } catch (error) {
            console.error("Erro ao procurar fornecedores", error);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editId) {
                await api.put(`/fornecedores/${editId}`, formData);
            } else {
                await api.post('/fornecedores/', formData);
            }
            setFormData({ razao_social: '', cnpj: '', tempo_entrega_dias: '' });
            setEditId(null);
            carregarFornecedores();
        } catch (error) {
            console.error("Erro ao guardar fornecedor", error);
        }
    };

    const handleEdit = (fornecedor) => {
        setFormData({
            razao_social: fornecedor.razao_social || '',
            cnpj: fornecedor.cnpj || '',
            tempo_entrega_dias: fornecedor.tempo_entrega_dias || ''
        });
        setEditId(fornecedor.fornecedor_key);
    };

    const handleDelete = async (id) => {
        if (window.confirm("Tem a certeza que deseja excluir este fornecedor?")) {
            try {
                await api.delete(`/fornecedores/${id}`);
                carregarFornecedores();
            } catch (error) {
                console.error("Erro ao eliminar", error);
            }
        }
    };

    return (
        <div className="fornecedores-container">
            <h1 className="fornecedores-titulo">Gestão de Fornecedores</h1>
            <p className="fornecedores-subtitulo">Registe os parceiros que fornecem peças e insumos para a oficina</p>

            {/* Formulário */}
            <div className="fornecedores-card-form">
                <h2 className="fornecedores-form-titulo">
                    {editId ? 'Editar Fornecedor' : 'Novo Fornecedor'}
                </h2>

                <form onSubmit={handleSubmit}>
                    <div className="fornecedores-grid">
                        <input
                            type="text" name="razao_social" placeholder="Razão Social / Nome Fantasia"
                            value={formData.razao_social} onChange={handleChange} required
                            className="fornecedores-input"
                        />
                        <input
                            type="text" name="cnpj" placeholder="CNPJ"
                            value={formData.cnpj} onChange={handleChange} required maxLength="14"
                            className="fornecedores-input"
                        />
                        <input
                            type="number" name="tempo_entrega_dias" placeholder="Tempo Médio de Entrega (Dias)"
                            value={formData.tempo_entrega_dias} onChange={handleChange}
                            className="fornecedores-input"
                        />
                    </div>

                    <div className="fornecedores-botoes">
                        {editId && (
                            <button
                                type="button"
                                onClick={() => { setEditId(null); setFormData({ razao_social: '', cnpj: '', tempo_entrega_dias: '' }) }}
                                className="fornecedores-btn-cancelar"
                            >
                                Cancelar
                            </button>
                        )}
                        <button type="submit" className="fornecedores-btn-salvar">
                            {editId ? 'Atualizar Fornecedor' : 'Guardar Fornecedor'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Tabela */}
            <div className="fornecedores-card-tabela">
                <table className="fornecedores-tabela">
                    <thead>
                        <tr>
                            <th>Razão Social</th>
                            <th>CNPJ</th>
                            <th>Prazo (Dias)</th>
                            <th className="fornecedores-th-acoes">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {fornecedores.length > 0 ? (
                            fornecedores.map((fornecedor) => (
                                <tr key={fornecedor.fornecedor_key} className="fornecedores-linha">
                                    <td className="fornecedores-td-razao">{fornecedor.razao_social}</td>
                                    <td>{fornecedor.cnpj}</td>
                                    <td>{fornecedor.tempo_entrega_dias}</td>
                                    <td className="fornecedores-td-acoes">
                                        <button onClick={() => handleEdit(fornecedor)} className="btn-acao-editar">Editar</button>
                                        <span className="fornecedores-separador">|</span>
                                        <button onClick={() => handleDelete(fornecedor.fornecedor_key)} className="btn-acao-excluir">Excluir</button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" className="fornecedores-td-vazia">
                                    Nenhum fornecedor cadastrado.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
import React, { useState, useEffect } from 'react';
import api from '../services/api';
import '../styles/ServicosPage.css';

export default function ServicosPage() {
    const [servicos, setServicos] = useState([]);
    const [formData, setFormData] = useState({
        descricao_servico: '',
        categoria: ''
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
            setFormData({ descricao_servico: '', categoria: '' });
            setEditId(null);
            carregarServicos();
        } catch (error) {
            console.error("Erro ao salvar serviço", error);
        }
    };

    const handleEdit = (servico) => {
        setFormData({
            descricao_servico: servico.descricao_servico || '',
            categoria: servico.categoria || ''
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
            <p className="servicos-subtitulo">Faça a gestão das categorias e descrições dos serviços da oficina</p>

            {/* Formulário */}
            <div className="servicos-card-form">
                <h2 className="servicos-form-titulo">
                    {editId ? 'Editar Serviço' : 'Novo Serviço'}
                </h2>

                <form onSubmit={handleSubmit}>
                    <div className="servicos-grid">
                        <input
                            type="text" name="descricao_servico" placeholder="Descrição do Serviço (Ex: Revisão Geral)"
                            value={formData.descricao_servico} onChange={handleChange} required
                            className="servicos-input"
                        />
                        <input
                            type="text" name="categoria" placeholder="Categoria (Ex: Mecânica, Pintura)"
                            value={formData.categoria} onChange={handleChange} required
                            className="servicos-input"
                        />
                    </div>

                    <div className="servicos-botoes">
                        {editId && (
                            <button
                                type="button"
                                onClick={() => { setEditId(null); setFormData({ descricao_servico: '', categoria: '' }) }}
                                className="servicos-btn-cancelar"
                            >
                                Cancelar
                            </button>
                        )}
                        <button type="submit" className="servicos-btn-salvar">
                            {editId ? 'Atualizar Serviço' : 'Salvar Serviço'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Tabela */}
            <div className="servicos-card-tabela">
                <table className="servicos-tabela">
                    <thead>
                        <tr>
                            <th>Descrição do Serviço</th>
                            <th>Categoria</th>
                            <th className="servicos-th-acoes">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {servicos.length > 0 ? (
                            servicos.map((servico) => (
                                <tr key={servico.servico_key} className="servicos-linha">
                                    <td className="servicos-td-descricao">{servico.descricao_servico}</td>
                                    <td>{servico.categoria}</td>
                                    <td className="servicos-td-acoes">
                                        <button onClick={() => handleEdit(servico)} className="btn-acao-editar">Editar</button>
                                        <span className="servicos-separador">|</span>
                                        <button onClick={() => handleDelete(servico.servico_key)} className="btn-acao-excluir">Eliminar</button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="3" className="servicos-td-vazia">
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
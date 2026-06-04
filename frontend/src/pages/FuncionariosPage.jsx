import React, { useState, useEffect } from 'react';
import api from '../services/api';
import '../styles/FuncionariosPage.css';

export default function FuncionariosPage() {
    const [funcionarios, setFuncionarios] = useState([]);
    const [formData, setFormData] = useState({
        nome_tecnico: '',
        cargo: ''
    });

    const [editId, setEditId] = useState(null);

    useEffect(() => {
        carregarFuncionarios();
    }, []);

    const carregarFuncionarios = async () => {
        try {
            const response = await api.get('/funcionarios/');
            setFuncionarios(response.data);
        } catch (error) {
            console.error("Erro ao procurar funcionários", error);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editId) {
                await api.put(`/funcionarios/${editId}`, formData);
            } else {
                await api.post('/funcionarios/', formData);
            }
            setFormData({ nome_tecnico: '', cargo: '' });
            setEditId(null);
            carregarFuncionarios();
        } catch (error) {
            console.error("Erro ao guardar funcionário", error);
        }
    };

    const handleEdit = (funcionario) => {
        setFormData({
            nome_tecnico: funcionario.nome_tecnico || '',
            cargo: funcionario.cargo || ''
        });
        setEditId(funcionario.funcionario_key);
    };

    const handleDelete = async (id) => {
        if (window.confirm("Tem a certeza que deseja excluir este funcionário?")) {
            try {
                await api.delete(`/funcionarios/${id}`);
                carregarFuncionarios();
            } catch (error) {
                console.error("Erro ao eliminar", error);
            }
        }
    };

    return (
        <div className="funcionarios-container">
            <h1 className="funcionarios-titulo">Gestão de Funcionários</h1>
            <p className="funcionarios-subtitulo">Cadastre mecânicos, pintores e gestores da sua oficina</p>

            {/* Formulário */}
            <div className="funcionarios-card-form">
                <h2 style={{ color: '#1e3a8a', marginBottom: '1rem' }}>
                    {editId ? 'Editar Funcionário' : 'Novo Funcionário'}
                </h2>

                <form onSubmit={handleSubmit}>
                    <div className="funcionarios-grid">
                        <input
                            type="text" name="nome_tecnico" placeholder="Nome Completo do Técnico"
                            value={formData.nome_tecnico} onChange={handleChange} required
                            className="funcionarios-input"
                        />
                        <input
                            type="text" name="cargo" placeholder="Cargo (Ex: Mecânico Chefe)"
                            value={formData.cargo} onChange={handleChange} required
                            className="funcionarios-input"
                        />
                    </div>

                    <div className="funcionarios-botoes">
                        {editId && (
                            <button
                                type="button"
                                onClick={() => { setEditId(null); setFormData({ nome_tecnico: '', cargo: '' }) }}
                                className="funcionarios-btn-cancelar"
                            >
                                Cancelar
                            </button>
                        )}
                        <button type="submit" className="funcionarios-btn-salvar">
                            {editId ? 'Atualizar Funcionário' : 'Guardar Funcionário'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Tabela */}
            <div className="funcionarios-card-tabela">
                <table className="funcionarios-tabela">
                    <thead>
                        <tr>
                            <th>Nome do Técnico</th>
                            <th>Cargo</th>
                            <th style={{ textAlign: 'center' }}>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {funcionarios.length > 0 ? (
                            funcionarios.map((funcionario) => (
                                <tr key={funcionario.funcionario_key} className="funcionarios-linha">
                                    <td style={{ fontWeight: 'bold', color: '#1e3a8a' }}>{funcionario.nome_tecnico}</td>
                                    <td style={{ fontWeight: 'bold', color: '#64748b' }}>{funcionario.cargo}</td>
                                    <td style={{ textAlign: 'center' }}>
                                        <button onClick={() => handleEdit(funcionario)} className="btn-acao-editar">Editar</button>
                                        <span style={{ color: '#cbd5e1' }}>|</span>
                                        <button onClick={() => handleDelete(funcionario.funcionario_key)} className="btn-acao-excluir">Excluir</button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="3" style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
                                    Nenhum funcionário cadastrado.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
import React, { useState, useEffect } from 'react';
import api from '../services/api';
import '../styles/FuncionariosPage.css';

export default function FuncionariosPage() {
    const [funcionarios, setFuncionarios] = useState([]);
    const [formData, setFormData] = useState({
        nome: '',
        cargo: '',
        cpf: '',
        telefone: '',
        email: ''
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
            setFormData({ nome: '', cargo: '', cpf: '', telefone: '', email: '' });
            setEditId(null);
            carregarFuncionarios();
        } catch (error) {
            console.error("Erro ao guardar funcionário", error);
        }
    };

    const handleEdit = (funcionario) => {
        setFormData({
            nome: funcionario.nome || '',
            cargo: funcionario.cargo || '',
            cpf: funcionario.cpf || '',
            telefone: funcionario.telefone || '',
            email: funcionario.email || ''
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
                            type="text" name="nome" placeholder="Nome Completo"
                            value={formData.nome} onChange={handleChange} required
                            className="funcionarios-input"
                        />
                        <input
                            type="text" name="cargo" placeholder="Cargo (Ex: Mecânico Chefe)"
                            value={formData.cargo} onChange={handleChange} required
                            className="funcionarios-input"
                        />
                        <input
                            type="text" name="cpf" placeholder="CPF"
                            value={formData.cpf} onChange={handleChange} required
                            className="funcionarios-input"
                        />
                        <input
                            type="text" name="telefone" placeholder="Telefone"
                            value={formData.telefone} onChange={handleChange} required
                            className="funcionarios-input"
                        />
                        <input
                            type="email" name="email" placeholder="E-mail"
                            value={formData.email} onChange={handleChange} required
                            className="funcionarios-input"
                        />
                    </div>

                    <div className="funcionarios-botoes">
                        {editId && (
                            <button
                                type="button"
                                onClick={() => { setEditId(null); setFormData({ nome: '', cargo: '', cpf: '', telefone: '', email: '' }) }}
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
                            <th>Nome</th>
                            <th>Cargo</th>
                            <th>CPF</th>
                            <th>Contato</th>
                            <th style={{ textAlign: 'center' }}>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {funcionarios.length > 0 ? (
                            funcionarios.map((funcionario) => (
                                <tr key={funcionario.funcionario_key} className="funcionarios-linha">
                                    <td style={{ fontWeight: 'bold', color: '#1e3a8a' }}>{funcionario.nome}</td>
                                    <td style={{ fontWeight: 'bold', color: '#64748b' }}>{funcionario.cargo}</td>
                                    <td>{funcionario.cpf}</td>
                                    <td>{funcionario.telefone} <br /> <span style={{ fontSize: '0.85rem', color: '#64748b' }}>{funcionario.email}</span></td>
                                    <td style={{ textAlign: 'center' }}>
                                        <button onClick={() => handleEdit(funcionario)} className="btn-acao-editar">Editar</button>
                                        <span style={{ color: '#cbd5e1' }}>|</span>
                                        <button onClick={() => handleDelete(funcionario.funcionario_key)} className="btn-acao-excluir">Excluir</button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
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
import React, { useState, useEffect } from 'react';
import api from '../services/api';
import '../styles/FuncionariosPage.css';

export default function FuncionariosPage() {
    const [funcionarios, setFuncionarios] = useState([]);
    const [editId, setEditId] = useState(null);
    const [popup, setPopup] = useState({ visivel: false, mensagem: '', tipo: '' });
    const [formData, setFormData] = useState({
        nome_tecnico: '',
        cargo: ''
    });

    useEffect(() => {
        carregarFuncionarios();
    }, []);

    const mostrarPopup = (mensagem, tipo) => {
        setPopup({ visivel: true, mensagem, tipo });
        setTimeout(() => {
            setPopup({ visivel: false, mensagem: '', tipo: '' });
        }, 3000);
    };

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
                mostrarPopup('Funcionário atualizado com sucesso!', 'sucesso');
            } else {
                await api.post('/funcionarios/', formData);
                mostrarPopup('Funcionário gravado com sucesso!', 'sucesso');
            }
            setFormData({ nome_tecnico: '', cargo: '' });
            setEditId(null);
            carregarFuncionarios();
        } catch (error) {
            const msgErro = error.response?.data?.detail || "Erro ao salvar funcionário.";
            mostrarPopup(msgErro, 'erro');
            console.error("Erro ao salvar funcionário", error);
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
                mostrarPopup('Funcionário excluído com sucesso!', 'sucesso');
                carregarFuncionarios();
            } catch (error) {
                mostrarPopup('Erro ao excluir funcionário.', 'erro');
                console.error("Erro ao excluir funcionário", error);
            }
        }
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
        backgroundColor: popup.tipo === 'sucesso' ? '#0f766e' : '#dc2626',
    };

    return (
        <div className="funcionarios-container">

            <div style={popupStyle}>
                {popup.tipo === 'sucesso' ? '✅ ' : '⚠️ '}
                {popup.mensagem}
            </div>

            <h1 className="funcionarios-titulo">Gestão de Funcionários</h1>
            <p className="funcionarios-subtitulo">Cadastre mecânicos, pintores e gestores da sua oficina</p>

            {/* Formulário */}
            <div className="funcionarios-card-form">
                <h2 className="funcionarios-form-titulo">
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
                            {editId ? 'Atualizar Funcionário' : 'Salvar Funcionário'}
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
                            <th className="funcionarios-th-acoes">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {funcionarios.length > 0 ? (
                            funcionarios.map((funcionario) => (
                                <tr key={funcionario.funcionario_key} className="funcionarios-linha">
                                    <td className="funcionarios-td-nome">{funcionario.nome_tecnico}</td>
                                    <td className="funcionarios-td-cargo">{funcionario.cargo}</td>
                                    <td className="funcionarios-td-acoes">
                                        <button onClick={() => handleEdit(funcionario)} className="btn-acao-editar">Editar</button>
                                        <span className="funcionarios-separador">|</span>
                                        <button onClick={() => handleDelete(funcionario.funcionario_key)} className="btn-acao-excluir">Excluir</button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="3" className="funcionarios-td-vazia">
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
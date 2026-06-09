import React, { useState, useEffect } from 'react';
import api from '../services/api';
import '../styles/SeguradorasPage.css';

export default function SeguradorasPage() {
    const [seguradoras, setSeguradoras] = useState([]);
    const [editId, setEditId] = useState(null);
    const [popup, setPopup] = useState({ visivel: false, mensagem: '', tipo: '' });
    const [formData, setFormData] = useState({
        razao_social: '',
        cnpj: '',
        contato: ''
    });

    useEffect(() => {
        carregarSeguradoras();
    }, []);

    const mostrarPopup = (mensagem, tipo) => {
        setPopup({ visivel: true, mensagem, tipo });
        setTimeout(() => {
            setPopup({ visivel: false, mensagem: '', tipo: '' });
        }, 3000);
    };

    const carregarSeguradoras = async () => {
        try {
            const response = await api.get('/seguradoras/');
            setSeguradoras(response.data);
        } catch (error) {
            console.error("Erro ao procurar seguradoras", error);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editId) {
                await api.put(`/seguradoras/${editId}`, formData);
                mostrarPopup('Seguradora atualizada com sucesso!', 'sucesso');
            } else {
                await api.post('/seguradoras/', formData);
                mostrarPopup('Seguradora gravada com sucesso!', 'sucesso');
            }
            setFormData({ razao_social: '', cnpj: '', contato: '' });
            setEditId(null);
            carregarSeguradoras();
        } catch (error) {
            const msgErro = error.response?.data?.detail || "Erro ao salvar seguradora.";
            mostrarPopup(msgErro, 'erro');
            console.error("Erro ao salvar seguradora", error);
        }
    };

    const handleEdit = (seguradora) => {
        setFormData({
            razao_social: seguradora.razao_social || '',
            cnpj: seguradora.cnpj || '',
            contato: seguradora.contato || ''
        });
        setEditId(seguradora.seguradora_key);
    };

    const handleDelete = async (id) => {
        if (window.confirm("Tem a certeza que deseja excluir esta seguradora?")) {
            try {
                await api.delete(`/seguradoras/${id}`);
                mostrarPopup('Seguradora excluída com sucesso!', 'sucesso');
                carregarSeguradoras();
            } catch (error) {
                mostrarPopup('Erro ao excluir seguradora.', 'erro');
                console.error("Erro ao excluir seguradora", error);
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
        backgroundColor: popup.tipo === 'sucesso' ? '#427A77' : '#dc2626',
    };

    return (
        <div className="seguradoras-container">
            <div style={popupStyle}>
                {popup.tipo === 'sucesso' ? '✅ ' : '⚠️ '}
                {popup.mensagem}
            </div>

            <h1 className="seguradoras-titulo">Gestão de Seguradoras</h1>
            <p className="seguradoras-subtitulo">Registe as seguradoras parceiras da oficina</p>

            {/* Formulário */}
            <div className="seguradoras-card-form">
                <h2 className="seguradoras-form-titulo">
                    {editId ? 'Editar Seguradora' : 'Nova Seguradora'}
                </h2>

                <form onSubmit={handleSubmit}>
                    <div className="seguradoras-grid">
                        <input
                            type="text" name="razao_social" placeholder="Razão Social"
                            value={formData.razao_social} onChange={handleChange} required
                            className="seguradoras-input"
                        />
                        <input
                            type="text" name="cnpj" placeholder="CNPJ"
                            value={formData.cnpj} onChange={handleChange} required maxLength="14"
                            className="seguradoras-input"
                        />
                        <input
                            type="text" name="contato" placeholder="Contato (Telefone/Email/Nome)"
                            value={formData.contato} onChange={handleChange}
                            className="seguradoras-input"
                        />
                    </div>

                    <div className="seguradoras-botoes">
                        {editId && (
                            <button
                                type="button"
                                onClick={() => { setEditId(null); setFormData({ razao_social: '', cnpj: '', contato: '' }) }}
                                className="seguradoras-btn-cancelar"
                            >
                                Cancelar
                            </button>
                        )}
                        <button type="submit" className="seguradoras-btn-salvar">
                            {editId ? 'Atualizar Seguradora' : 'Salvar Seguradora'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Tabela */}
            <div className="seguradoras-card-tabela">
                <table className="seguradoras-tabela">
                    <thead>
                        <tr>
                            <th>Razão Social</th>
                            <th>CNPJ</th>
                            <th>Contato</th>
                            <th className="seguradoras-th-acoes">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {seguradoras.length > 0 ? (
                            seguradoras.map((seguradora) => (
                                <tr key={seguradora.seguradora_key} className="seguradoras-linha">
                                    <td className="seguradoras-td-razao">{seguradora.razao_social}</td>
                                    <td>{seguradora.cnpj}</td>
                                    <td>{seguradora.contato}</td>
                                    <td className="seguradoras-td-acoes">
                                        <button onClick={() => handleEdit(seguradora)} className="btn-acao-editar">Editar</button>
                                        <span className="seguradoras-separador">|</span>
                                        <button onClick={() => handleDelete(seguradora.seguradora_key)} className="btn-acao-excluir">Excluir</button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" className="seguradoras-td-vazia">
                                    Nenhuma seguradora registada.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
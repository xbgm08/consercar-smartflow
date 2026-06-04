import React, { useState, useEffect } from 'react';
import api from '../services/api';
import '../styles/SeguradorasPage.css';

export default function SeguradorasPage() {
    const [seguradoras, setSeguradoras] = useState([]);
    const [formData, setFormData] = useState({
        razao_social: '',
        cnpj: '',
        contato: ''
    });

    const [editId, setEditId] = useState(null);

    useEffect(() => {
        carregarSeguradoras();
    }, []);

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
            } else {
                await api.post('/seguradoras/', formData);
            }
            setFormData({ razao_social: '', cnpj: '', contato: '' });
            setEditId(null);
            carregarSeguradoras();
        } catch (error) {
            console.error("Erro ao guardar seguradora", error);
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
        if (window.confirm("Tem a certeza que deseja eliminar esta seguradora?")) {
            try {
                await api.delete(`/seguradoras/${id}`);
                carregarSeguradoras();
            } catch (error) {
                console.error("Erro ao eliminar", error);
            }
        }
    };

    return (
        <div className="seguradoras-container">
            <h1 className="seguradoras-titulo">Gestão de Seguradoras</h1>
            <p className="seguradoras-subtitulo">Registe as seguradoras parceiras da oficina</p>

            {/* Formulário */}
            <div className="seguradoras-card-form">
                <h2 style={{ color: '#1e3a8a', marginBottom: '1rem' }}>
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
                            {editId ? 'Atualizar Seguradora' : 'Guardar Seguradora'}
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
                            <th style={{ textAlign: 'center' }}>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {seguradoras.length > 0 ? (
                            seguradoras.map((seguradora) => (
                                <tr key={seguradora.seguradora_key} className="seguradoras-linha">
                                    <td style={{ fontWeight: 'bold', color: '#1e3a8a' }}>{seguradora.razao_social}</td>
                                    <td>{seguradora.cnpj}</td>
                                    <td>{seguradora.contato}</td>
                                    <td style={{ textAlign: 'center' }}>
                                        <button onClick={() => handleEdit(seguradora)} className="btn-acao-editar">Editar</button>
                                        <span style={{ color: '#cbd5e1' }}>|</span>
                                        <button onClick={() => handleDelete(seguradora.seguradora_key)} className="btn-acao-excluir">Eliminar</button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
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
import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.fato_consumo_insumo import FatoConsumoInsumo
from app.models.fato_alerta_estoque import FatoAlertaEstoque

class IAEstoqueService:
    def __init__(self, db: Session):
        self.db = db

    def analisar_e_prever_estoque(self, insumo_key: int, estoque_atual: float, margem_seguranca: float = 15.0):
        """
        Analisa o histórico de um insumo, prevê o consumo para os próximos 7 dias e gera um alerta na FatoAlertaEstoque 
        se houver risco de rutura.
        """
        historico = self.db.query(FatoConsumoInsumo.tempo_key, FatoConsumoInsumo.quantidade_real)\
            .filter(FatoConsumoInsumo.insumo_key == insumo_key)\
            .order_by(FatoConsumoInsumo.tempo_key.asc())\
            .all()

        if len(historico) < 3:
            return {"status": "ignorado", "mensagem": "Histórico insuficiente para a IA aprender (mínimo de 3 registos)."}

        df = pd.DataFrame(historico, columns=['tempo_key', 'quantidade_real'])
        df['dia_sequencial'] = range(1, len(df) + 1)

        X_passado = df['dia_sequencial'].values.reshape(-1, 1)
        y_passado = df['quantidade_real'].values

        modelo_ia = LinearRegression()
        modelo_ia.fit(X_passado, y_passado)

        ultimo_dia_registado = df['dia_sequencial'].max()
        X_futuro = np.array([[ultimo_dia_registado + i] for i in range(1, 8)])
        previsao_7_dias = modelo_ia.predict(X_futuro)
        
        consumo_projetado_semana = float(sum([max(0, p) for p in previsao_7_dias]))

        estoque_projetado = float(estoque_atual) - consumo_projetado_semana

        dados_grafico = {
            "historico": [{"dia": int(d[0]), "consumo": float(c)} for d, c in zip(X_passado, y_passado)],
            "previsao": [{"dia": int(d[0]), "consumo": float(c)} for d, c in zip(X_futuro, previsao_7_dias)]
        }

        if estoque_projetado < margem_seguranca:
            sugestao = float(margem_seguranca - estoque_projetado + 5.0)
            
            novo_alerta = FatoAlertaEstoque(
                tempo_key=int(df['tempo_key'].max()), 
                insumo_key=int(insumo_key),
                quantidade_atual=float(estoque_atual),
                status_alerta="CRÍTICO - Risco de Rutura em 7 dias",
                sugestao_compra=round(sugestao, 2)
            )
            self.db.add(novo_alerta)
            self.db.commit()
            
            return {
                "status": "alerta_gerado",
                "consumo_previsto_7_dias": round(consumo_projetado_semana, 2),
                "estoque_projetado_final": round(estoque_projetado, 2),
                "sugestao_compra": round(sugestao, 2),
                "grafico": dados_grafico
            }
        
        return {
            "status": "estoque_saudavel",
            "consumo_previsto_7_dias": round(consumo_projetado_semana, 2),
            "estoque_projetado_final": round(estoque_projetado, 2),
            "mensagem": "Nenhuma compra necessária por agora.",
            "grafico": dados_grafico
        }
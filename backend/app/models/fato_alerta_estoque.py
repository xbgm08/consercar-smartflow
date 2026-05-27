from sqlalchemy import Column, Integer, String, Numeric, ForeignKey
from app.config.database import Base

class FatoAlertaEstoque(Base):
    __tablename__ = "fato_alerta_estoque"
    __table_args__ = {"schema": "dw"}

    alerta_key = Column(Integer, primary_key=True, index=True)
    tempo_key = Column(Integer, ForeignKey("dw.dim_tempo.tempo_key"))
    insumo_key = Column(Integer, ForeignKey("dw.dim_insumo.insumo_key"))
    
    quantidade_atual = Column(Numeric(10, 2))
    status_alerta = Column(String(50))
    sugestao_compra = Column(Numeric(10, 2))
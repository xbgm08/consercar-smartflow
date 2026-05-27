from sqlalchemy import Column, Integer, Numeric, ForeignKey
from app.config.database import Base

class FatoConsumoInsumo(Base):
    __tablename__ = "fato_consumo_insumo"
    __table_args__ = {"schema": "dw"}

    fato_consumo_key = Column(Integer, primary_key=True, index=True)
    tempo_key = Column(Integer, ForeignKey("dw.dim_tempo.tempo_key"))
    servico_key = Column(Integer, ForeignKey("dw.dim_servico.servico_key"))
    veiculo_key = Column(Integer, ForeignKey("dw.dim_veiculo.veiculo_key"))
    insumo_key = Column(Integer, ForeignKey("dw.dim_insumo.insumo_key"))
    fornecedor_key = Column(Integer, ForeignKey("dw.dim_fornecedor.fornecedor_key"))
    funcionario_key = Column(Integer, ForeignKey("dw.dim_funcionario.funcionario_key"))
    
    quantidade_prevista = Column(Numeric(10, 2))
    quantidade_real = Column(Numeric(10, 2))
    desperdicio = Column(Numeric(10, 2))
    custo_unitario = Column(Numeric(10, 2))
    custo_total_insumo = Column(Numeric(15, 2))
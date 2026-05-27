from sqlalchemy import Column, Integer, Numeric, ForeignKey
from app.config.database import Base

class FatoServicos(Base):
    __tablename__ = "fato_servicos"
    __table_args__ = {"schema": "dw"}

    fato_key = Column(Integer, primary_key=True, index=True)
    cliente_key = Column(Integer, ForeignKey("dw.dim_cliente.cliente_key"))
    veiculo_key = Column(Integer, ForeignKey("dw.dim_veiculo.veiculo_key"))
    servico_key = Column(Integer, ForeignKey("dw.dim_servico.servico_key"))
    seguradora_key = Column(Integer, ForeignKey("dw.dim_seguradora.seguradora_key"))
    funcionario_key = Column(Integer, ForeignKey("dw.dim_funcionario.funcionario_key"))
    tempo_key = Column(Integer, ForeignKey("dw.dim_tempo.tempo_key"))
    
    valor_total_servico = Column(Numeric(15, 2))
    valor_pecas = Column(Numeric(10, 2))
    custo_mao_obra = Column(Numeric(10, 2))
    duracao_servico_dias = Column(Integer)
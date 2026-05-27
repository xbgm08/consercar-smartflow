from sqlalchemy import Column, Integer, String
from app.config.database import Base

class DimServico(Base):
    __tablename__ = "dim_servico"
    __table_args__ = {"schema": "dw"}

    servico_key = Column(Integer, primary_key=True, index=True)
    descricao_servico = Column(String(200))
    categoria = Column(String(50))
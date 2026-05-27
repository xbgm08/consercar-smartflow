from sqlalchemy import Column, Integer, String
from app.config.database import Base

class DimFornecedor(Base):
    __tablename__ = "dim_fornecedor"
    __table_args__ = {"schema": "dw"}

    fornecedor_key = Column(Integer, primary_key=True, index=True)
    razao_social = Column(String(100))
    cnpj = Column(String(14), unique=True)
    tempo_entrega_dias = Column(Integer)
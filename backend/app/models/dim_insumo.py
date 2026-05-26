from sqlalchemy import Column, Integer, String, Numeric
from app.config.database import Base

class DimInsumo(Base):
    __tablename__ = "dim_insumo"
    __table_args__ = {"schema": "dw"}

    insumo_key = Column(Integer, primary_key=True, index=True)
    codigo_sku = Column(String(50), nullable=True)
    nome_insumo = Column(String(150), nullable=True)
    categoria = Column(String(50), nullable=True)
    unidade_medida = Column(String(20), nullable=True)
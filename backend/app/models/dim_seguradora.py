from sqlalchemy import Column, Integer, String
from app.config.database import Base

class DimSeguradora(Base):
    __tablename__ = "dim_seguradora"
    __table_args__ = {"schema": "dw"}

    seguradora_key = Column(Integer, primary_key=True, index=True)
    razao_social = Column(String(100))
    cnpj = Column(String(14), unique=True)
    contato = Column(String(100))
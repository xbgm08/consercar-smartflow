from sqlalchemy import Column, Integer, String
from app.config.database import Base

class DimFuncionario(Base):
    __tablename__ = "dim_funcionario"
    __table_args__ = {"schema": "dw"}

    funcionario_key = Column(Integer, primary_key=True, index=True)
    nome_tecnico = Column(String(100))
    cargo = Column(String(50))
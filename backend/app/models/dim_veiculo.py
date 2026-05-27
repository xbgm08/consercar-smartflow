from sqlalchemy import Column, Integer, String
from app.config.database import Base

class DimVeiculo(Base):
    __tablename__ = "dim_veiculo"
    __table_args__ = {"schema": "dw"}

    veiculo_key = Column(Integer, primary_key=True, index=True)
    placa = Column(String(10), unique=True)
    chassi = Column(String(17))
    marca = Column(String(50))
    modelo = Column(String(50))
    ano = Column(Integer)
    tipo_veiculo = Column(String(30))
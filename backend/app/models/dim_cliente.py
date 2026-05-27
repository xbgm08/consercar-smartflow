from sqlalchemy import Column, Integer, String
from app.config.database import Base

class DimCliente(Base):
    __tablename__ = "dim_cliente"
    __table_args__ = {"schema": "dw"}

    cliente_key = Column(Integer, primary_key=True, index=True)
    nome = Column(String(100))
    cpf = Column(String(11), unique=True)
    email = Column(String(100))
    telefone = Column(String(20))
    rua = Column(String(150))
    numero = Column(String(10))
    bairro = Column(String(100))
    cep = Column(String(8))
    municipio = Column(String(100))
    uf = Column(String(2))
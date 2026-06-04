from sqlalchemy import Column, Integer, String, Date
from app.config.database import Base

class DimTempo(Base):
    __tablename__ = "dim_tempo"
    __table_args__ = {"schema": "dw"}

    tempo_key = Column(Integer, primary_key=True, index=True)
    data = Column(Date, nullable=False)
    dia_semana = Column(String(20))
    mes = Column(String(20))
    trimestre = Column(Integer)
    ano = Column(Integer)
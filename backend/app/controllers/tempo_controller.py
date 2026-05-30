from sqlalchemy.orm import Session
from app.models.dim_tempo import DimTempo

class TempoController:
    def __init__(self, db: Session):
        self.db = db

    def get_all(self):
        return self.db.query(DimTempo).all()

    def get_by_id(self, id: int):
        return self.db.query(DimTempo).filter(DimTempo.tempo_key == id).first()

    def create(self, dados: dict):
        novo = DimTempo(**dados)
        self.db.add(novo)
        self.db.commit()
        self.db.refresh(novo)
        return novo

    def update(self, id: int, dados: dict):
        tempo = self.get_by_id(id)
        if not tempo:
            return None
        for chave, valor in dados.items():
            setattr(tempo, chave, valor)
        self.db.commit()
        self.db.refresh(tempo)
        return tempo

    def delete(self, id: int):
        tempo = self.get_by_id(id)
        if not tempo:
            return False
        self.db.delete(tempo)
        self.db.commit()
        return True
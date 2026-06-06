from sqlalchemy.orm import Session
from app.models.fato_consumo_insumo import FatoConsumoInsumo

class FatoConsumoInsumoController:
    def __init__(self, db: Session):
        self.db = db

    def get_all(self):
        return self.db.query(FatoConsumoInsumo).all()

    def get_by_id(self, id: int):
        # Usando a chave primária correta: fato_consumo_key
        return self.db.query(FatoConsumoInsumo).filter(FatoConsumoInsumo.fato_consumo_key == id).first()

    def create(self, dados: dict):
        novo_fato = FatoConsumoInsumo(**dados)
        self.db.add(novo_fato)
        self.db.commit()
        self.db.refresh(novo_fato)
        return novo_fato

    def update(self, id: int, dados: dict):
        fato = self.get_by_id(id)
        if not fato:
            return None
        for chave, valor in dados.items():
            setattr(fato, chave, valor)
        self.db.commit()
        self.db.refresh(fato)
        return fato

    def delete(self, id: int):
        fato = self.get_by_id(id)
        if not fato:
            return False
        self.db.delete(fato)
        self.db.commit()
        return True
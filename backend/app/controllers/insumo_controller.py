from sqlalchemy.orm import Session
from app.models.dim_insumo import DimInsumo

class InsumoController:
    def __init__(self, db: Session):
        self.db = db

    def get_all(self):
        return self.db.query(DimInsumo).all()

    def get_by_id(self, id: int):
        return self.db.query(DimInsumo).filter(DimInsumo.insumo_key == id).first()

    def create(self, dados: dict):
        novo = DimInsumo(**dados)
        self.db.add(novo)
        self.db.commit()
        self.db.refresh(novo)
        return novo

    def update(self, id: int, dados: dict):
        insumo = self.get_by_id(id)
        if not insumo:
            return None
        
        for chave, valor in dados.items():
            setattr(insumo, chave, valor)
            
        self.db.commit()
        self.db.refresh(insumo)
        return insumo

    def delete(self, id: int):
        insumo = self.get_by_id(id)
        if not insumo:
            return False
            
        self.db.delete(insumo)
        self.db.commit()
        return True
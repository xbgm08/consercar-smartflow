from sqlalchemy.orm import Session
from app.models.dim_seguradora import DimSeguradora

class SeguradoraController:
    def __init__(self, db: Session):
        self.db = db

    def get_all(self):
        return self.db.query(DimSeguradora).all()

    def get_by_id(self, id: int):
        return self.db.query(DimSeguradora).filter(DimSeguradora.seguradora_key == id).first()

    def create(self, dados: dict):
        nova = DimSeguradora(**dados)
        self.db.add(nova)
        self.db.commit()
        self.db.refresh(nova)
        return nova

    def update(self, id: int, dados: dict):
        seguradora = self.get_by_id(id)
        if not seguradora:
            return None
        
        for chave, valor in dados.items():
            setattr(seguradora, chave, valor)
            
        self.db.commit()
        self.db.refresh(seguradora)
        return seguradora

    def delete(self, id: int):
        seguradora = self.get_by_id(id)
        if not seguradora:
            return False
            
        self.db.delete(seguradora)
        self.db.commit()
        return True
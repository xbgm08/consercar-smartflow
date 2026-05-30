from sqlalchemy.orm import Session
from app.models.dim_veiculo import DimVeiculo

class VeiculoController:
    def __init__(self, db: Session):
        self.db = db

    def get_all(self):
        return self.db.query(DimVeiculo).all()

    def get_by_id(self, id: int):
        return self.db.query(DimVeiculo).filter(DimVeiculo.veiculo_key == id).first()

    def create(self, dados: dict):
        novo = DimVeiculo(**dados)
        self.db.add(novo)
        self.db.commit()
        self.db.refresh(novo)
        return novo

    def update(self, id: int, dados: dict):
        veiculo = self.get_by_id(id)
        if not veiculo:
            return None
        for chave, valor in dados.items():
            setattr(veiculo, chave, valor)
        self.db.commit()
        self.db.refresh(veiculo)
        return veiculo

    def delete(self, id: int):
        veiculo = self.get_by_id(id)
        if not veiculo:
            return False
        self.db.delete(veiculo)
        self.db.commit()
        return True
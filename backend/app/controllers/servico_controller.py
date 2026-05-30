from sqlalchemy.orm import Session
from app.models.dim_servico import DimServico

class ServicoController:
    def __init__(self, db: Session):
        self.db = db

    def get_all(self):
        return self.db.query(DimServico).all()

    def get_by_id(self, id: int):
        return self.db.query(DimServico).filter(DimServico.servico_key == id).first()

    def create(self, dados: dict):
        novo = DimServico(**dados)
        self.db.add(novo)
        self.db.commit()
        self.db.refresh(novo)
        return novo

    def update(self, id: int, dados: dict):
        servico = self.get_by_id(id)
        if not servico:
            return None
        for chave, valor in dados.items():
            setattr(servico, chave, valor)
        self.db.commit()
        self.db.refresh(servico)
        return servico

    def delete(self, id: int):
        servico = self.get_by_id(id)
        if not servico:
            return False
        self.db.delete(servico)
        self.db.commit()
        return True
from sqlalchemy.orm import Session
from app.models.fato_alerta_estoque import FatoAlertaEstoque

class FatoAlertaEstoqueController:
    def __init__(self, db: Session):
        self.db = db

    def get_all(self):
        return self.db.query(FatoAlertaEstoque).all()

    def get_by_id(self, id: int):
        # Usando a chave primária correta: alerta_key
        return self.db.query(FatoAlertaEstoque).filter(FatoAlertaEstoque.alerta_key == id).first()

    def create(self, dados: dict):
        novo_alerta = FatoAlertaEstoque(**dados)
        self.db.add(novo_alerta)
        self.db.commit()
        self.db.refresh(novo_alerta)
        return novo_alerta

    def update(self, id: int, dados: dict):
        alerta = self.get_by_id(id)
        if not alerta:
            return None
        for chave, valor in dados.items():
            setattr(alerta, chave, valor)
        self.db.commit()
        self.db.refresh(alerta)
        return alerta

    def delete(self, id: int):
        alerta = self.get_by_id(id)
        if not alerta:
            return False
        self.db.delete(alerta)
        self.db.commit()
        return True
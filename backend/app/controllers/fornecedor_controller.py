from sqlalchemy.orm import Session
from app.models.dim_fornecedor import DimFornecedor

class FornecedorController:
    # A Sessão do banco é injetada quando a classe é instanciada
    def __init__(self, db: Session):
        self.db = db

    def get_all(self):
        return self.db.query(DimFornecedor).all()

    def get_by_id(self, id: int):
        return self.db.query(DimFornecedor).filter(DimFornecedor.fornecedor_key == id).first()

    def create(self, dados: dict):
        novo = DimFornecedor(**dados)
        self.db.add(novo)
        self.db.commit()
        self.db.refresh(novo)
        return novo

    def update(self, id: int, dados: dict):
        fornecedor = self.get_by_id(id)
        if not fornecedor:
            return None
        
        for chave, valor in dados.items():
            setattr(fornecedor, chave, valor)
            
        self.db.commit()
        self.db.refresh(fornecedor)
        return fornecedor

    def delete(self, id: int):
        fornecedor = self.get_by_id(id)
        if not fornecedor:
            return False
            
        self.db.delete(fornecedor)
        self.db.commit()
        return True
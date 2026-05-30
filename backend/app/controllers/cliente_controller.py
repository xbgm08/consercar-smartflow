from sqlalchemy.orm import Session
from app.models.dim_cliente import DimCliente

class ClienteController:
    def __init__(self, db: Session):
        self.db = db

    def get_all(self):
        return self.db.query(DimCliente).all()

    def get_by_id(self, id: int):
        return self.db.query(DimCliente).filter(DimCliente.cliente_key == id).first()

    def create(self, dados: dict):
        novo = DimCliente(**dados)
        self.db.add(novo)
        self.db.commit()
        self.db.refresh(novo)
        return novo

    def update(self, id: int, dados: dict):
        cliente = self.get_by_id(id)
        if not cliente:
            return None
        
        for chave, valor in dados.items():
            setattr(cliente, chave, valor)
            
        self.db.commit()
        self.db.refresh(cliente)
        return cliente

    def delete(self, id: int):
        cliente = self.get_by_id(id)
        if not cliente:
            return False
            
        self.db.delete(cliente)
        self.db.commit()
        return True
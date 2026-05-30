from sqlalchemy.orm import Session
from app.models.dim_funcionario import DimFuncionario

class FuncionarioController:
    def __init__(self, db: Session):
        self.db = db

    def get_all(self):
        return self.db.query(DimFuncionario).all()

    def get_by_id(self, id: int):
        return self.db.query(DimFuncionario).filter(DimFuncionario.funcionario_key == id).first()

    def create(self, dados: dict):
        novo = DimFuncionario(**dados)
        self.db.add(novo)
        self.db.commit()
        self.db.refresh(novo)
        return novo

    def update(self, id: int, dados: dict):
        funcionario = self.get_by_id(id)
        if not funcionario:
            return None
        
        for chave, valor in dados.items():
            setattr(funcionario, chave, valor)
            
        self.db.commit()
        self.db.refresh(funcionario)
        return funcionario

    def delete(self, id: int):
        funcionario = self.get_by_id(id)
        if not funcionario:
            return False
            
        self.db.delete(funcionario)
        self.db.commit()
        return True
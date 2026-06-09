from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from fastapi import HTTPException
from app.models.fato_servicos import FatoServicos

class FatoServicosController:
    def __init__(self, db: Session):
        self.db = db

    def get_all(self):
        return self.db.query(FatoServicos).all()

    def get_by_id(self, id: int):
        return self.db.query(FatoServicos).filter(FatoServicos.fato_key == id).first()

    def create(self, dados: dict):
        novo_fato = FatoServicos(**dados)
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
            
        try:
            self.db.commit()
            self.db.refresh(fato)
            return fato
            
        except SQLAlchemyError as e:
            self.db.rollback() 
            
            error_msg = str(e.orig) if hasattr(e, 'orig') else str(e)
                        
            if "já finalizado" in error_msg:
                raise HTTPException(
                    status_code=400, 
                    detail="Bloqueio de Segurança: Este serviço já foi finalizado e não permite alterações."
                )
            else:
                raise HTTPException(
                    status_code=400, 
                    detail="Erro ao atualizar a Ordem de Serviço. Verifique os dados."
                )

    def delete(self, id: int):
        fato = self.get_by_id(id)
        if not fato:
            return False
        self.db.delete(fato)
        self.db.commit()
        return True
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.config.database import get_db
from app.services.ia_estoque_service import IAEstoqueService

router = APIRouter(prefix="/api/ia", tags=["Inteligência Artificial (Machine Learning)"])

class PrevisaoEstoqueRequest(BaseModel):
    insumo_key: int
    estoque_atual: float

def get_ia_service(db: Session = Depends(get_db)):
    return IAEstoqueService(db)

@router.post("/prever-estoque", status_code=status.HTTP_200_OK)
def rodar_previsao_estoque(
    dados: PrevisaoEstoqueRequest, 
    service: IAEstoqueService = Depends(get_ia_service)
):
    """
    Aciona o modelo de Machine Learning (Regressão Linear) para analisar 
    o histórico do insumo e prever a necessidade de compra para os próximos 7 dias.
    """
    try:
        resultado = service.analisar_e_prever_estoque(
            insumo_key=dados.insumo_key,
            estoque_atual=dados.estoque_atual
        )
        return resultado
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail=f"Erro ao rodar a IA: {str(e)}"
        )
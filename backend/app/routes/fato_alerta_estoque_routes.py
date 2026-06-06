from fastapi import APIRouter, Depends, HTTPException, status, Response, Body
from sqlalchemy.orm import Session
from app.config.database import get_db
from app.controllers.fato_alerta_estoque_controller import FatoAlertaEstoqueController

router = APIRouter(prefix="/api/fatos-alerta", tags=["Fato Alerta Estoque"])

def get_alerta_controller(db: Session = Depends(get_db)):
    return FatoAlertaEstoqueController(db)

@router.post("/", status_code=status.HTTP_201_CREATED)
def criar_fato_alerta(dados: dict = Body(...), controller: FatoAlertaEstoqueController = Depends(get_alerta_controller)):
    """Cria um novo alerta de estoque."""
    return controller.create(dados)

@router.get("/", status_code=status.HTTP_200_OK)
def listar_fatos_alertas(controller: FatoAlertaEstoqueController = Depends(get_alerta_controller)):
    """Retorna todos os alertas de estoque."""
    return controller.get_all()

@router.get("/{id}", status_code=status.HTTP_200_OK)
def buscar_fato_alerta(id: int, controller: FatoAlertaEstoqueController = Depends(get_alerta_controller)):
    """Busca um alerta pelo ID."""
    alerta = controller.get_by_id(id)
    if not alerta:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Alerta não encontrado")
    return alerta

@router.put("/{id}", status_code=status.HTTP_200_OK)
def atualizar_fato_alerta(id: int, dados: dict = Body(...), controller: FatoAlertaEstoqueController = Depends(get_alerta_controller)):
    """Atualiza um alerta existente."""
    atualizado = controller.update(id, dados)
    if not atualizado:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Alerta não encontrado para atualização")
    return atualizado

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def deletar_fato_alerta(id: int, controller: FatoAlertaEstoqueController = Depends(get_alerta_controller)):
    """Exclui um alerta de estoque."""
    if not controller.delete(id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Alerta não encontrado para exclusão")
    return Response(status_code=status.HTTP_204_NO_CONTENT)
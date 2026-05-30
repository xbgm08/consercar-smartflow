from fastapi import APIRouter, Depends, HTTPException, status, Response, Body
from sqlalchemy.orm import Session
from app.config.database import get_db
from app.controllers.seguradora_controller import SeguradoraController

router = APIRouter(prefix="/api/seguradoras", tags=["Seguradoras"])

# Injeção de dependência para instanciar o Controller
def get_seguradora_controller(db: Session = Depends(get_db)):
    return SeguradoraController(db)

@router.post("/", status_code=status.HTTP_201_CREATED)
def criar_seguradora(dados: dict = Body(...), controller: SeguradoraController = Depends(get_seguradora_controller)):
    """Cadastra uma nova seguradora parceira."""
    return controller.create(dados)

@router.get("/", status_code=status.HTTP_200_OK)
def listar_seguradoras(controller: SeguradoraController = Depends(get_seguradora_controller)):
    """Retorna a lista de todas as seguradoras cadastradas."""
    return controller.get_all()

@router.get("/{id}", status_code=status.HTTP_200_OK)
def buscar_seguradora(id: int, controller: SeguradoraController = Depends(get_seguradora_controller)):
    """Busca uma seguradora específica pelo ID."""
    seguradora = controller.get_by_id(id)
    if not seguradora:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Seguradora não encontrada")
    return seguradora

@router.put("/{id}", status_code=status.HTTP_200_OK)
def atualizar_seguradora(id: int, dados: dict = Body(...), controller: SeguradoraController = Depends(get_seguradora_controller)):
    """Atualiza os dados de uma seguradora existente."""
    atualizado = controller.update(id, dados)
    if not atualizado:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Seguradora não encontrada para atualização")
    return atualizado

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def deletar_seguradora(id: int, controller: SeguradoraController = Depends(get_seguradora_controller)):
    """Exclui uma seguradora do sistema."""
    if not controller.delete(id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Seguradora não encontrada para exclusão")
    return Response(status_code=status.HTTP_204_NO_CONTENT)
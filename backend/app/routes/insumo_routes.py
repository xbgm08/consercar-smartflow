from fastapi import APIRouter, Depends, HTTPException, status, Response, Body
from sqlalchemy.orm import Session
from app.config.database import get_db
from app.controllers.insumo_controller import InsumoController

router = APIRouter(prefix="/api/insumos", tags=["Insumos"])

# Injeção de dependência para instanciar o Controller
def get_insumo_controller(db: Session = Depends(get_db)):
    return InsumoController(db)

@router.post("/", status_code=status.HTTP_201_CREATED)
def criar_insumo(dados: dict = Body(...), controller: InsumoController = Depends(get_insumo_controller)):
    """Cadastra um novo insumo no estoque (ex: Tinta Branca, Verniz)."""
    return controller.create(dados)

@router.get("/", status_code=status.HTTP_200_OK)
def listar_insumos(controller: InsumoController = Depends(get_insumo_controller)):
    """Retorna a lista de todos os insumos cadastrados."""
    return controller.get_all()

@router.get("/{id}", status_code=status.HTTP_200_OK)
def buscar_insumo(id: int, controller: InsumoController = Depends(get_insumo_controller)):
    """Busca um insumo específico pelo ID."""
    insumo = controller.get_by_id(id)
    if not insumo:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Insumo não encontrado")
    return insumo

@router.put("/{id}", status_code=status.HTTP_200_OK)
def atualizar_insumo(id: int, dados: dict = Body(...), controller: InsumoController = Depends(get_insumo_controller)):
    """Atualiza os dados de um insumo existente."""
    atualizado = controller.update(id, dados)
    if not atualizado:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Insumo não encontrado para atualização")
    return atualizado

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def deletar_insumo(id: int, controller: InsumoController = Depends(get_insumo_controller)):
    """Exclui um insumo do sistema."""
    if not controller.delete(id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Insumo não encontrado para exclusão")
    return Response(status_code=status.HTTP_204_NO_CONTENT)
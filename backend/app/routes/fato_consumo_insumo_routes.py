from fastapi import APIRouter, Depends, HTTPException, status, Response, Body
from sqlalchemy.orm import Session
from app.config.database import get_db
from app.controllers.fato_consumo_insumo_controller import FatoConsumoInsumoController

router = APIRouter(prefix="/api/fato-consumo", tags=["Fato Consumo Insumos"])

def get_consumo_controller(db: Session = Depends(get_db)):
    return FatoConsumoInsumoController(db)

@router.post("/", status_code=status.HTTP_201_CREATED)
def criar_fato_consumo(dados: dict = Body(...), controller: FatoConsumoInsumoController = Depends(get_consumo_controller)):
    """Cria um novo registo de consumo de insumo."""
    return controller.create(dados)

@router.get("/", status_code=status.HTTP_200_OK)
def listar_fatos_consumo(controller: FatoConsumoInsumoController = Depends(get_consumo_controller)):
    """Retorna todos os registos de consumo de insumos."""
    return controller.get_all()

@router.get("/{id}", status_code=status.HTTP_200_OK)
def buscar_fato_consumo(id: int, controller: FatoConsumoInsumoController = Depends(get_consumo_controller)):
    """Busca um registo de consumo pelo ID."""
    fato = controller.get_by_id(id)
    if not fato:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Fato Consumo não encontrado")
    return fato

@router.put("/{id}", status_code=status.HTTP_200_OK)
def atualizar_fato_consumo(id: int, dados: dict = Body(...), controller: FatoConsumoInsumoController = Depends(get_consumo_controller)):
    """Atualiza um registo de consumo existente."""
    atualizado = controller.update(id, dados)
    if not atualizado:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Fato Consumo não encontrado para atualização")
    return atualizado

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def deletar_fato_consumo(id: int, controller: FatoConsumoInsumoController = Depends(get_consumo_controller)):
    """Exclui um registo de consumo."""
    if not controller.delete(id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Fato Consumo não encontrado para exclusão")
    return Response(status_code=status.HTTP_204_NO_CONTENT)
from fastapi import APIRouter, Depends, HTTPException, status, Response, Body
from sqlalchemy.orm import Session
from app.config.database import get_db
from app.controllers.cliente_controller import ClienteController

router = APIRouter(prefix="/api/clientes", tags=["Clientes"])

# Injeção de dependência para instanciar o Controller
def get_cliente_controller(db: Session = Depends(get_db)):
    return ClienteController(db)

@router.post("/", status_code=status.HTTP_201_CREATED)
def criar_cliente(dados: dict = Body(...), controller: ClienteController = Depends(get_cliente_controller)):
    """Cria um novo cliente."""
    return controller.create(dados)

@router.get("/", status_code=status.HTTP_200_OK)
def listar_clientes(controller: ClienteController = Depends(get_cliente_controller)):
    """Retorna todos os clientes cadastrados."""
    return controller.get_all()

@router.get("/{id}", status_code=status.HTTP_200_OK)
def buscar_cliente(id: int, controller: ClienteController = Depends(get_cliente_controller)):
    """Busca um cliente específico pelo ID."""
    cliente = controller.get_by_id(id)
    if not cliente:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cliente não encontrado")
    return cliente

@router.put("/{id}", status_code=status.HTTP_200_OK)
def atualizar_cliente(id: int, dados: dict = Body(...), controller: ClienteController = Depends(get_cliente_controller)):
    """Atualiza os dados de um cliente existente."""
    atualizado = controller.update(id, dados)
    if not atualizado:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cliente não encontrado para atualização")
    return atualizado

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def deletar_cliente(id: int, controller: ClienteController = Depends(get_cliente_controller)):
    """Exclui um cliente do sistema."""
    if not controller.delete(id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cliente não encontrado para exclusão")
    return Response(status_code=status.HTTP_204_NO_CONTENT)
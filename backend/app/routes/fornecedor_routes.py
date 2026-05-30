from fastapi import APIRouter, Depends, HTTPException, status, Response, Body
from sqlalchemy.orm import Session
from app.config.database import get_db
from app.controllers.fornecedor_controller import FornecedorController

router = APIRouter(prefix="/api/fornecedores", tags=["Fornecedores"])

# Injeção de dependência para instanciar o Service com a conexão do banco
def get_fornecedor_controller(db: Session = Depends(get_db)):
    return FornecedorController(db)

@router.post("/", status_code=status.HTTP_201_CREATED)
def criar_fornecedor(dados: dict = Body(...), controller: FornecedorController = Depends(get_fornecedor_controller)):
    """Cria um novo fornecedor."""
    return controller.create(dados)

@router.get("/", status_code=status.HTTP_200_OK)
def listar_fornecedores(controller: FornecedorController = Depends(get_fornecedor_controller)):
    """Retorna todos os fornecedores."""
    return controller.get_all()

@router.get("/{id}", status_code=status.HTTP_200_OK)
def buscar_fornecedor(id: int, controller: FornecedorController = Depends(get_fornecedor_controller)):
    """Busca um fornecedor pelo ID."""
    fornecedor = controller.get_by_id(id)
    if not fornecedor:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Fornecedor não encontrado")
    return fornecedor

@router.put("/{id}", status_code=status.HTTP_200_OK)
def atualizar_fornecedor(id: int, dados: dict = Body(...), controller: FornecedorController = Depends(get_fornecedor_controller)):
    """Atualiza um fornecedor existente."""
    atualizado = controller.update(id, dados)
    if not atualizado:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Fornecedor não encontrado para atualização")
    return atualizado

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def deletar_fornecedor(id: int, controller: FornecedorController = Depends(get_fornecedor_controller)):
    """Exclui um fornecedor."""
    if not controller.delete(id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Fornecedor não encontrado para exclusão")
    return Response(status_code=status.HTTP_204_NO_CONTENT)
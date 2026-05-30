from fastapi import APIRouter, Depends, HTTPException, status, Response, Body
from sqlalchemy.orm import Session
from app.config.database import get_db
from app.controllers.funcionario_controller import FuncionarioController

router = APIRouter(prefix="/api/funcionarios", tags=["Funcionários"])

# Injeção de dependência para instanciar o Controller
def get_funcionario_controller(db: Session = Depends(get_db)):
    return FuncionarioController(db)

@router.post("/", status_code=status.HTTP_201_CREATED)
def criar_funcionario(dados: dict = Body(...), controller: FuncionarioController = Depends(get_funcionario_controller)):
    """Cadastra um novo funcionário (mecânico, pintor, gestor, etc.)."""
    return controller.create(dados)

@router.get("/", status_code=status.HTTP_200_OK)
def listar_funcionarios(controller: FuncionarioController = Depends(get_funcionario_controller)):
    """Retorna a lista de todos os funcionários cadastrados."""
    return controller.get_all()

@router.get("/{id}", status_code=status.HTTP_200_OK)
def buscar_funcionario(id: int, controller: FuncionarioController = Depends(get_funcionario_controller)):
    """Busca um funcionário específico pelo ID."""
    funcionario = controller.get_by_id(id)
    if not funcionario:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Funcionário não encontrado")
    return funcionario

@router.put("/{id}", status_code=status.HTTP_200_OK)
def atualizar_funcionario(id: int, dados: dict = Body(...), controller: FuncionarioController = Depends(get_funcionario_controller)):
    """Atualiza os dados de um funcionário existente."""
    atualizado = controller.update(id, dados)
    if not atualizado:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Funcionário não encontrado para atualização")
    return atualizado

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def deletar_funcionario(id: int, controller: FuncionarioController = Depends(get_funcionario_controller)):
    """Exclui um funcionário do sistema."""
    if not controller.delete(id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Funcionário não encontrado para exclusão")
    return Response(status_code=status.HTTP_204_NO_CONTENT)
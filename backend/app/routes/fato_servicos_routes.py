from fastapi import APIRouter, Depends, HTTPException, status, Response, Body
from sqlalchemy.orm import Session
from app.config.database import get_db
from app.controllers.fato_servicos_controller import FatoServicosController

router = APIRouter(prefix="/api/fatos-servicos", tags=["Fato Serviços"])

# Injeção de dependência para instanciar o Service com a conexão do banco
def get_fato_servicos_controller(db: Session = Depends(get_db)):
    return FatoServicosController(db)

@router.post("/", status_code=status.HTTP_201_CREATED)
def criar_fato_servico(dados: dict = Body(...), controller: FatoServicosController = Depends(get_fato_servicos_controller)):
    """Cria uma nova ordem de serviço (Fato Serviços)."""
    return controller.create(dados)

@router.get("/", status_code=status.HTTP_200_OK)
def listar_fatos_servicos(controller: FatoServicosController = Depends(get_fato_servicos_controller)):
    """Retorna todas as ordens de serviço (Fato Serviços)."""
    return controller.get_all()

@router.get("/{id}", status_code=status.HTTP_200_OK)
def buscar_fato_servico(id: int, controller: FatoServicosController = Depends(get_fato_servicos_controller)):
    """Busca uma ordem de serviço pelo ID."""
    fato = controller.get_by_id(id)
    if not fato:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Fato Serviço não encontrado")
    return fato

@router.put("/{id}", status_code=status.HTTP_200_OK)
def atualizar_fato_servico(id: int, dados: dict = Body(...), controller: FatoServicosController = Depends(get_fato_servicos_controller)):
    """Atualiza uma ordem de serviço existente."""
    atualizado = controller.update(id, dados)
    if not atualizado:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Fato Serviço não encontrado para atualização")
    return atualizado

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def deletar_fato_servico(id: int, controller: FatoServicosController = Depends(get_fato_servicos_controller)):
    """Exclui uma ordem de serviço."""
    if not controller.delete(id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Fato Serviço não encontrado para exclusão")
    return Response(status_code=status.HTTP_204_NO_CONTENT)
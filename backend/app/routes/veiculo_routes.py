from fastapi import APIRouter, Depends, HTTPException, status, Response, Body
from sqlalchemy.orm import Session
from app.config.database import get_db
from app.controllers.veiculo_controller import VeiculoController

router = APIRouter(prefix="/api/veiculos", tags=["Veículos"])

def get_veiculo_controller(db: Session = Depends(get_db)):
    return VeiculoController(db)

@router.post("/", status_code=status.HTTP_201_CREATED)
def criar_veiculo(dados: dict = Body(...), controller: VeiculoController = Depends(get_veiculo_controller)):
    return controller.create(dados)

@router.get("/", status_code=status.HTTP_200_OK)
def listar_veiculos(controller: VeiculoController = Depends(get_veiculo_controller)):
    return controller.get_all()

@router.get("/{id}", status_code=status.HTTP_200_OK)
def buscar_veiculo(id: int, controller: VeiculoController = Depends(get_veiculo_controller)):
    veiculo = controller.get_by_id(id)
    if not veiculo:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Veículo não encontrado")
    return veiculo

@router.put("/{id}", status_code=status.HTTP_200_OK)
def atualizar_veiculo(id: int, dados: dict = Body(...), controller: VeiculoController = Depends(get_veiculo_controller)):
    atualizado = controller.update(id, dados)
    if not atualizado:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Veículo não encontrado")
    return atualizado

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def deletar_veiculo(id: int, controller: VeiculoController = Depends(get_veiculo_controller)):
    if not controller.delete(id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Veículo não encontrado")
    return Response(status_code=status.HTTP_204_NO_CONTENT)
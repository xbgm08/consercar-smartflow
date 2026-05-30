from fastapi import APIRouter, Depends, HTTPException, status, Response, Body
from sqlalchemy.orm import Session
from app.config.database import get_db
from app.controllers.tempo_controller import TempoController

router = APIRouter(prefix="/api/tempo", tags=["Tempo"])

def get_tempo_controller(db: Session = Depends(get_db)):
    return TempoController(db)

@router.post("/", status_code=status.HTTP_201_CREATED)
def criar_tempo(dados: dict = Body(...), controller: TempoController = Depends(get_tempo_controller)):
    return controller.create(dados)

@router.get("/", status_code=status.HTTP_200_OK)
def listar_tempos(controller: TempoController = Depends(get_tempo_controller)):
    return controller.get_all()

@router.get("/{id}", status_code=status.HTTP_200_OK)
def buscar_tempo(id: int, controller: TempoController = Depends(get_tempo_controller)):
    tempo = controller.get_by_id(id)
    if not tempo:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Data não encontrada")
    return tempo

@router.put("/{id}", status_code=status.HTTP_200_OK)
def atualizar_tempo(id: int, dados: dict = Body(...), controller: TempoController = Depends(get_tempo_controller)):
    atualizado = controller.update(id, dados)
    if not atualizado:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Data não encontrada")
    return atualizado

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def deletar_tempo(id: int, controller: TempoController = Depends(get_tempo_controller)):
    if not controller.delete(id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Data não encontrada")
    return Response(status_code=status.HTTP_204_NO_CONTENT)
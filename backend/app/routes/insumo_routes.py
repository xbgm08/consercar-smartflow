from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.config.database import get_db
from app.models.dim_insumo import DimInsumo

router = APIRouter(
    prefix="/api/insumos",
    tags=["Insumos"]
)

@router.get("/")
def listar_insumos(db: Session = Depends(get_db)):
    """
    Retorna a lista de todos os insumos cadastrados no Data Warehouse (Dim_Insumo).
    """
    insumos = db.query(DimInsumo).all()
    
    return {
        "total": len(insumos),
        "dados": insumos
    }
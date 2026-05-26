from fastapi import FastAPI
from app.routes import insumo_routes

app = FastAPI(
    title="CONSERCAR SmartFlow API",
    description="API para gestão de estoque e predição de insumos - CONSERCAR",
    version="1.0.0"
)

app.include_router(insumo_routes.router)

@app.get("/")
def read_root():
    return {
        "status": "online",
        "projeto": "CONSERCAR SmartFlow",
        "mensagem": "API rodando com sucesso e pronta para conexões!"
    }
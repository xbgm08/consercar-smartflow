from fastapi import FastAPI
from app.routes import insumo_routes
from app.routes import fornecedor_routes

app = FastAPI(
    title="CONSERCAR SmartFlow API",
    description="API para gestão de estoque e predição de insumos - CONSERCAR",
    version="1.0.0"
)

app.include_router(insumo_routes.router)
app.include_router(fornecedor_routes.router)

@app.get("/")
def read_root():
    return {
        "status": "online",
        "projeto": "CONSERCAR SmartFlow",
        "mensagem": "API rodando com sucesso e pronta para conexões!"
    }
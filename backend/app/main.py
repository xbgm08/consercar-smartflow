from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import cliente_routes
from app.routes import fornecedor_routes
from app.routes import funcionario_routes
from app.routes import insumo_routes
from app.routes import seguradora_routes
from app.routes import servico_routes
from app.routes import tempo_routes
from app.routes import veiculo_routes

app = FastAPI(
    title="CONSERCAR SmartFlow API",
    description="API para gestão de estoque e predição de insumos - CONSERCAR",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

app.include_router(cliente_routes.router)
app.include_router(fornecedor_routes.router)
app.include_router(funcionario_routes.router)
app.include_router(insumo_routes.router)
app.include_router(seguradora_routes.router)
app.include_router(servico_routes.router)
app.include_router(tempo_routes.router)
app.include_router(veiculo_routes.router)

@app.get("/")
def read_root():
    return {
        "status": "online",
        "projeto": "CONSERCAR SmartFlow",
        "mensagem": "API rodando com sucesso e pronta para conexões!"
    }
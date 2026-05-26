from fastapi import FastAPI

app = FastAPI(
    title="CONSERCAR SmartFlow API",
    description="API para gestão de estoque e predição de insumos - CONSERCAR",
    version="1.0.0"
)

@app.get("/")
def read_root():
    return {
        "status": "online",
        "projeto": "CONSERCAR SmartFlow",
        "mensagem": "API rodando com sucesso e pronta para conexões!"
    }
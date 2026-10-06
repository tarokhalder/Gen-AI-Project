from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from schemas import EditorialRequest
from langchain_service import generate_editorial

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def home():
    return {"message": "AI Editorial Generator API"}


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/api/editorial")
def create_editorial(data: EditorialRequest):
    try:
        return generate_editorial(
            problem=data.problem,
            code=data.code,
            language=data.language
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
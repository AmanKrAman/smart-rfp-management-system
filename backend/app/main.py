from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import database_engine, BaseModel
from app.routers import vendors,rfps, webhooks

BaseModel.metadata.create_all(bind=database_engine)

app = FastAPI(
    title="Smart RFP API",
    description="AI-powered RFP management system",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(vendors.router)
app.include_router(rfps.router) 
app.include_router(webhooks.router)


@app.get("/")
def root():
    return {
        "message": "Smart RFP API",
        "version": "1.0.0",
        "docs": "/docs"
    }


@app.get("/health")
def health_check():
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=settings.port,
        reload=settings.environment == "development"
    )


#uvicorn app.main:app --reload --host 0.0.0.0 --port 4200
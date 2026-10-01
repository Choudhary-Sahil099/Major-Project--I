from fastapi import APIRouter
from app.schemas import HealthResponse
from app.model_loader import ModelContainer
from app.config import CLASS_MAP

router = APIRouter(prefix="/api/v1", tags=["Health & Status"])

@router.get("/health", response_model=HealthResponse)
async def health_check():
    return HealthResponse(
        status="online",
        model_loaded=ModelContainer.is_loaded(),
        supported_classes=list(CLASS_MAP.values())
    )
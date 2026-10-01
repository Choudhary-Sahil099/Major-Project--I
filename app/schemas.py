from typing import Dict, List
from pydantic import BaseModel, Field

class HealthResponse(BaseModel):
    status: str
    model_loaded: bool
    supported_classes: List[str]

class PredictionResponse(BaseModel):
    soh_percentage: float = Field(..., description="Estimated Battery State of Health (0.0 - 100.0%)")
    risk_state: str = Field(..., description="Predicted hazard level: Safe, Thermal Warning, or Critical")
    risk_class_id: int = Field(..., description="Hazard class index (0, 1, or 2)")
    confidence: float = Field(..., description="Confidence percentage for the active class")
    probabilities: Dict[str, float] = Field(..., description="Softmax probabilities across all classes")

class ExplanationResponse(PredictionResponse):
    gradcam_base64: str = Field(..., description="Base64-encoded image string with Grad-CAM heatmap overlay")
    sensor_attributions: Dict[str, float] = Field(..., description="Relative feature attribution values for telemetry")
import io
import json
import numpy as np
from PIL import Image
from fastapi import HTTPException, status
from app.config import IMAGE_TARGET_SIZE, TELEMETRY_SHAPE

def preprocess_image(image_bytes: bytes) -> np.ndarray:
    try:
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        image = image.resize(IMAGE_TARGET_SIZE)
        return np.array(image, dtype=np.float32) / 255.0
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid image format: {str(e)}"
        )

def preprocess_telemetry(telemetry_json_str: str) -> np.ndarray:
    try:
        raw_data = json.loads(telemetry_json_str)
        tel_array = np.array(raw_data, dtype=np.float32)
        if tel_array.shape != TELEMETRY_SHAPE:
            raise ValueError(f"Expected shape {TELEMETRY_SHAPE}, but received {tel_array.shape}")
        return tel_array
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Telemetry parsing error: {str(e)}. Must be a 30x4 array [[V, I, T, R], ...]."
        )
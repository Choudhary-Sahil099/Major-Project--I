import base64
import cv2
import numpy as np
import tensorflow as tf
from typing import Optional
from fastapi import APIRouter, File, UploadFile, Form

from app.schemas import PredictionResponse, ExplanationResponse
from app.model_loader import ModelContainer
from app.config import CLASS_MAP
from app.utils import preprocess_image, preprocess_telemetry

router = APIRouter(prefix="/api/v1", tags=["Diagnostics & XAI"])

@router.post("/predict", response_model=PredictionResponse)
async def predict_battery_status(
    image_file: UploadFile = File(..., description="Thermal IR camera frame (JPEG/PNG)"),
    telemetry_data: str = Form(..., description="JSON string of 30x4 telemetry sequence [[V, I, T, R], ...]")
):
    img_bytes = await image_file.read()
    img_array = preprocess_image(img_bytes)
    tel_array = preprocess_telemetry(telemetry_data)

    img_tensor = tf.convert_to_tensor(img_array[np.newaxis, ...], dtype=tf.float32)
    tel_tensor = tf.convert_to_tensor(tel_array[np.newaxis, ...], dtype=tf.float32)

    soh_pred, risk_pred = ModelContainer.model({"thermal_image_input": img_tensor, "telemetry_seq_input": tel_tensor})
    
    soh_pct = round(float(soh_pred[0][0]) * 100.0, 2)
    risk_scores = risk_pred[0].numpy()
    pred_class_id = int(np.argmax(risk_scores))
    confidence_val = round(float(risk_scores[pred_class_id]) * 100.0, 2)

    probs = {CLASS_MAP[idx]: round(float(risk_scores[idx]), 4) for idx in range(len(CLASS_MAP))}

    return PredictionResponse(
        soh_percentage=soh_pct,
        risk_state=CLASS_MAP[pred_class_id],
        risk_class_id=pred_class_id,
        confidence=confidence_val,
        probabilities=probs
    )

@router.post("/explain", response_model=ExplanationResponse)
async def explain_battery_status(
    image_file: UploadFile = File(..., description="Thermal IR camera frame (JPEG/PNG)"),
    telemetry_data: str = Form(..., description="JSON string of 30x4 telemetry sequence [[V, I, T, R], ...]"),
    target_class_id: Optional[int] = Form(None, description="Optional class ID (0, 1, or 2) to explain")
):
    img_bytes = await image_file.read()
    img_array = preprocess_image(img_bytes)
    tel_array = preprocess_telemetry(telemetry_data)

    img_tensor = tf.convert_to_tensor(img_array[np.newaxis, ...], dtype=tf.float32)
    tel_tensor = tf.convert_to_tensor(tel_array[np.newaxis, ...], dtype=tf.float32)

    soh_pred, risk_pred = ModelContainer.model({"thermal_image_input": img_tensor, "telemetry_seq_input": tel_tensor})
    risk_scores = risk_pred[0].numpy()
    pred_class_id = int(np.argmax(risk_scores)) if target_class_id is None else target_class_id
    
    soh_pct = round(float(soh_pred[0][0]) * 100.0, 2)
    confidence_val = round(float(risk_scores[pred_class_id]) * 100.0, 2)
    probs = {CLASS_MAP[idx]: round(float(risk_scores[idx]), 4) for idx in range(len(CLASS_MAP))}

    heatmap, _ = ModelContainer.gradcam.generate_heatmap(img_tensor, tel_tensor, target_class_idx=pred_risk_idx)
    superimposed_bgr, _ = ModelContainer.gradcam.overlay_heatmap(heatmap, img_array)
    _, buffer = cv2.imencode(".png", superimposed_bgr)
    gradcam_b64 = f"data:image/png;base64,{base64.b64encode(buffer).decode('utf-8')}"

    attributions = ModelContainer.attributor.compute_attributions(img_tensor, tel_tensor, target_class_idx=pred_risk_idx)
    serialized_attributions = {k: round(float(v), 7) for k, v in attributions.items()}

    return ExplanationResponse(
        soh_percentage=soh_pct,
        risk_state=CLASS_MAP[pred_class_id],
        risk_class_id=pred_class_id,
        confidence=confidence_val,
        probabilities=probs,
        gradcam_base64=gradcam_b64,
        sensor_attributions=serialized_attributions
    )
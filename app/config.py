import os

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_PATH = os.path.join(PROJECT_ROOT, "models", "battery_multimodal_model.keras")

CLASS_MAP = {
    0: "Safe",
    1: "Thermal Warning",
    2: "Thermal Runaway Critical"
}

IMAGE_TARGET_SIZE = (224, 224)
TELEMETRY_SHAPE = (30, 4)
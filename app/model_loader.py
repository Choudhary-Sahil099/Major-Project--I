import os
import tensorflow as tf
from typing import Optional
from app.config import MODEL_PATH
from explainability import MultimodalGradCAM, TelemetryFeatureAttributor

class ModelContainer:
    model: Optional[tf.keras.Model] = None
    gradcam: Optional[MultimodalGradCAM] = None
    attributor: Optional[TelemetryFeatureAttributor] = None

    @classmethod
    def load(cls):
        if not os.path.exists(MODEL_PATH):
            raise RuntimeError(f"Model file not found at: {MODEL_PATH}. Train the model first.")

        print(f"Loading multimodal model from {MODEL_PATH}...")
        cls.model = tf.keras.models.load_model(MODEL_PATH)
        cls.gradcam = MultimodalGradCAM(model=cls.model, last_conv_layer_name="Conv_1")
        cls.attributor = TelemetryFeatureAttributor(model=cls.model)
        print("Backend ready: Model and XAI subsystems loaded into memory.")

    @classmethod
    def is_loaded(cls) -> bool:
        return cls.model is not None
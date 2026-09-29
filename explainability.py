import cv2
import numpy as np
import tensorflow as tf

# ==========================================
# 1. SPATIAL EXPLAINABILITY: GRAD-CAM
# ==========================================
class MultimodalGradCAM:
    """
    Computes Gradient-weighted Class Activation Mapping (Grad-CAM)
    for the 2D Thermal Branch of the Multimodal Battery Health Network.
    """
    def __init__(self, model, last_conv_layer_name="Conv_1"):
        self.model = model
        self.last_conv_layer_name = last_conv_layer_name
        
        # Access the internal MobileNetV2 backbone
        mobilenet_submodel = self.model.get_layer("mobilenetv2_1.00_224")
        self.conv_layer = mobilenet_submodel.get_layer(self.last_conv_layer_name)

        # Build sub-model up to the target conv layer
        self.conv_extractor = tf.keras.Model(
            inputs=mobilenet_submodel.inputs,
            outputs=self.conv_layer.output
        )

    def generate_heatmap(self, img_array, telemetry_array, target_class_idx=None):
        if len(img_array.shape) == 3:
            img_tensor = tf.expand_dims(img_array, axis=0)
        else:
            img_tensor = img_array

        if len(telemetry_array.shape) == 2:
            tel_tensor = tf.expand_dims(telemetry_array, axis=0)
        else:
            tel_tensor = telemetry_array

        with tf.GradientTape() as tape:
            # 1. Forward pass through conv extractor
            conv_outputs = self.conv_extractor(img_tensor)
            tape.watch(conv_outputs)

            # 2. Forward pass through spatial branch using layer names from existing layers
            spatial_pooled = self.model.get_layer("spatial_gap")(conv_outputs)
            spatial_dense = self.model.get_layer("spatial_embedding")(spatial_pooled)
            
            # Find dropout layers dynamically
            dropout_layers = [l for l in self.model.layers if "dropout" in l.name]
            spatial_dropout = dropout_layers[0] if len(dropout_layers) > 0 else tf.identity
            spatial_out = spatial_dropout(spatial_dense)

            # 3. Forward pass through temporal branch
            conv1d_layer = [l for l in self.model.layers if "conv1d" in l.name][0]
            conv1d_out = conv1d_layer(tel_tensor)
            bilstm_out = self.model.get_layer("bilstm_layer")(conv1d_out)
            temporal_dense = self.model.get_layer("temporal_embedding")(bilstm_out)
            
            temporal_dropout = dropout_layers[1] if len(dropout_layers) > 1 else tf.identity
            temporal_out = temporal_dropout(temporal_dense)

            # 4. Late fusion & output heads
            fused = self.model.get_layer("feature_concatenation")([spatial_out, temporal_out])
            att_weights = self.model.get_layer("fusion_attention_weights")(fused)
            gated = self.model.get_layer("attention_multiplication")([fused, att_weights])
            shared = self.model.get_layer("shared_representation")(gated)
            risk_preds = self.model.get_layer("risk_output")(shared)

            if target_class_idx is None:
                target_class_idx = tf.argmax(risk_preds[0])
            loss_value = risk_preds[:, target_class_idx]

        grads = tape.gradient(loss_value, conv_outputs)
        pooled_grads = tf.reduce_mean(grads, axis=(0, 1, 2))
        conv_outputs = conv_outputs[0]
        heatmap = conv_outputs @ pooled_grads[..., tf.newaxis]
        heatmap = tf.squeeze(heatmap)

        heatmap = tf.maximum(heatmap, 0) / (tf.math.reduce_max(heatmap) + 1e-10)
        return heatmap.numpy(), int(target_class_idx)

    def overlay_heatmap(self, heatmap, original_img, alpha=0.4, colormap=cv2.COLORMAP_JET):
        if original_img.max() <= 1.0:
            original_img_uint8 = np.uint8(255 * original_img)
        else:
            original_img_uint8 = np.uint8(original_img)

        heatmap_resized = cv2.resize(heatmap, (original_img_uint8.shape[1], original_img_uint8.shape[0]))
        heatmap_colored = cv2.applyColorMap(np.uint8(255 * heatmap_resized), colormap)
        superimposed_img = cv2.addWeighted(original_img_uint8, 1 - alpha, heatmap_colored, alpha, 0)
        return superimposed_img, heatmap_resized


# ==========================================
# 2. TEMPORAL EXPLAINABILITY: ATTRIBUTOR
# ==========================================
class TelemetryFeatureAttributor:
    """
    Computes sensitivity attribution values for sequential telemetry variables
    (Voltage, Current, Temperature, Resistance) relative to Runaway risk.
    """
    def __init__(self, model, feature_names=None):
        self.model = model
        self.feature_names = feature_names or ["Voltage (V)", "Current (I)", "Temperature (°C)", "Internal Res (mΩ)"]

    def compute_attributions(self, img_tensor, telemetry_tensor, target_class_idx=1, steps=20):
        baseline_tel = tf.zeros_like(telemetry_tensor)
        alphas = tf.linspace(0.0, 1.0, steps)
        interpolated_inputs = [baseline_tel + alpha * (telemetry_tensor - baseline_tel) for alpha in alphas]
        
        grads_accumulated = tf.zeros_like(telemetry_tensor)
        for interpolated in interpolated_inputs:
            with tf.GradientTape() as tape:
                tape.watch(interpolated)
                preds = self.model({"thermal_image_input": img_tensor, "telemetry_seq_input": interpolated})
                target_score = preds[1][:, target_class_idx]
            grads = tape.gradient(target_score, interpolated)
            if grads is not None:
                grads_accumulated += grads

        avg_grads = grads_accumulated / float(steps)
        integrated_gradients = (telemetry_tensor - baseline_tel) * avg_grads
        feature_importance = tf.reduce_mean(integrated_gradients, axis=(0, 1)).numpy()
        return dict(zip(self.feature_names, feature_importance))
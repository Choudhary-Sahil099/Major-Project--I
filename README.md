# ⚡ Explainable Multimodal EV Battery Diagnostic System

A production-ready deep learning system designed for electric vehicle (EV) battery health estimation and early thermal runaway prevention. The platform ingests synchronized **2D spatial infrared (IR) thermal frames** and **1D temporal sensor telemetry sequences (Voltage, Current, Temperature, Internal Resistance)** to deliver real-time State of Health (SOH) regression, hazard risk classification, and multimodal Explainable AI (XAI) diagnostics.

---

## 📌 Project Overview & Architecture

The system is split into two primary components:
1. **Multimodal Core & Inference Backend (`FastAPI`)**:
   - **Vision Branch**: MobileNetV2 spatial backbone extracting thermal gradient features from $224 \times 224 \times 3$ IR images.
   - **Telemetry Branch**: Bidirectional LSTM (BiLSTM) evaluating $30 \times 4$ sliding-window temporal electrical metrics.
   - **Attention-based Multimodal Fusion**: Merges spatial and sequential features.
   - **Outputs**: SOH Capacity Estimation (continuous regression) & Thermal Hazard State (`Safe`, `Thermal Warning`, `Thermal Runaway Critical`).
   - **XAI Engine**: Grad-CAM for spatial localization of cell hotspots and Integrated Gradients for temporal sensor attributions.
2. **Interactive UI Dashboard (`Streamlit` / Custom Web UI)**:
   - Live telemetry and image file loaders, SOH visual gauge, hazard alerts, and real-time rendering of Grad-CAM heatmaps and attribution charts.

---

## 📂 Project Repository Structure

```text
Major_Project/
├── app/
│   ├── routes/
│   │   ├── health.py             # GET /api/v1/health
│   │   └── predict.py            # POST /api/v1/predict & POST /api/v1/explain
│   ├── config.py                 # Paths, device configs, and class labels
│   ├── explainability.py         # Grad-CAM and Integrated Gradients algorithms
│   ├── model_loader.py           # Thread-safe singleton model container
│   ├── schemas.py                # Pydantic input/output schemas
│   └── utils.py                  # Image and telemetry preprocessing
├── artifacts/                    # Evaluation artifacts and baseline plots
├── models/
│   └── battery_multimodal_model.keras  # Pretrained multimodal model weights
├── sample_data/                  # Minimal single-sample test assets
├── test_dataset/                 # Image bank (safe, warning, critical PNGs)
├── test_telemetry/               # Telemetry bank (safe, warning, critical JSONs)
├── dashboard.py                  # Streamlit dashboard interface
├── main.py                       # Root FastAPI application entrypoint
├── requirements.txt              # Environment dependencies
└── README.md                     # Documentation

🚀 Teammate Setup & Installation Guide
1. Prerequisites
Python 3.10 or 3.11 installed

Git installed

VS Code (recommended)

2. Clone and Initialize Environment
# Clone the repository
git clone <YOUR_GITHUB_REPO_URL>
cd Major_Project

# Create a clean virtual environment
python -m venv .venv

# Activate the virtual environment
# Windows (PowerShell):
.\.venv\Scripts\Activate.ps1
# Linux/macOS:
source .venv/bin/activate

# Upgrade pip and install all dependencies
pip install --upgrade pip
pip install -r requirements.txt

Note for Windows Users: If script execution is restricted when running Activate.ps1, open PowerShell as Administrator and run:
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

⚙️ Running the Services
1. Start the FastAPI Backend Server
In your first terminal tab (with .venv active):
uvicorn main:app --host 127.0.0.1 --port 8000 --reload

Root Landing Page: http://127.0.0.1:8000/

Interactive Swagger Documentation: http://127.0.0.1:8000/docs

📡 API Specification & Integration Guide (For Frontend Developers)
The backend runs on http://127.0.0.1:8000 with full CORS enabled.

1. Health Status
Method & Route: GET /api/v1/health

Response:
{
  "status": "online",
  "model_loaded": true,
  "supported_classes": ["Safe", "Thermal Warning", "Thermal Runaway Critical"]
}

2. Standard InferenceMethod & Route: 
Response:

JSON
{
  "soh_percentage": 78.45,
  "risk_state": "Safe",
  "risk_class_id": 0,
  "confidence": 97.23,
  "probabilities": {
    "Safe": 0.9723,
    "Thermal Warning": 0.0211,
    "Thermal Runaway Critical": 0.0066
  }
}

3. Full Explainability (Inference + Grad-CAM + Attributions)
Response:

JSON
{
  "soh_percentage": 68.21,
  "risk_state": "Thermal Warning",
  "risk_class_id": 1,
  "confidence": 92.40,
  "probabilities": {
    "Safe": 0.052,
    "Thermal Warning": 0.924,
    "Thermal Runaway Critical": 0.024
  },
  "gradcam_base64": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUg...",
  "sensor_attributions": {
    "Voltage (V)": 0.00012,
    "Current (I)": -0.00004,
    "Temperature (°C)": 0.00085,
    "Internal Res (mΩ)": 0.00031
  }
}

How to Render Outputs in the Frontend:
Grad-CAM Heatmap: Bind the gradcam_base64 value directly to an image element source:

HTML/React: <img src={response.gradcam_base64} alt="Grad-CAM" />

Streamlit: st.image(base64.b64decode(response["gradcam_base64"].split(",")[1]))

Sensor Attributions: Plot sensor_attributions as a horizontal bar chart where values indicate relative feature importance toward the detected hazard state.

Testing Assets
Pre-generated test suites are available in the repository for validation:

Test Images: Located in test_dataset/safe/, test_dataset/warning/, and test_dataset/critical/.

Test Telemetry: Located in test_telemetry/safe/, test_telemetry/warning/, and test_telemetry/critical/.
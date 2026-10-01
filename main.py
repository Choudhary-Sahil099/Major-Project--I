from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse

from app.model_loader import ModelContainer
from app.routes import health, predict

@asynccontextmanager
async def lifespan(app: FastAPI):
    ModelContainer.load()
    yield
    print("Shutting down API server...")

app = FastAPI(
    title="Explainable Multimodal EV Battery Diagnostics API",
    version="2.0.0",
    description="Modular production REST backend for battery health regression and thermal runaway explainability.",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----------------------------------------------------
# HOME ENDPOINT (Root "/")
# ----------------------------------------------------
@app.get("/", response_class=HTMLResponse, tags=["General"])
async def root_home():
    return """
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>EV Battery Multimodal AI API</title>
        <style>
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                background-color: #0d1117;
                color: #c9d1d9;
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
                margin: 0;
            }
            .card {
                background-color: #161b22;
                border: 1px solid #30363d;
                border-radius: 12px;
                padding: 40px;
                max-width: 600px;
                text-align: center;
                box-shadow: 0 10px 25px rgba(0,0,0,0.5);
            }
            h1 { color: #58a6ff; margin-bottom: 8px; }
            .badge {
                display: inline-block;
                padding: 6px 12px;
                background-color: #238636;
                color: #ffffff;
                font-size: 13px;
                font-weight: 600;
                border-radius: 20px;
                margin-bottom: 20px;
            }
            p { color: #8b949e; line-height: 1.6; margin-bottom: 25px; }
            .btn {
                display: inline-block;
                padding: 10px 20px;
                background-color: #1f6feb;
                color: #ffffff;
                text-decoration: none;
                border-radius: 6px;
                font-weight: bold;
                transition: background-color 0.2s;
            }
            .btn:hover { background-color: #388bfd; }
            .endpoints {
                text-align: left;
                background-color: #0d1117;
                padding: 15px;
                border-radius: 6px;
                margin-top: 25px;
                font-family: monospace;
                font-size: 13px;
                border: 1px solid #30363d;
            }
            .method { color: #7ee787; font-weight: bold; }
        </style>
    </head>
    <body>
        <div class="card">
            <span class="badge">● Online & Serving</span>
            <h1>EV Battery Diagnostics API</h1>
            <p>Explainable Multimodal Deep Learning Backend for EV Battery Health Regression and Thermal Runaway Prevention.</p>
            <a href="/docs" class="btn">Open Interactive Swagger Docs</a>
            
            <div class="endpoints">
                <div><span class="method">GET</span>  /api/v1/health</div>
                <div><span class="method">POST</span> /api/v1/predict</div>
                <div><span class="method">POST</span> /api/v1/explain</div>
            </div>
        </div>
    </body>
    </html>
    """

# Register modular routes
app.include_router(health.router)
app.include_router(predict.router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
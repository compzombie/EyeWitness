from fastapi import FastAPI, UploadFile, File, Request
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse, FileResponse
from fastapi.templating import Jinja2Templates
import uvicorn
import os
import json
from pydantic import BaseModel

# Initialize FastAPI app
app = FastAPI()

CONFIG_PATH = os.path.join(os.path.dirname(__file__), "config", "config.json")
os.makedirs(os.path.dirname(CONFIG_PATH), exist_ok=True)

class LocalConfig(BaseModel):
    localPath: str

def read_config():
    if os.path.exists(CONFIG_PATH):
        with open(CONFIG_PATH, "r") as f:
            return json.load(f)
    return {}

def write_config(data: dict):
    with open(CONFIG_PATH, "w") as f:
        json.dump(data, f)

@app.get("/config/local")
def get_local_config():
    return read_config()

@app.post("/config/local")
def set_local_config(cfg: LocalConfig):
    config = read_config()
    config["localPath"] = cfg.localPath
    write_config(config)
    return {"status": "success", "localPath": cfg.localPath}

# Setup static file serving and templates
app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

# Serve Frontend
@app.get("/", response_class=HTMLResponse)
async def home(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

# Serve PWA manifest
@app.get("/manifest.json", response_class=FileResponse)
async def manifest():
    return FileResponse("static/manifest.json")

# Serve PWA service worker
@app.get("/service-worker.js", response_class=FileResponse)
async def service_worker():
    return FileResponse("static/service-worker.js")

# Video Upload Endpoint
@app.post("/upload/")
async def upload_video(file: UploadFile = File(...)):
    file_location = f"static/uploads/{file.filename}"
    os.makedirs(os.path.dirname(file_location), exist_ok=True)
    with open(file_location, "wb") as buffer:
        buffer.write(await file.read())
    return {"filename": file.filename, "message": "Video uploaded successfully."}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8080)

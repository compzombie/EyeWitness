from fastapi import FastAPI, UploadFile, File, Request, Form
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse, FileResponse
from fastapi.templating import Jinja2Templates
import uvicorn
import os
import json
from pydantic import BaseModel
from typing import Optional

# Initialize FastAPI app
app = FastAPI()

CONFIG_PATH = os.path.join(os.path.dirname(__file__), "config", "config.json")
os.makedirs(os.path.dirname(CONFIG_PATH), exist_ok=True)

class Config(BaseModel):
    localPath: Optional[str] = None
    email: Optional[str] = None

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
def set_local_config(cfg: Config):
    config = read_config()
    if cfg.localPath is not None:
        config["localPath"] = cfg.localPath
    if cfg.email is not None:
        config["email"] = cfg.email
    write_config(config)
    return {"status": "success", "localPath": config.get("localPath", ""), "email": config.get("email", "")}

# Setup static file serving for assets (CSS, JS, etc.)
app.mount("/static", StaticFiles(directory="static"), name="static")

# Serve Frontend: now serving /index.html from the static folder directly.
@app.get("/", response_class=HTMLResponse)
async def home(request: Request):
    return FileResponse("static/index.html")

# Serve PWA manifest
@app.get("/manifest.json", response_class=FileResponse)
async def manifest():
    return FileResponse("static/manifest.json")

# Serve PWA service worker
@app.get("/service-worker.js", response_class=FileResponse)
async def service_worker():
    return FileResponse("static/service-worker.js")

# Add a public video access endpoint so videos can be shared
@app.get("/videos/{filename}")
async def get_video(filename: str):
    config = read_config()
    save_dir = config.get("localPath", "static/uploads")
    file_path = os.path.join(save_dir, filename)
    
    if not os.path.exists(file_path):
        return {"error": "File not found"}
        
    return FileResponse(
        file_path, 
        media_type="video/webm",
        filename=filename
    )

# Simplified save endpoint that also returns sharing URL
@app.post("/save/")
async def save_video(file: UploadFile = File(...)):
    # Read configured path, defaulting to "static/uploads"
    config = read_config()
    save_dir = config.get("localPath", "static/uploads")
    file_location = os.path.join(save_dir, file.filename)
    os.makedirs(os.path.dirname(file_location), exist_ok=True)
    
    with open(file_location, "wb") as buffer:
        buffer.write(await file.read())
    
    # Generate sharing URL
    base_url = "http://localhost:8080" if __name__ == "__main__" else ""
    share_url = f"{base_url}/videos/{file.filename}"
    
    return {
        "filename": file.filename, 
        "message": "Video saved successfully.", 
        "saveLocation": file_location,
        "shareUrl": share_url
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8080)

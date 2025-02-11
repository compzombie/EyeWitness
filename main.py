from fastapi import FastAPI, UploadFile, File, Request
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse, FileResponse
from fastapi.templating import Jinja2Templates
import uvicorn
import os

# Initialize FastAPI app
app = FastAPI()

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
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8080,
        ssl_certfile="ssl/server.crt",  # Path to your SSL certificate
        ssl_keyfile="ssl/server.key"    # Path to your SSL key
    )

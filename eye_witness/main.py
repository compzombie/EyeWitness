from fastapi import FastAPI, UploadFile, File, Request
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
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

# Video Upload Endpoint
@app.post("/upload/")
async def upload_video(file: UploadFile = File(...)):
    file_location = f"static/uploads/{file.filename}"
    with open(file_location, "wb") as buffer:
        buffer.write(await file.read())
    return {"filename": file.filename, "message": "Video uploaded successfully."}

if __name__ == "__main__":
    os.makedirs("static/uploads", exist_ok=True)
    uvicorn.run(app, host="127.0.0.1", port=8000)

from fastapi import FastAPI, UploadFile, File, Request
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse, FileResponse
import uvicorn
import os

# Initialize FastAPI app
app = FastAPI()

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
    # Simple fixed path for videos
    file_path = os.path.join("static/uploads", filename)
    
    if not os.path.exists(file_path):
        return {"error": "File not found"}
        
    return FileResponse(
        file_path, 
        media_type="video/webm",
        filename=filename
    )

# Simplified save endpoint with no configuration needed
@app.post("/save/")
async def save_video(file: UploadFile = File(...)):
    try:
        # Create uploads directory if it doesn't exist
        os.makedirs("static/uploads", exist_ok=True)
        
        # Save file to a consistent location
        file_location = os.path.join("static/uploads", file.filename)
        
        with open(file_location, "wb") as buffer:
            buffer.write(await file.read())
        
        # Generate a URL for downloading the video
        download_url = f"/videos/{file.filename}"
        
        return {
            "filename": file.filename,
            "message": "Video saved successfully.",
            "saveLocation": file_location,
            "downloadUrl": download_url
        }
    except Exception as e:
        print(f"Error saving video: {str(e)}")
        return {"error": str(e)}

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8080))
    uvicorn.run(app, host="0.0.0.0", port=port)

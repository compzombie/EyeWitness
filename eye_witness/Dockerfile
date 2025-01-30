# Use a lightweight Python base image
FROM python:3.11-slim

# Create a working directory
WORKDIR /app

# Copy requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of your code
COPY . .

# Expose port 8080 (Cloud Run default)
EXPOSE 8080

# Start FastAPI using uvicorn, listening on port 8080
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]

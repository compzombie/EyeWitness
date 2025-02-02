# Use a lightweight Python base image
FROM python:3.9-slim

# Create a working directory
WORKDIR /app

# Install necessary tools
RUN apt-get update && apt-get install -y \
    vim \
    curl \
    net-tools \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install dependencies
COPY requirements.txt requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the code
COPY . .

# Expose port 8080
EXPOSE 8080

# Start the FastAPI app via main.py (which uses uvicorn)
CMD ["python", "main.py"]

# EyeWitness

A lightweight, cross-platform web application designed for recording and preserving video evidence.

## About

EyeWitness is a minimalist Progressive Web App that allows witnesses to quickly record, save, and share video evidence from any device with a camera and web browser. Built with accessibility and reliability in mind, it works across a wide range of devices and network conditions.

## Features

- **Simple Interface**: Intuitive, distraction-free controls for recording evidence
- **Cross-Platform**: Works on mobile phones, tablets, and desktop devices
- **Offline Capability**: Progressive Web App design allows installation on devices
- **Direct Sharing**: Native device sharing options for immediate distribution
- **Local Storage**: Videos are saved both on the server and to the user's device
- **Witness Guidance**: Built-in advice for properly documenting evidence

## Technical Stack

- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Backend**: Python with FastAPI
- **Media Handling**: HTML5 Media Capture and Web Share APIs
- **No External Dependencies**: Minimal library usage for maximum compatibility

## Installation

### Prerequisites
- Python 3.7+
- pip

### Steps

1. Clone the repository:
```bash
git clone https://github.com/yourusername/EyeWitness.git
cd EyeWitness
```

2. Install the requirements:
```bash
pip install fastapi uvicorn python-multipart
```

3. Run the application:
```bash
python main.py
```

4. Access the application at `http://localhost:8080`

## Deployment

The application can be deployed to various hosting platforms:

### Google Cloud Run (Current Setup)
The app is configured to run on Google Cloud Run, which automatically handles the `PORT` environment variable.

### Other Platforms
For other platforms, ensure the `PORT` environment variable is set or modify the port in `main.py`.

## Usage

1. **Start the App**: Open the app in a web browser
2. **Allow Permissions**: Grant camera and microphone access when prompted
3. **Record Evidence**:
   - Press "Start Recording" to begin capturing video
   - Press "Stop Recording" when finished
4. **Share or Save**:
   - On mobile devices: Use the native share menu to distribute the video
   - On desktop: The video will automatically download to your device

5. **Get Advice**: Click the "Advice" button for guidelines on how to effectively capture evidence

## Best Practices (from Advice Button)

1. Position yourself where you can see clearly what is happening
2. Stay at a safe distance from any conflict
3. Record continuously if possible
4. Speak clearly to describe what you're witnessing
5. Include date, time, and location in your verbal description
6. After recording, save the video to your device
7. Share your recording as soon as possible to preserve evidence


## About the Project

EyeWitness was created to empower witnesses to preserve important evidence with minimal friction, using technology that's accessible to everyone.

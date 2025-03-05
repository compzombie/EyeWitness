// Variables for the recording logic
let mediaRecorder;
let recordedChunks = [];
let stream = null;
let lastRecordedVideo = null; // Store the last recorded video for re-sharing

// DOMContentLoaded handler for initial setup and event binding
document.addEventListener("DOMContentLoaded", async () => {
  // Advice button event handler
  const adviceBtn = document.getElementById('adviceBtn');
  if (adviceBtn) {
    adviceBtn.addEventListener('click', showAdvice);
  }

  // Automatically enable the camera when the DOM loads
  if (!window.isSecureContext) {
    console.error("Camera access requires a secure context.");
    alert("Camera access requires a secure context. Please use HTTPS or localhost.");
  } else if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    console.log("getUserMedia supported. Attempting to get camera stream...");
    try {
      // Set video constraints to prefer rear camera on mobile devices
      const constraints = { 
        video: {
          facingMode: { ideal: "environment" }  // Prefer rear camera
        }, 
        audio: true 
      };
      
      stream = await navigator.mediaDevices.getUserMedia(constraints);
      document.getElementById('videoPreview').srcObject = stream;
      console.log("Camera stream obtained.");
    } catch (err) {
      console.error('Camera access was denied or failed:', err);
      alert("Failed to access camera. Check your device permissions.");
    }
  } else {
    console.error('Media Devices API or getUserMedia is not supported.');
    alert('Your device does not support camera access via getUserMedia.');
  }

  // Service Worker registration for PWA functionality
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js')
      .then(() => console.log('Service Worker registered'))
      .catch(err => console.error('Service Worker registration failed:', err));
  }
});

// Start recording using the global "stream" variable
async function startRecording() {
  if (!stream) {
    alert("No camera stream available!");
    return;
  }
  recordedChunks = [];
  mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm; codecs=vp9' });
  mediaRecorder.ondataavailable = event => {
    if (event.data.size > 0) {
      recordedChunks.push(event.data);
    }
  };
  mediaRecorder.start();

  // Update button states
  document.getElementById('startBtn').disabled = true;
  document.getElementById('stopBtn').disabled = false;
  document.getElementById('shareAgainBtn').classList.remove('active');
  
  // Show recording indicators
  document.getElementById('recordingDot').classList.add('active');
  document.getElementById('videoBorder').classList.add('active');
}

// Stop recording and save the recorded video
async function stopRecording() {
  if (!mediaRecorder) return;
  mediaRecorder.stop();
  mediaRecorder.onstop = async () => {
    try {
      // Hide recording indicators
      document.getElementById('recordingDot').classList.remove('active');
      document.getElementById('videoBorder').classList.remove('active');
      
      const blob = new Blob(recordedChunks, { type: 'video/webm' });
      const timestamp = Date.now();
      const filename = `recording_${timestamp}.webm`;
      
      // Store for potential resharing
      lastRecordedVideo = {
        blob: blob,
        filename: filename,
        timestamp: timestamp
      };
      
      // Create a File object from the blob for sharing
      const videoFile = new File([blob], filename, { type: 'video/webm' });
      
      // Create form data for saving the video
      const formData = new FormData();
      formData.append('file', blob, filename);
      
      // First try to save the file on the server
      const response = await fetch('/save/', {
        method: 'POST',
        body: formData,
      });
      const result = await response.json();
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      console.log('Video saved successfully on server:', result);
      
      // Show the share again button since we have a video stored
      document.getElementById('shareAgainBtn').classList.add('active');
      
      // Try to share using native sharing
      await shareVideo(videoFile, filename);
    } catch (error) {
      console.error('Error processing video:', error);
      alert('Error: ' + error.message);
    }
    
    // Reset button states
    document.getElementById('startBtn').disabled = false;
    document.getElementById('stopBtn').disabled = true;
  };
}

// Function to share the last recorded video again
async function shareLastRecording() {
  if (!lastRecordedVideo) {
    alert("No video available to share!");
    return;
  }
  
  try {
    const videoFile = new File(
      [lastRecordedVideo.blob], 
      lastRecordedVideo.filename, 
      { type: 'video/webm' }
    );
    
    await shareVideo(videoFile, lastRecordedVideo.filename);
  } catch (error) {
    console.error('Error sharing video:', error);
    alert('Error sharing: ' + error.message);
  }
}

// Sharing logic to handle different sharing capabilities
async function shareVideo(videoFile, filename) {
  // Try to share using native sharing
  if (navigator.canShare && navigator.canShare({ files: [videoFile] })) {
    try {
      await navigator.share({
        files: [videoFile],
        title: 'EyeWitness Recording',
        text: 'Video recording from EyeWitness app'
      });
      alert('Video shared successfully!');
    } catch (shareError) {
      console.error('Error sharing:', shareError);
      
      // If share fails, try to download the file directly
      const downloadLink = document.createElement('a');
      downloadLink.href = URL.createObjectURL(videoFile.blob || videoFile);
      downloadLink.download = filename;
      downloadLink.click();
      alert('Video saved to your downloads.');
    }
  } else {
    // If share API not available, use download
    const downloadLink = document.createElement('a');
    downloadLink.href = URL.createObjectURL(videoFile.blob || videoFile);
    downloadLink.download = filename;
    downloadLink.click();
    alert('Video saved to your downloads.');
  }
}

// Advice functionality
function showAdvice() {
  alert('EyeWitness App Advice:\n\n' +
        '1. Position yourself where you can see clearly what is happening.\n' +
        '2. Stay at a safe distance from any conflict.\n' +
        '3. Record continuously if possible.\n' +
        '4. Speak clearly to describe what you\'re witnessing.\n' +
        '5. Include date, time, and location in your verbal description.\n' +
        '6. After recording, save the video to your device.\n' +
        '7. Share your recording as soon as possible to preserve evidence.');
}

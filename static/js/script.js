// Variables for the recording logic and options dropdown
let mediaRecorder;
let recordedChunks = [];
let stream = null;

// DOMContentLoaded handler for initial setup and event binding.
document.addEventListener("DOMContentLoaded", async () => {
  // Options button dropdown toggle
  const userOptionsBtn = document.getElementById('userOptionsBtn');
  const userOptionsMenu = document.getElementById('userOptionsMenu');
  
  userOptionsBtn.addEventListener('click', () => {
    console.log("Options button clicked");
    userOptionsMenu.classList.toggle('active');
  });

  // File input event listener to update local path
  document.getElementById('localPathInput').addEventListener('change', async (event) => {
    const files = event.target.files;
    if (files.length > 0) {
      const filePath = files[0].webkitRelativePath;
      const directory = filePath.split('/')[0];
      const localPath = directory;
      try {
        const response = await fetch('/config/local', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ localPath })
        });
        if (response.ok) {
          alert('Local path saved: ' + localPath);
          document.getElementById('localPathDisplay').textContent = localPath;
        } else {
          alert('Failed to save local path.');
        }
      } catch (e) {
        console.error(e);
      }
    }
  });

  // Automatically enable the camera when the DOM loads
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: 'environment' }},
      audio: true
    });
    document.getElementById('videoPreview').srcObject = stream;
  } catch (err) {
    console.error('Camera access was denied:', err);
  }

  // Service Worker registration
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js')
      .then(() => console.log('Service Worker registered'))
      .catch(err => console.error('Service Worker registration failed:', err));
  }
});

document.addEventListener('DOMContentLoaded', function() {
    const userOptionsBtn = document.getElementById('userOptionsBtn');
    const userOptionsMenu = document.getElementById('userOptionsMenu');

    userOptionsBtn.addEventListener('click', function() {
        // Toggle the display style between 'block' and 'none'
        if (userOptionsMenu.style.display === 'block') {
            userOptionsMenu.style.display = 'none';
        } else {
            userOptionsMenu.style.display = 'block';
        }
    });
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
}

// Stop recording and upload the recorded video
async function stopRecording() {
  if (!mediaRecorder) return;
  mediaRecorder.stop();
  mediaRecorder.onstop = async () => {
    const blob = new Blob(recordedChunks, { type: 'video/webm' });
    const formData = new FormData();
    const filename = `recording_${Date.now()}.webm`;
    formData.append('file', blob, filename);
    try {
      const response = await fetch('/upload/', {
        method: 'POST',
        body: formData,
      });
      const result = await response.json();
      console.log('Upload success:', result);
      alert(`Video uploaded successfully! Filename: ${result.filename}`);
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload video.');
    }
    // Reset button states
    document.getElementById('startBtn').disabled = false;
    document.getElementById('stopBtn').disabled = true;
  };
}

// Option Menu methods exposed globally if needed
window.manageSaveLocations = function() {
  const submenu = document.getElementById('saveLocationsSubmenu');
  submenu.classList.toggle('active');
}

window.showAdvice = function() {
  alert('Advice clicked.');
  document.getElementById('userOptionsMenu').classList.remove('active');
}

window.setLocalPath = function() {
  document.getElementById('localPathInput').click();
}

window.setEmailPath = function() {
  const currentEmail = document.getElementById('emailDisplay').textContent;
  const newEmail = prompt("Enter your email address:", currentEmail);
  if (newEmail !== null && newEmail.trim() !== "") {
    document.getElementById('emailDisplay').textContent = newEmail.trim();
  }
}

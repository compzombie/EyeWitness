// Variables for the recording logic and options dropdown
let mediaRecorder;
let recordedChunks = [];
let stream = null;

// DOMContentLoaded handler for initial setup and event binding.
document.addEventListener("DOMContentLoaded", async () => {
  // Fetch config on page load and update display fields
  try {
    const res = await fetch('/config/local');
    const config = await res.json();
    if (config.localPath) {
      document.getElementById('localPathDisplay').textContent = config.localPath;
    }
    if (config.email) {
      document.getElementById('emailDisplay').textContent = config.email;
    }
  } catch (err) {
    console.error("Failed to load config:", err);
  }
  
  // Options button dropdown toggle
  const userOptionsBtn = document.getElementById('userOptionsBtn');
  const userOptionsMenu = document.getElementById('userOptionsMenu');
  
  userOptionsBtn.addEventListener('click', () => {
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
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    console.log("getUserMedia supported. Attempting to get camera stream...");
    try {
      stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
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

// Stop recording and save the recorded video
async function stopRecording() {
  if (!mediaRecorder) return;
  mediaRecorder.stop();
  mediaRecorder.onstop = async () => {
    const blob = new Blob(recordedChunks, { type: 'video/webm' });
    const formData = new FormData();
    const filename = `recording_${Date.now()}.webm`;
    formData.append('file', blob, filename);
    try {
      const response = await fetch('/save/', { // updated endpoint URL
        method: 'POST',
        body: formData,
      });
      const result = await response.json();
      alert(`Video saved successfully!\nFilename: ${result.filename}\nSaved to: ${result.saveLocation}`);
    } catch (error) {
      console.error('Save error:', error);
      alert('Failed to save video.');
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

window.setLocalPath = async function() {
  // Check if the File System Access API is available and if not, assume mobile fallback
  if ("showDirectoryPicker" in window && !/Mobi|Android/i.test(navigator.userAgent)) {
    try {
      const directoryHandle = await window.showDirectoryPicker();
      // Note: For security reasons, a full absolute path isn’t provided.
      // Use the directory name as a hint if needed
      const localPath = directoryHandle.name;
      document.getElementById('localPathDisplay').textContent = localPath;
      const response = await fetch('/config/local', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ localPath })
      });
      if (response.ok) {
        alert('Local path saved: ' + localPath);
      } else {
        alert('Failed to save local path.');
      }
    } catch (err) {
      console.error('Directory selection was cancelled or failed', err);
    }
  } else {
    // For mobile devices (or if API unsupported), fall back to the default folder
    const defaultPath = "static/uploads";
    alert("Your device doesn't support directory selection. Using default folder: " + defaultPath);
    document.getElementById('localPathDisplay').textContent = defaultPath;
    // Optionally, update the config on the server with the default value
    try {
      const response = await fetch('/config/local', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ localPath: defaultPath })
      });
      if (!response.ok) {
         alert('Failed to save local path.');
      }
    } catch (err) {
      console.error(err);
    }
  }
}

window.setEmailPath = async function() {
  const currentEmail = document.getElementById('emailDisplay').textContent;
  const newEmail = prompt("Enter your email address:", currentEmail);
  if (newEmail !== null && newEmail.trim() !== "") {
    const email = newEmail.trim();
    document.getElementById('emailDisplay').textContent = email;
    // Preserve the current localPath value so we don't override it
    const localPath = document.getElementById('localPathDisplay').textContent;
    try {
      const response = await fetch('/config/local', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ localPath, email })
      });
      if (response.ok) {
         alert('Email saved: ' + email);
      } else {
         alert('Failed to save email.');
      }
    } catch (err) {
      console.error(err);
    }
  }
}

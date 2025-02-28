// Variables for the recording logic
let mediaRecorder;
let recordedChunks = [];
let stream = null;

// DOMContentLoaded handler for initial setup and event binding.
document.addEventListener("DOMContentLoaded", async () => {
  // Advice button event handler - simplified from previous options menu
  const adviceBtn = document.getElementById('adviceBtn');
  if (adviceBtn) {
    adviceBtn.addEventListener('click', function() {
      showAdvice();
    });
  }

  // Automatically enable the camera when the DOM loads
  if (!window.isSecureContext) {
    console.error("Camera access requires a secure context.");
    alert("Camera access requires a secure context. Please use HTTPS or localhost.");
  } else if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
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

// Modified stopRecording function with simpler mobile-first approach
async function stopRecording() {
  if (!mediaRecorder) return;
  mediaRecorder.stop();
  mediaRecorder.onstop = async () => {
    try {
      const blob = new Blob(recordedChunks, { type: 'video/webm' });
      const filename = `recording_${Date.now()}.webm`;
      
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
          downloadLink.href = URL.createObjectURL(blob);
          downloadLink.download = filename;
          downloadLink.click();
          alert('Video saved to your downloads.');
        }
      } else {
        // If share API not available, use download
        const downloadLink = document.createElement('a');
        downloadLink.href = URL.createObjectURL(blob);
        downloadLink.download = filename;
        downloadLink.click();
        alert('Video saved to your downloads.');
      }
    } catch (error) {
      console.error('Error processing video:', error);
      alert('Error: ' + error.message);
    }
    
    // Reset button states
    document.getElementById('startBtn').disabled = false;
    document.getElementById('stopBtn').disabled = true;
  };
}

// Helper function to handle URL sharing fallback
async function tryShareUrl(shareUrl, filename) {
  if (navigator.share) {
    try {
      await navigator.share({
        title: 'EyeWitness Video Recording',
        text: 'Check out this video recording',
        url: shareUrl
      });
      console.log('Video URL shared successfully');
    } catch (shareError) {
      console.error('Error sharing video URL:', shareError);
      
      // If sharing fails, ask if user wants to email the video
      handleEmailFallback(shareUrl);
    }
  } else {
    // On desktop or without share capability, show download link
    const downloadLink = document.createElement('a');
    downloadLink.href = shareUrl;
    downloadLink.download = filename;
    downloadLink.target = "_blank";
    downloadLink.click();
    
    // Also send email notification if email is configured
    handleEmailFallback(shareUrl);
  }
}

// Helper function to handle email fallback
function handleEmailFallback(shareUrl) {
  const email = document.getElementById('emailDisplay').textContent;
  if (email) {
    if (confirm('Would you like to email this video to yourself?')) {
      window.open(`mailto:${email}?subject=EyeWitness Recording&body=Your recording is available at ${window.location.origin}${shareUrl}`);
    }
  }
}

// Option Menu methods exposed globally if needed
window.manageSaveLocations = function() {
  const submenu = document.getElementById('saveLocationsSubmenu');
  submenu.classList.toggle('active');
}

// Simplify local path setting for mobile
window.setLocalPath = async function() {
  // Mobile devices can't really select directories, so just use the default
  const defaultPath = "static/uploads";
  document.getElementById('localPathDisplay').textContent = defaultPath;
  
  try {
    const response = await fetch('/config/local', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ localPath: defaultPath })
    });
    if (response.ok) {
      alert('Using default storage location: ' + defaultPath);
    } else {
      alert('Failed to set storage location.');
    }
  } catch (err) {
    console.error(err);
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

// Function to prompt user for SMTP settings
function promptForSMTPSettings() {
  // Provide more detailed instructions, especially for Gmail users
  alert("SMTP Setup Instructions:\n\n" +
        "For Gmail users:\n" + 
        "1. You need to use an 'App Password' instead of your regular password\n" +
        "2. Go to https://myaccount.google.com/apppasswords\n" +
        "3. Generate a new app password for 'Mail'\n" +
        "4. Use that 16-character code as your password below");
  
  const smtp_server = prompt("Enter SMTP server (e.g., smtp.gmail.com):");
  if (!smtp_server) return;
  
  const smtp_port = prompt("Enter SMTP port (e.g., 587):");
  if (!smtp_port) return;
  
  const smtp_user = prompt("Enter SMTP username (your email address):");
  if (!smtp_user) return;
  
  const smtp_password = prompt("Enter SMTP password (for Gmail, use App Password):");
  if (!smtp_password) return;
  
  // Save SMTP settings
  saveSMTPSettings(smtp_server, parseInt(smtp_port), smtp_user, smtp_password);
}

// Function to save SMTP settings
async function saveSMTPSettings(smtp_server, smtp_port, smtp_user, smtp_password) {
  try {
    const response = await fetch('/config/smtp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ smtp_server, smtp_port, smtp_user, smtp_password })
    });
    
    if (response.ok) {
      alert('SMTP settings saved successfully.');
    } else {
      alert('Failed to save SMTP settings.');
    }
  } catch (err) {
    console.error('Error saving SMTP settings:', err);
    alert('Error saving SMTP settings.');
  }
}

// Add a new function for SMTP settings to the window object
window.setSMTPSettings = function() {
  promptForSMTPSettings();
  document.getElementById('userOptionsMenu').classList.remove('active');
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

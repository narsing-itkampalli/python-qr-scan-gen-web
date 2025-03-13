qrReaderUploadButton.onclick = () => {
    qrReaderFileInput.click();
}

qrReaderFileInput.onchange = () => {
    if(!qrReaderFileInput.files.length) return void 0;
    uploadQRImage(qrReaderFileInput.files[0]);
    qrReaderFileInput.value = '';
}

async function uploadQRImage(file) {
    const form = new FormData();
    form.append('file', file);

    await fetch('/read-qrcode', {
        method: 'post',
        body: form
    })
    .then((res) => res.json())
    .then(data => {
        showQRUploadResultSection(data);
    })
    .catch(error => {
        showQRUploadResultSection({ok: false, message: error.message});
    });
}

function showQrReaderModal() {
    showQRUploadSection();
    qrReaderModal.classList.remove('hidden');
}

function hideQrReaderModal() {
    hideQRUploadResultSection();
    hideQrReaderCameraSection();
    qrReaderModal.classList.add('hidden');
}

function showQRUploadSection() {
    hideQRUploadResultSection();
    hideQrReaderCameraSection();
    qrReaderUploadSection.classList.remove('hidden');
}

function hideQRUploadSection() {
    qrReaderUploadSection.classList.add('hidden');
}

function showQRUploadResultSection({ok, message, image, data}) {
    qrUploadResultMessage.innerText = message;
    qrUploadResultMessage.classList[!ok ? 'add' : 'remove']('error');
    const img = image ? `<img src="/qrcode/${image}" alt="...">` : '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><path fill="currentColor" d="M30 3.414L28.586 2L2 28.586L3.414 30l2-2H26a2.003 2.003 0 0 0 2-2V5.414zM26 26H7.414l7.793-7.793l2.379 2.379a2 2 0 0 0 2.828 0L22 19l4 3.997zm0-5.832l-2.586-2.586a2 2 0 0 0-2.828 0L19 19.168l-2.377-2.377L26 7.414zM6 22v-3l5-4.997l1.373 1.374l1.416-1.416l-1.375-1.375a2 2 0 0 0-2.828 0L6 16.172V6h16V4H6a2 2 0 0 0-2 2v16z"/></svg>';
    qrUploadResultDataImageContainer.innerHTML = img;

    if(/^.*:\/\//g.test(data)) {
        qrUploadResultDataText.innerHTML = `<a target="_blank" href="${data}">${data}</a>`;
    }else {
        qrUploadResultDataText.innerText = data || '';
    }
    hideQRUploadSection();
    hideQrReaderCameraSection();
    qrReaderResultSection.classList.remove('hidden');
}

function hideQRUploadResultSection() {
    qrReaderResultSection.classList.add('hidden');
}


// Using camera
const context = cameraCanvas.getContext('2d');
let canCaptureFrame = false;
let scanUploadTimeout = null;
let localStream = null;

// Function to capture and send frames
const captureFrame = () => {
    cameraCanvas.width = cameraVideo.videoWidth;
    cameraCanvas.height = cameraVideo.videoHeight;
    context.drawImage(cameraVideo, 0, 0, cameraCanvas.width, cameraCanvas.height);

    // Convert cameraCanvas to Blob and prepare FormData
    cameraCanvas.toBlob(async (blob) => {
        const formData = new FormData();
        if(!blob) return captureFrame();
        formData.append("file", blob, "frame.jpg"); // Append as a file
        canCaptureFrame = true;

        // Send the frame to the server
        await fetch('/scan-qrcode', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if(data.ok) {
                canCaptureFrame = false;
                showQRUploadResultSection(data);
            }
        })
        .catch(err => {
            console.error("Error sending frame:", err);
            showQRUploadResultSection({ok: false, message: "Error sending frame: " + err.message});
        });

        if(canCaptureFrame) scanUploadTimeout = setTimeout(captureFrame, 300);
    }, 'image/jpeg'); // Specify image format
};

// Send a frame every 500ms
function captureQrUsingCamera() {
    navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => {
        localStream = stream;
        cameraVideo.srcObject = stream;
    })
    .catch(err => console.error("Error accessing camera:", err));
    captureFrame();
}

function showQrReaderCameraSection() {
    hideQRUploadSection();
    qrReaderCameraSection.classList.remove('hidden');
    captureQrUsingCamera();
}

function hideQrReaderCameraSection() {
    cameraVideo.pause();
    cameraVideo.src = "";
    if(localStream) {
        localStream.getTracks()[0].stop();
    }
    canCaptureFrame = false;
    clearTimeout(scanUploadTimeout);
    qrReaderCameraSection.classList.add('hidden');
}
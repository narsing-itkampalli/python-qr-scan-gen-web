const qrGenerateButtonText = qrGenerateButton.innerText;

async function generateQRCode() {
    const inputData = {
        value: qrInput.value
    }

    
    qrGenerateButton.innerText = 'Please wait...';
    resetQRGeneratorErrors();

    try {
        await fetch('/generate-qrcode', {
            method: 'post',
            body: JSON.stringify(inputData),
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(res => res.json())
        .then(res => {
            if(!res.ok) {
                qrInputField.classList.add('qr-input-field-error');
                qrErrorMessage.innerText = res.message;
            }else {
                showSuccessSection(res.image, res.message);
            }
        });
    }catch(error){
        qrInputField.classList.add('qr-input-field-error');
        qrErrorMessage.innerText = error.message;
    }

    qrGenerateButton.innerText = qrGenerateButtonText;
}

function showSuccessSection(image, message) {
    const imageElement = `<img src="/qrcode/${image}" alt="...">`;
    qrSuccessImageContainer.innerHTML = imageElement;
    hideInputSection();
    qrGeneratorSuccessSection.classList.remove('hidden');
}

function hideSuccessSection() {
    qrGeneratorSuccessSection.classList.add('hidden');
}

function showInputSection() {
    resetQRGeneratorErrors();
    hideSuccessSection();
    qrGeneratorInputSection.classList.remove('hidden');
}

function hideInputSection() {
    qrGeneratorInputSection.classList.add('hidden');
    resetQRGeneratorErrors();
}

function resetQRGeneratorErrors() {
    qrErrorMessage.innerText = '';
    qrInputField.classList.remove('qr-input-field-error');
}

function downloadQRCode(path) {
    const a = document.createElement('a');
    a.href = path;
    a.download = 'qrcode.png';
    document.body.append(a);
    a.click();
    a.remove();
}

function showQRGeneratorModal() {
    qrGeneratorModal.classList.remove('hidden');
}

function hideQRGeneratorModal() {
    qrGeneratorModal.classList.add('hidden');
    showInputSection();
    qrInput.value = '';
    resetQRGeneratorErrors();
}

qrGeneratorModal.onclick = (event) => {
    if(event.target === qrGeneratorModal) hideQRGeneratorModal();
}
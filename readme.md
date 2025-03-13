# Python QR Code Scanner & Generator (Web)
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white) ![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white) ![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white) ![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

A lightweight QR code scanner and generator web application built with Python's built-in HTTP server (no Flask/Django required).

![QR Code Demo](./screenshot.png)

## Features
- 🖥️ Web-based interface
- ⚡ Generate QR codes from text
- 🔍 Scan/Read QR codes from images
- 🚀 Pure Python implementation
- 📦 No external web frameworks required

## Installation

1. **Clone the repository**
```bash
git clone https://github.com/your-username/py-qr-scan-gen-web.git
cd py-qr-scan-gen-web
```

2. **Install dependencies**
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install qrcode pillow opencv-python uuid
```

## Usage

**Start the server:**
```bash
python ./server/app.py
```

Visit `http://localhost:8000` in your browser.

## API Endpoints

### Generate QR Code
- **POST** `/generate-qrcode`
- Request Body (JSON):
  ```json
  { "value": "Your text here" }
  ```
- Returns: 
  ```json
  { "ok": true, "image": "filename.png", "message": "..." }
  ```

### Read QR Code
- **POST** `/read-qrcode`
- Form Data: `file` (image upload)
- Returns:
  ```json
  { "ok": true, "data": "decoded-text", "message": "..." }
  ```

## Project Structure
```
├── client/            # Frontend files (HTML/CSS/JS)
├── server/
│   ├── app.py         # Main server application
│   └── qr.py          # QR generation/scanning logic
├── storage/           # Generated QR codes and uploaded images
└── venv/              # Python virtual environment
```

## Dependencies
- `qrcode` - QR code generation
- `pillow` - Image processing
- `opencv-python` - QR code detection
- `uuid` - Unique filename generation

## Development Notes
This project intentionally uses only Python's built-in modules for HTTP server functionality to demonstrate:
- Raw HTTP request handling
- Multipart form data processing
- Custom routing implementation
- Static file serving
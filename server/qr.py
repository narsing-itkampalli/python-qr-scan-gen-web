import qrcode
import cv2
import os
import uuid

QR_STORAGE = os.path.join(os.path.dirname(os.path.abspath(__file__)), '../storage')
os.makedirs(QR_STORAGE, exist_ok=True)

def generate_qr_code(data: str):
    if data:
        qr = qrcode.QRCode(
            version=1,  # Controls the size of the QR Code, 1 is the smallest
            error_correction=qrcode.constants.ERROR_CORRECT_L,  # Error correction level
            box_size=10,  # Size of each QR code box
            border=4,  # Border size (minimum is 4)
        )
        qr.add_data(data)
        qr.make(fit=True)

        output_filename = str(uuid.uuid4())+".png"
        output_filepath = os.path.join(QR_STORAGE, output_filename)

        img = qr.make_image(fill_color="black", back_color="white")
        img.save(output_filepath)

        return {
            'ok': True,
            'image': output_filename,
            'message': 'QR Code generated successfully!'
        }
    else:
        return {
            'ok': False,
            'message': 'Please enter valid data!'
        }

def read_qr_code(image_path: str):
    # Read the image
    image = cv2.imread(image_path)
    if image is None:
        return {
            'ok': False,
            'message': f"Error: Unable to open image at {image_path}"
        }

    # Initialize the QR code detector
    detector = cv2.QRCodeDetector()

    # Detect and decode the QR code
    data, _, _ = detector.detectAndDecode(image)
    if data:
        return {
            'ok': True,
            'data': data,
            'message': 'QR Code detected'
        }
    else:
        return {
            'ok': False,
            'message': "No QR Code found in the image."
        }
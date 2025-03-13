from http.server import HTTPServer, BaseHTTPRequestHandler
import cgi
import os
import json
import qr
import uuid
import re

CLIENT_FOLDER=os.path.join(os.path.dirname(os.path.abspath(__file__)), '../client')

class RequestHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/':
            file_path = os.path.join(CLIENT_FOLDER, "index.html")
        elif self.path.startswith('/qrcode/'):
            file_path = os.path.join(qr.QR_STORAGE, re.sub("^/qrcode/", "", self.path))
        else:
            file_path = os.path.join(CLIENT_FOLDER, self.path.lstrip("/"))

        if os.path.isfile(file_path):
            self.serve_file(file_path)
        else:
            self.send_response(404)
            self.end_headers()
            self.wfile.write(b"404 Not Found")

    def serve_file(self, file_path):
        # Determine the MIME type based on the file extension
        mime_type = "text/plain"
        if file_path.endswith(".html"):
            mime_type = "text/html"
        elif file_path.endswith(".css"):
            mime_type = "text/css"
        elif file_path.endswith(".js"):
            mime_type = "application/javascript"
        elif file_path.endswith(".png"):
            mime_type = "image/png"
        elif file_path.endswith(".jpg") or file_path.endswith(".jpeg"):
            mime_type = "image/jpeg"

        try:
            # Read and serve the file
            with open(file_path, "rb") as f:
                content = f.read()
            self.send_response(200)
            self.send_header("Content-type", mime_type)
            self.end_headers()
            self.wfile.write(content)
        except Exception as e:
            self.send_response(500)
            self.end_headers()
            self.wfile.write(f"500 Internal Server Error: {e}".encode("utf-8"))

    def do_POST(self):
        content_type = self.headers.get('Content-Type')

        if self.path == '/generate-qrcode':
            if content_type != 'application/json':
                return send_json_response(self, 400, {'ok': False, 'message': 'Invalid Content-Type. Expecting application/json.'})

            # Get the content length to read the request body
            content_length = int(self.headers.get('Content-Length', 0))
            if content_length == 0:
                return send_json_response(self, 400, {'ok': False, 'message': 'No data provided in the request body.'})

            # Read and parse the JSON data
            try:
                request_body = self.rfile.read(content_length).decode('utf-8')
                data = json.loads(request_body)  # Parse JSON data
            except json.JSONDecodeError:
                return send_json_response(self, 400, {'ok': False, 'message': 'Invalid JSON data.'})
            
            generated_qrcode = qr.generate_qr_code(data['value'])
            
            return send_json_response(self, 200, generated_qrcode)
        
        if self.path == '/read-qrcode' or self.path == '/scan-qrcode':
            if "multipart/form-data" in content_type:
                form = cgi.FieldStorage(
                    fp=self.rfile,
                    headers=self.headers,
                    environ={'REQUEST_METHOD': 'POST', 'CONTENT_TYPE': content_type}
                )
                file_item = form["file"]
                if file_item.filename:
                    filename = str(uuid.uuid4())+"."+ (file_item.filename.split('.').pop())
                    filepath = os.path.join(qr.QR_STORAGE, filename)

                    # Save the uploaded file
                    with open(filepath, "wb") as f:
                        f.write(file_item.file.read())

                    qr_code_data = qr.read_qr_code(filepath)
                    qr_code_data['image'] = filename
                    
                    if self.path == '/scan-qrcode' and qr_code_data['ok'] != True:
                        if os.path.exists(filepath):
                            os.remove(filepath)

                    return send_json_response(self, 200, qr_code_data)
                else:
                    return send_json_response(self, 400, {'ok': False, 'message': 'No file was uploaded.'})
            else:
                return send_json_response(self, 400, {'ok': False, 'message': 'Unsupported POST request.'})

def run(port=8000):
    server_address = ('', port)
    httpd = HTTPServer(server_address, RequestHandler)
    print(f"Starting server on port http://localhost:{port}")
    httpd.serve_forever()

def send_json_response(server, status_code, json_data):
    server.send_response(status_code)
    server.send_header("Content-Type", "application/json; charset=utf-8")
    server.end_headers()
    server.wfile.write(json.dumps(json_data).encode('utf-8'))
    return

if __name__ == '__main__':
    run()

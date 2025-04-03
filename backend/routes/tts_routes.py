import os
import time
from flask import Blueprint, request, jsonify, send_file
from werkzeug.utils import secure_filename
from gtts import gTTS
from backend.services.pdf_utils import extract_text_from_pdf

tts_bp = Blueprint("tts", __name__)

# Ensure upload directory exists
UPLOAD_FOLDER = os.path.join(os.getcwd(), "backend", "uploads", "tts_files")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@tts_bp.route("/convert", methods=["POST"])
def convert_text_to_speech():
    try:
        if "file" not in request.files:
            return jsonify({"error": "No file provided"}), 400

        file = request.files["file"]
        filename = secure_filename(file.filename)

        # Save the uploaded file
        file_path = os.path.join(UPLOAD_FOLDER, filename)
        file.save(file_path)

        # Extract text from PDF
        extracted_text = extract_text_from_pdf(file_path)
        if not extracted_text.strip():
            return jsonify({"error": "No text found in the PDF."}), 400

        # Convert text to speech
        tts = gTTS(text=extracted_text, lang="en")
        
        # Generate unique filename for audio
        timestamp = int(time.time())
        audio_filename = f"tts_output_{timestamp}.mp3"
        audio_path = os.path.join(UPLOAD_FOLDER, audio_filename)

        # Save the generated audio
        tts.save(audio_path)

        return send_file(audio_path, as_attachment=True, download_name=audio_filename)

    except Exception as e:
        return jsonify({"error": str(e)}), 500

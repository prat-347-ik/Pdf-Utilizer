import os
import base64
from flask import Blueprint, request, jsonify, send_file
from werkzeug.utils import secure_filename
from backend.services.stt_utils import speech_to_text, convert_to_wav
from backend.services.pdf_utils import create_pdf_from_text  # Import your PDF function

stt_bp = Blueprint("stt", __name__)

# Ensure directories exist
STT_AUDIO_FOLDER = "stt_audio"
STT_PDF_FOLDER = "stt_pdfs"
os.makedirs(STT_AUDIO_FOLDER, exist_ok=True)
os.makedirs(STT_PDF_FOLDER, exist_ok=True)

ALLOWED_EXTENSIONS = {"wav", "mp3", "ogg", "flac", "m4a", "aac","webm"}

def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

@stt_bp.route("/convert", methods=["POST"])
def convert_speech_to_text():
    extracted_text = None
    filename = "temp_audio.wav"  # Fallback
    filepath = None

    if "audio" in request.files:  # Case 1: File Upload
        file = request.files["audio"]

        if file.filename == "":
            return jsonify({"error": "No selected file"}), 400

        if not allowed_file(file.filename):
            return jsonify({"error": "Invalid file format"}), 400

        filename = secure_filename(file.filename)
        filepath = os.path.join(STT_AUDIO_FOLDER, filename)
        file.save(filepath)

        try:
            if not filename.endswith(".wav"):
                filepath = convert_to_wav(filepath)

            extracted_text, confidence = speech_to_text(filepath)
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    elif request.is_json and "audio_base64" in request.json:  # Case 2: Base64 (Microphone)
        try:
            audio_data = base64.b64decode(request.json["audio_base64"])
            filepath = os.path.join(STT_AUDIO_FOLDER, "temp_audio.wav")

            with open(filepath, "wb") as f:
                f.write(audio_data)

            extracted_text, confidence = speech_to_text(filepath)
            filename = "temp_audio.wav"
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    else:
        return jsonify({"error": "No valid audio input found"}), 400

    # ✅ Create PDF and return it
    if extracted_text:
        pdf_filename = f"{filename.rsplit('.', 1)[0]}.pdf"
        pdf_path = os.path.abspath(os.path.join(STT_PDF_FOLDER, pdf_filename))

        try:
            create_pdf_from_text(extracted_text, pdf_path)
            return send_file(pdf_path, as_attachment=True)
        except Exception as e:
            return jsonify({"error": f"Failed to create or send PDF: {e}"}), 500

    return jsonify({"error": "Failed to extract text"}), 500
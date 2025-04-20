import os
from flask import Blueprint, request, jsonify, send_file
from werkzeug.utils import secure_filename
from backend.services.stt_utils import speech_to_text, convert_to_wav
from backend.services.pdf_utils import create_pdf_from_text

stt_bp = Blueprint("stt", __name__)

STT_AUDIO_FOLDER = "stt_audio"
STT_PDF_FOLDER = "stt_pdfs"
os.makedirs(STT_AUDIO_FOLDER, exist_ok=True)
os.makedirs(STT_PDF_FOLDER, exist_ok=True)

ALLOWED_EXTENSIONS = {"wav", "mp3", "ogg", "flac", "m4a", "aac", "webm"}

def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

@stt_bp.route("/convert", methods=["POST"])
def convert_speech_to_text():
    if "audio" not in request.files:
        return jsonify({"error": "No audio file provided."}), 400

    file = request.files["audio"]
    if file.filename == "":
        return jsonify({"error": "No selected file."}), 400

    if not allowed_file(file.filename):
        return jsonify({"error": "Invalid file format."}), 400

    try:
        filename = secure_filename(file.filename)
        filepath = os.path.join(STT_AUDIO_FOLDER, filename)
        file.save(filepath)

        # Convert to WAV if necessary
        if not filename.lower().endswith(".wav"):
            filepath = convert_to_wav(filepath)

        # Transcribe the audio
        extracted_text, _ = speech_to_text(filepath)

        # Generate PDF
        pdf_filename = f"{os.path.splitext(filename)[0]}.pdf"
        pdf_path = os.path.abspath(os.path.join(STT_PDF_FOLDER, pdf_filename))
        create_pdf_from_text(extracted_text, pdf_path)

        # Send the PDF as a downloadable file
        return send_file(pdf_path, as_attachment=True, download_name=pdf_filename)

    except Exception as e:
        return jsonify({"error": f"Processing failed: {str(e)}"}), 500

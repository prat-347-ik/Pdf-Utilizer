import os
from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename
from backend.services.stt_utils import speech_to_text

stt_bp = Blueprint("stt", __name__)

# Ensure the directory exists for storing uploaded audio files
STT_AUDIO_FOLDER = "stt_audio"
os.makedirs(STT_AUDIO_FOLDER, exist_ok=True)

ALLOWED_EXTENSIONS = {"wav", "mp3", "ogg", "flac"}

def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

@stt_bp.route("/convert", methods=["POST"])
def convert_speech_to_text():
    if "audio" not in request.files:
        return jsonify({"error": "No audio file provided"}), 400

    file = request.files["audio"]

    if file.filename == "":
        return jsonify({"error": "No selected file"}), 400

    if not allowed_file(file.filename):
        return jsonify({"error": "Invalid file format"}), 400

    filename = secure_filename(file.filename)
    filepath = os.path.join(STT_AUDIO_FOLDER, filename)
    file.save(filepath)

    try:
        text = speech_to_text(filepath)
        return jsonify({"text": text})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

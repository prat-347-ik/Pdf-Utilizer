import os
import base64
from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename
from backend.services.stt_utils import speech_to_text, convert_to_wav  # Import the helper function

stt_bp = Blueprint("stt", __name__)

# Ensure the directory exists for storing uploaded audio files
STT_AUDIO_FOLDER = "stt_audio"
os.makedirs(STT_AUDIO_FOLDER, exist_ok=True)

ALLOWED_EXTENSIONS = {"wav", "mp3", "ogg", "flac", "m4a", "aac"}

def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

@stt_bp.route("/convert", methods=["POST"])
def convert_speech_to_text():
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
            # Convert to WAV if necessary
            if not filename.endswith(".wav"):
                filepath = convert_to_wav(filepath)  # Converts audio file if needed

            text, confidence = speech_to_text(filepath)
            return jsonify({"text": text, "confidence": confidence})
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    elif "audio_base64" in request.json:  # Case 2: Microphone Input (Base64)
        try:
            audio_data = base64.b64decode(request.json["audio_base64"])
            temp_filepath = os.path.join(STT_AUDIO_FOLDER, "temp_audio.wav")

            with open(temp_filepath, "wb") as f:
                f.write(audio_data)

            text, confidence = speech_to_text(temp_filepath)
            return jsonify({"text": text, "confidence": confidence})

        except Exception as e:
            return jsonify({"error": str(e)}), 500

    return jsonify({"error": "No valid audio input found"}), 400

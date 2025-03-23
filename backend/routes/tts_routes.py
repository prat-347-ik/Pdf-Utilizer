import os
from flask import Blueprint, request, jsonify, send_file
from backend.services.tts_utils import text_to_speech

tts_bp = Blueprint("tts", __name__)

# Ensure the directory exists for storing TTS audio files
TTS_AUDIO_FOLDER = "tts_audio"
os.makedirs(TTS_AUDIO_FOLDER, exist_ok=True)

@tts_bp.route("/convert", methods=["POST"])
def convert_text_to_speech():
    try:
        data = request.get_json()
        text = data.get("text", "")
        if not text:
            return jsonify({"error": "No text provided"}), 400

        output_file = os.path.join(TTS_AUDIO_FOLDER, "output.mp3")
        text_to_speech(text, output_file)
        
        return send_file(output_file, as_attachment=True)

    except Exception as e:
        return jsonify({"error": str(e)}), 500

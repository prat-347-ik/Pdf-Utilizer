import os
from flask import Blueprint, request, jsonify, send_file
from werkzeug.utils import secure_filename
from backend.services.translate_utils import translate_text
from backend.services.pdf_utils import extract_text_from_pdf
from backend.services.translate_utils import create_pdf_from_text

translate_bp = Blueprint("translate", __name__)

# Ensure upload directory exists
UPLOAD_FOLDER = os.path.join(os.getcwd(), "backend", "uploads", "translated_files")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@translate_bp.route("/translate", methods=["POST"])
def translate():
    try:
        if "file" not in request.files:
            return jsonify({"error": "No file provided"}), 400

        file = request.files["file"]
        target_language = request.form.get("target_language", "").strip()

        if not target_language:
            return jsonify({"error": "Target language is required"}), 400

        # Save uploaded file
        filename = secure_filename(file.filename)
        file_path = os.path.join(UPLOAD_FOLDER, filename)
        file.save(file_path)

        # Extract text from PDF
        extracted_text = extract_text_from_pdf(file_path)
        if not extracted_text.strip():
            return jsonify({"error": "No text found in PDF"}), 400

        # Translate extracted text
        translated_text = translate_text(extracted_text, target_language)

        if isinstance(translated_text, dict):  # Ensure it's a string
          translated_text = translated_text.get("translatedText", "")

        if not isinstance(translated_text, str):
          return jsonify({"error": "Translation failed"}), 500

        # Generate new filename with language suffix
        name, ext = os.path.splitext(filename)
        translated_filename = f"{name}_translated_{target_language}.pdf"
        translated_pdf_path = os.path.join(UPLOAD_FOLDER, translated_filename)

        # Create a new PDF with translated text
        create_pdf_from_text(translated_text, translated_pdf_path, target_language)

        return send_file(translated_pdf_path, as_attachment=True, download_name=translated_filename)

    except Exception as e:
        return jsonify({"error": str(e)}), 500

import os
import io
import time
import json
from fpdf import FPDF
from flask_cors import CORS
from PyPDF2 import PdfReader,PdfWriter
from flask import Blueprint, request, jsonify, send_file, current_app
from werkzeug.utils import secure_filename
from backend.services.pdf_utils import merge_pdfs, split_pdf, compress_pdf, extract_text_from_pdf, extract_images_from_pdf,protect_pdf,sign_pdf,rotate_pdf  
pdf_bp = Blueprint('pdf', __name__)

# Ensure uploads directory exists
os.makedirs("uploads", exist_ok=True)


CORS(pdf_bp)  
@pdf_bp.route("/merge", methods=["POST"])
def merge():
    try:
        files = request.files.getlist("files")
        if not files or len(files) < 2:
            return jsonify({"error": "At least two PDF files are required for merging"}), 400

        # Define correct base directory for uploads
        upload_dir = os.path.join(os.getcwd(), "backend", "uploads", "merged_files")
        os.makedirs(upload_dir, exist_ok=True)  # Ensure directory exists

        # Save uploaded files
        filenames = []
        for file in files:
            filename = secure_filename(file.filename)
            file_path = os.path.join(upload_dir, filename)
            file.save(file_path)
            filenames.append(file_path)

        # Generate a unique output filename
        timestamp = int(time.time())  # Current timestamp
        merged_filename = f"merged_output_{timestamp}.pdf"
        merged_output_path = os.path.join(upload_dir, merged_filename)

        # Call merge_pdfs function
        merge_pdfs(filenames, merged_output_path)

        # Ensure proper file sending
        return send_file(merged_output_path, as_attachment=True, download_name=merged_filename)

    except Exception as e:
        return jsonify({"error": str(e)}), 500



@pdf_bp.route("/split", methods=["POST"])
def split():
    try:
        file = request.files["file"]
        pages_data = request.form.get("pages", "[]")  # Get pages from form-data
        page_numbers = json.loads(pages_data)  # Convert string to list

        if not file or not page_numbers:
            return jsonify({"error": "File and page numbers required"}), 400

        # Ensure correct upload directory
        upload_dir = os.path.join(os.getcwd(), "backend", "uploads")
        os.makedirs(upload_dir, exist_ok=True)

        # Save the uploaded file
        filename = secure_filename(file.filename)
        file_path = os.path.join(upload_dir, filename)
        file.save(file_path)

        # Define output directory for split files
        output_folder = os.path.join(upload_dir, "split_files")
        os.makedirs(output_folder, exist_ok=True)

        # Call split_pdf with correct output folder
        result = split_pdf(file_path, page_numbers, output_folder)

        if "error" in result:
            return jsonify(result), 400  # Return error response

        # Get final split file path
        extracted_file_path = result["output_file"]

        if not os.path.exists(extracted_file_path):
            return jsonify({"error": "Extracted PDF file not found"}), 500

        return send_file(extracted_file_path, as_attachment=True, download_name=os.path.basename(extracted_file_path))

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@pdf_bp.route("/extract_text", methods=["POST"])
def extract_text():
    try:
        if "file" not in request.files:
            return jsonify({"error": "No file provided"}), 400

        file = request.files["file"]
        filename = secure_filename(file.filename)

        # Ensure upload directory exists
        upload_dir = os.path.join(os.getcwd(), "backend", "uploads", "extracted_text_pdfs")
        os.makedirs(upload_dir, exist_ok=True)

        # Save the uploaded file
        file_path = os.path.join(upload_dir, filename)
        file.save(file_path)

        # Extract text from PDF
        extracted_text = extract_text_from_pdf(file_path)
        if not extracted_text.strip():
            return jsonify({"error": "No text found in the PDF."}), 400

        # Generate new PDF filename
        timestamp = int(time.time())
        pdf_filename = f"extracted_text_{timestamp}.pdf"
        pdf_path = os.path.join(upload_dir, pdf_filename)

        # ✅ FIX: Use a Unicode Font
        pdf = FPDF()
        pdf.set_auto_page_break(auto=True, margin=15)
        pdf.add_page()

        # 🔹 Load a Unicode-compatible font (Arimo or another TTF)
        font_path = os.path.join(os.getcwd(), "backend", "fonts", "Arimo.ttf")
        pdf.add_font("DejaVu", "", font_path, uni=True)
        pdf.set_font("DejaVu", size=12)

        pdf.multi_cell(0, 10, extracted_text)
        pdf.output(pdf_path, "F")

        return send_file(pdf_path, as_attachment=True, download_name=pdf_filename)

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@pdf_bp.route("/extract_images", methods=["POST"])
def extract_images():
    try:
        if "file" not in request.files:
            return jsonify({"error": "No file provided"}), 400

        file = request.files["file"]
        filename = secure_filename(file.filename)

        # Ensure upload directory exists
        upload_dir = os.path.join(os.getcwd(), "backend", "uploads", "extracted_images_pdfs")
        os.makedirs(upload_dir, exist_ok=True)

        # Save the uploaded file
        file_path = os.path.join(upload_dir, filename)
        file.save(file_path)

        # Extract images from PDF
        image_output_folder = os.path.join(upload_dir, "images")
        extraction_result = extract_images_from_pdf(file_path, image_output_folder)

        if "error" in extraction_result:
            return jsonify({"error": extraction_result["error"]}), 500

        # Ensure images were extracted
        extracted_images = [img for img in os.listdir(image_output_folder) if img.endswith((".jpg", ".png", ".jp2"))]
        if not extracted_images:
            return jsonify({"error": "No images found in the PDF."}), 400

        # Generate a new PDF filename
        timestamp = int(time.time())
        pdf_filename = f"extracted_images_{timestamp}.pdf"
        pdf_path = os.path.join(upload_dir, pdf_filename)

        # ✅ Create a PDF with extracted images
        pdf = FPDF()
        pdf.set_auto_page_break(auto=True, margin=15)

        for img_file in extracted_images:
            img_path = os.path.join(image_output_folder, img_file)
            pdf.add_page()
            pdf.image(img_path, x=10, y=10, w=180)  # Adjust width as needed

        pdf.output(pdf_path, "F")

        return send_file(pdf_path, as_attachment=True, download_name=pdf_filename)

    except Exception as e:
        return jsonify({"error": str(e)}), 500


    
@pdf_bp.route("/compress", methods=["POST"])
def compress():
    try:
        if "file" not in request.files:
            return jsonify({"error": "No file provided"}), 400

        file = request.files["file"]
        compression_level = request.form.get("compression_level", "medium")  # Default to medium

        if compression_level not in ["low", "medium", "high"]:
            return jsonify({"error": "Invalid compression level. Choose low, medium, or high."}), 400

        # Ensure directory exists
        upload_dir = os.path.join(os.getcwd(), "backend", "uploads", "compressed_files")
        os.makedirs(upload_dir, exist_ok=True)

        # Save the uploaded file
        filename = secure_filename(file.filename)
        file_path = os.path.join(upload_dir, filename)
        file.save(file_path)

        # Generate a unique output filename
        timestamp = int(time.time())
        compressed_filename = f"compressed_{timestamp}.pdf"
        compressed_output_path = os.path.join(upload_dir, compressed_filename)

        # Call compress_pdf function with compression level
        result = compress_pdf(file_path, compressed_output_path, compression_level)

        if "error" in result:
            return jsonify({"error": result["error"]}), 500

        if not os.path.exists(compressed_output_path):
            return jsonify({"error": "Compression failed, output file was not created."}), 500

        return send_file(compressed_output_path, as_attachment=True, download_name=compressed_filename)

    except Exception as e:
        return jsonify({"error": str(e)}), 500



@pdf_bp.route("/rotate", methods=["POST"])
def rotate():
    try:
        file = request.files["file"]
        angle = int(request.form.get("angle", 90))  # Default to 90 degrees
        all_pages = request.form.get("all_pages", "true").lower() == "true"

        if not file:
            return jsonify({"error": "No file provided"}), 400

        upload_dir = os.path.join(os.getcwd(), "backend", "uploads", "rotated_files")
        os.makedirs(upload_dir, exist_ok=True)

        filename = secure_filename(file.filename)
        file_path = os.path.join(upload_dir, filename)
        file.save(file_path)

        rotated_output_path = os.path.join(upload_dir, f"rotated_{filename}")

        # Get total number of pages
        reader = PdfReader(file_path)
        total_pages = len(reader.pages)

        # Create rotation dictionary
        if all_pages:
            rotations = {i + 1: angle for i in range(total_pages)}
        else:
            selected_pages = request.form.get("pages", "")  # Example: "1,3,5"
            if not selected_pages:
                return jsonify({"error": "Specify pages to rotate"}), 400
            pages = list(map(int, selected_pages.split(",")))
            rotations = {p: angle for p in pages if 1 <= p <= total_pages}

        # Call rotate function
        result = rotate_pdf(file_path, rotated_output_path, rotations)

        if "error" in result:
            return jsonify(result), 400

        return send_file(rotated_output_path, as_attachment=True, download_name=f"rotated_{filename}")

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@pdf_bp.route("/sign", methods=["POST"])
def sign_pdf_route():
    try:
        file = request.files.get("file")
        signature = request.files.get("signature")
        page = request.form.get("page")
        x = request.form.get("x")
        y = request.form.get("y")
        height = request.form.get("height")
        width = request.form.get("width")

        if not file or not signature or not page or not x or not y:
            return jsonify({"error": "File, signature, and position required"}), 400

        page_number = int(page)
        position = (int(x), int(y),int(height),int(width))

        # Define correct upload directory
        upload_dir = os.path.join(os.getcwd(), "backend", "uploads", "signed_files")
        os.makedirs(upload_dir, exist_ok=True)

        # Save uploaded files
        filename = secure_filename(file.filename)
        file_path = os.path.join(upload_dir, filename)
        file.save(file_path)

        signature_filename = secure_filename(signature.filename)
        signature_path = os.path.join(upload_dir, signature_filename)
        signature.save(signature_path)

        # Define output file path
        signed_output_path = os.path.join(upload_dir, f"signed_{filename}")

        # Correct function call
        sign_pdf(file_path, signed_output_path, signature_path, page_number, position)

        return send_file(signed_output_path, as_attachment=True, download_name=f"signed_{filename}")

    except Exception as e:
        return jsonify({"error": str(e)}), 500


CORS(pdf_bp) 


@pdf_bp.route("/protect", methods=["POST"])
def protect():
    try:
        file = request.files.get("file")
        password = request.form.get("password")

        if not file or not password:
            return jsonify({"error": "File and password are required"}), 400

        filename = secure_filename(file.filename)
        pdf_reader = PdfReader(file)
        pdf_writer = PdfWriter()

        for page in pdf_reader.pages:
            pdf_writer.add_page(page)

        pdf_writer.encrypt(password)

        # Save to in-memory file
        pdf_bytes = io.BytesIO()
        pdf_writer.write(pdf_bytes)
        pdf_bytes.seek(0)

        # Return as downloadable file
        return send_file(pdf_bytes, as_attachment=True, download_name=f"protected_{filename}", mimetype="application/pdf")

    except Exception as e:
        return jsonify({"error": f"Error protecting PDF: {e}"}), 500
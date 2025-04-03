import os
from PyPDF2 import PdfReader, PdfWriter, PdfMerger
import json
from PIL import Image
import io


from fpdf import FPDF

def create_pdf_from_text(text, output_pdf_path):
    """
    Creates a PDF from the given text.

    :param text: The text content to include in the PDF.
    :param output_pdf_path: Path to save the generated PDF.
    """
    try:
        pdf = FPDF()
        pdf.set_auto_page_break(auto=True, margin=15)
        pdf.add_page()
        pdf.set_font("Arial", size=12)

        # Split text into lines to fit PDF format
        for line in text.split("\n"):
            pdf.cell(200, 10, txt=line, ln=True)

        # Save the generated PDF
        pdf.output(output_pdf_path)

    except Exception as e:
        raise Exception(f"Error creating PDF: {e}")


def split_pdf(input_pdf_path, page_numbers, output_folder):
    """Extracts specific pages from a PDF and saves it with a meaningful name."""
    try:
        os.makedirs(output_folder, exist_ok=True)
        reader = PdfReader(input_pdf_path)

        if not reader.pages:
            return {"error": "PDF has no pages to split."}

        writer = PdfWriter()

        # Validate and add requested pages
        valid_pages = []
        for page_num in page_numbers:
            if 1 <= page_num <= len(reader.pages):
                writer.add_page(reader.pages[page_num - 1])
                valid_pages.append(str(page_num))  # Store as string for naming
            else:
                return {"error": f"Invalid page number: {page_num}"}

        # Get base name of input PDF (without extension)
        original_filename = os.path.basename(input_pdf_path).rsplit(".", 1)[0]
        extracted_pages_str = "_".join(valid_pages)  # Format pages like "1_3_5"

        # Define output path with custom name
        output_filename = f"{original_filename}_pages_{extracted_pages_str}.pdf"
        output_path = os.path.join(output_folder, output_filename)

        # Save extracted PDF
        with open(output_path, "wb") as output_pdf:
            writer.write(output_pdf)

        return {"message": f"Extracted pages {', '.join(valid_pages)}.", "output_file": output_path}
    
    except Exception as e:
        return {"error": f"Error splitting PDF: {e}"}

def merge_pdfs(pdf_list, output_path):
    """Merges multiple PDF files into a single PDF."""
    merger = PdfMerger()
    try:
        if not pdf_list:
            return {"error": "No PDFs provided for merging."}

        for pdf in pdf_list:
            if not os.path.exists(pdf):
                return {"error": f"File not found: {pdf}"}
            merger.append(pdf)

        with open(output_path, 'wb') as output_file:
            merger.write(output_file)

        return {"message": "PDFs merged successfully", "output_path": output_path}
    
    except Exception as e:
        return {"error": f"Error merging PDFs: {str(e)}"}
    
    finally:
        merger.close()





def compress_pdf(input_pdf_path, output_pdf_path, compression_level="medium"):
    """
    Compresses a PDF by reducing image size and quality while preserving text-based content.

    :param input_pdf_path: Path to the input PDF file.
    :param output_pdf_path: Path to save the compressed PDF.
    :param compression_level: Compression level ('low', 'medium', 'high')
    """
    try:
        # Define compression settings based on level
        compression_settings = {
            "low": {"quality": 30, "scale_factor": 0.3},   # More compression, lower quality
            "medium": {"quality": 50, "scale_factor": 0.5},  # Balanced compression
            "high": {"quality": 80, "scale_factor": 0.8},  # Less compression, higher quality
        }

        # Get the selected compression settings, default to medium
        settings = compression_settings.get(compression_level, compression_settings["medium"])
        quality = settings["quality"]
        scale_factor = settings["scale_factor"]

        # Open the PDF
        doc = fitz.open(input_pdf_path)

        for page_index in range(len(doc)):
            page = doc[page_index]
            images = page.get_images(full=True)  # Get all images in the page

            for img_index, img in enumerate(images):
                xref = img[0]  # Image reference (xref)
                base_image = doc.extract_image(xref)  # Extract image data
                img_bytes = base_image["image"]

                # Open image with PIL
                img_pil = Image.open(io.BytesIO(img_bytes))

                # Convert RGBA (transparent) images to RGB
                if img_pil.mode == "RGBA":
                    img_pil = img_pil.convert("RGB")

                # Resize the image using Pillow (PIL)
                new_width = int(img_pil.width * scale_factor)
                new_height = int(img_pil.height * scale_factor)

                if new_width > 0 and new_height > 0:
                    img_pil = img_pil.resize((new_width, new_height), Image.LANCZOS)

                # Convert image to JPEG with compression
                img_buffer = io.BytesIO()
                img_pil.save(img_buffer, format="JPEG", quality=quality)
                img_buffer.seek(0)

                # Get the image bounding box (position)
                rects = page.get_image_rects(xref)
                if rects:
                    rect = rects[0]  # Take the first bounding box

                    # Remove the old image from the page
                    page.delete_image(xref)

                    # Insert the new compressed image
                    page.insert_image(rect, stream=img_buffer.getvalue())

        # Save compressed PDF
        doc.save(output_pdf_path, garbage=4, deflate=True)  # Optimize and compress
        doc.close()

        return {"message": "PDF compressed successfully", "output_path": output_pdf_path}

    except Exception as e:
        return {"error": f"Error compressing PDF: {e}"}







def extract_text_from_pdf(pdf_path):
    """
    Extracts text from a PDF file.
    
    Parameters:
    - pdf_path (str): Path to the PDF file.
    
    Returns:
    - str: Extracted text from the PDF.
    """
    try:
        doc = fitz.open(pdf_path)
        extracted_text = "\n".join([page.get_text("text") for page in doc])
        doc.close()
        return extracted_text if extracted_text.strip() else "No text found in the PDF."
    except Exception as e:
        return f"Error extracting text: {e}"
   




def extract_images_from_pdf(pdf_path, output_folder):
    """Extracts images from a PDF and saves them as image files."""
    try:
        os.makedirs(output_folder, exist_ok=True)
        doc = fitz.open(pdf_path)
        image_count = 0

        for page_num, page in enumerate(doc):
            for img_index, img in enumerate(page.get_images(full=True)):
                xref = img[0]
                base_image = doc.extract_image(xref)
                img_bytes = base_image["image"]
                img_ext = base_image["ext"]

                # Save extracted image
                image_filename = os.path.join(output_folder, f"image_{page_num + 1}_{img_index + 1}.{img_ext}")
                with open(image_filename, "wb") as image_file:
                    image_file.write(img_bytes)

                image_count += 1

        return {"message": f"Extracted {image_count} images.", "output_folder": output_folder}
    
    except Exception as e:
        return {"error": f"Error extracting images from PDF: {e}"}

    
def rotate_pdf(input_pdf_path, output_pdf_path, rotations):
    """
    Rotates specified pages in a PDF.

    :param input_pdf_path: Path to the input PDF file.
    :param output_pdf_path: Path where the rotated PDF will be saved.
    :param rotations: A dictionary where keys are page numbers (1-based) and values are angles (90, 180, 270).
    """
    try:
        reader = PdfReader(input_pdf_path)
        writer = PdfWriter()

        for i, page in enumerate(reader.pages):
            if (i + 1) in rotations:
                page.rotate(rotations[i + 1])
            writer.add_page(page)

        with open(output_pdf_path, "wb") as output_pdf:
            writer.write(output_pdf)

        return {"message": "PDF rotated successfully.", "output_file": output_pdf_path}
    except Exception as e:
        return {"error": f"Error rotating PDF: {e}"}

import fitz  # PyMuPDF

def sign_pdf(input_pdf_path, output_pdf_path, signature_image_path, page_number, position):
    """
    Adds a signature image to a specific page of a PDF.

    :param input_pdf_path: str
        Path to the input PDF file.
    
    :param output_pdf_path: str
        Path where the signed PDF should be saved.
    
    :param signature_image_path: str
        Path to the signature image file (PNG/JPG).
    
    :param page_number: int
        The page number (1-based index) where the signature should be added.
    
    :param position: tuple (x, y, width, height)
        - `x`: float → X-coordinate (from bottom-left corner) where the signature should be placed.
        - `y`: float → Y-coordinate (from bottom-left corner).
        - `width`: float → Width of the signature.
        - `height`: float → Height of the signature.

    :return: dict
        A dictionary with success message or error message.
    """
    try:
        # Load the PDF
        doc = fitz.open(input_pdf_path)

        # Validate page number
        if page_number < 1 or page_number > len(doc):
            return {"error": "Invalid page number."}

        # Select the target page (0-based index)
        page = doc[page_number - 1]

        # Unpack position tuple
        x, y, width, height = position

        # Insert image (signature)
        page.insert_image(fitz.Rect(x, y, x + width, y + height), filename=signature_image_path)

        # Save the modified PDF
        doc.save(output_pdf_path)
        doc.close()

        return {"message": "PDF signed successfully", "output_file": output_pdf_path}

    except Exception as e:
        return {"error": f"Error signing PDF: {e}"}






from PyPDF2 import PdfReader, PdfWriter

def protect_pdf(input_path, output_path, password):
    try:
        reader = PdfReader(input_path)
        writer = PdfWriter()

        for page in reader.pages:
            writer.add_page(page)

        writer.encrypt(password)

        # Open file, write, and ensure it's closed
        with open(output_path, "wb") as f:
            writer.write(f)

        return {"success": True}

    except Exception as e:
        return {"error": str(e)}

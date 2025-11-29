import os
from PyPDF2 import PdfReader, PdfWriter, PdfMerger
import json
from PIL import Image
import io


from fpdf import FPDF

import os
from fpdf import FPDF

def create_pdf_from_text(text, output_pdf_path):
    """
    Creates a PDF from the given text.
    :param text: The text content to include in the PDF.
    :param output_pdf_path: Path to save the generated PDF.
    """
    try:
        # ✅ Ensure the directory exists
        os.makedirs(os.path.dirname(output_pdf_path), exist_ok=True)

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
            # 1. Check if file exists
            if not os.path.exists(pdf):
                return {"error": f"File not found: {pdf}"}
            
            # 2. Check if file is empty (0 bytes)
            if os.path.getsize(pdf) == 0:
                return {"error": f"File is empty and cannot be merged: {os.path.basename(pdf)}"}

            # 3. Try to append, catching specific PDF errors per file
            try:
                merger.append(pdf)
            except Exception as e:
                return {"error": f"Corrupted or invalid PDF '{os.path.basename(pdf)}': {str(e)}"}

        # 4. Write output
        with open(output_path, 'wb') as output_file:
            merger.write(output_file)

        return {"message": "PDFs merged successfully", "output_path": output_path}
    
    except Exception as e:
        return {"error": f"Error merging PDFs: {str(e)}"}
    
    finally:
        merger.close()





import fitz  # PyMuPDF
from PIL import Image
import io

import fitz  # PyMuPDF
from PIL import Image
import io
import sys

def compress_pdf(input_pdf_path, output_pdf_path, compression_level="medium"):
    """
    Compresses PDF by:
    1. Resizing/Recompressing Images (handling transparency).
    2. Subsetting Fonts (removing unused characters).
    3. Compressing Object Streams (structure).
    """
    try:
        # Compression Settings
        settings = {
            "low":    {"dpi": 200, "quality": 80},
            "medium": {"dpi": 144, "quality": 65},
            "high":   {"dpi": 72,  "quality": 40},
        }
        
        params = settings.get(compression_level, settings["medium"])
        target_dpi = params["dpi"]
        quality = params["quality"]

        doc = fitz.open(input_pdf_path)
        processed_xrefs = set()

        # --- STEP 1: IMAGE OPTIMIZATION ---
        try:
            for page in doc:
                images = page.get_images(full=True)
                
                for img in images:
                    xref = img[0]
                    if xref in processed_xrefs:
                        continue
                    processed_xrefs.add(xref)

                    try:
                        base_image = doc.extract_image(xref)
                    except Exception:
                        continue

                    image_bytes = base_image["image"]
                    
                    try:
                        img_pil = Image.open(io.BytesIO(image_bytes))
                    except Exception:
                        continue 

                    # Skip tiny images
                    width, height = img_pil.size
                    if width < 150 and height < 150:
                        continue

                    # Resize Logic
                    max_dim = 2000
                    if compression_level == "high": max_dim = 1000
                    elif compression_level == "medium": max_dim = 1500
                    
                    if width > max_dim or height > max_dim:
                        ratio = min(max_dim / width, max_dim / height)
                        new_width = int(width * ratio)
                        new_height = int(height * ratio)
                        img_pil = img_pil.resize((new_width, new_height), Image.LANCZOS)
                    
                    # Buffer for new image
                    buffer = io.BytesIO()
                    
                    # Handle Transparency (Keep PNG if transparent, else JPEG)
                    if img_pil.mode in ("RGBA", "LA") or (img_pil.mode == "P" and "transparency" in img_pil.info):
                        img_pil.save(buffer, format="PNG", optimize=True)
                    else:
                        if img_pil.mode != "RGB":
                            img_pil = img_pil.convert("RGB")
                        img_pil.save(buffer, format="JPEG", quality=quality, optimize=True)

                    # Update the image in the PDF
                    page.replace_image(xref, stream=buffer.getvalue())
        except Exception:
            pass # Continue to save even if image processing has minor hiccups

        # --- STEP 2: TEXT & FONT OPTIMIZATION ---
        # Wrapped in try-except to prevent 'm_internal' crashes on sensitive docs
        try:
            doc.subset_fonts()
        except Exception:
            pass 

        # --- STEP 3: SAVE WITH STRUCTURE COMPRESSION ---
        try:
            doc.scrub()
        except Exception:
            pass

        # garbage=4: Aggressive deduplication
        # deflate=True: Compresses content streams
        # use_objstms=1: Compresses the PDF object structure itself
        doc.save(output_pdf_path, garbage=4, deflate=True, use_objstms=1)
        doc.close()

        return {"message": "PDF compressed successfully", "output_path": output_pdf_path}

    except Exception as e:
        # DO NOT PRINT to stdout here, it breaks the JSON response
        return {"error": f"Error compressing PDF: {str(e)}"}

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

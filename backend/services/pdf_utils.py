import os
import sys  
import io
import fitz  # PyMuPDF
import re  # <--- NEW: Added for text cleaning regex
import concurrent.futures # NEW: For parallel processing

from PyPDF2 import PdfReader, PdfWriter, PdfMerger
from PIL import Image
from fpdf import FPDF


from fpdf import FPDF


# Import OCR libraries
try:
    import pytesseract
    from pdf2image import convert_from_path
    OCR_AVAILABLE = True
except ImportError:
    OCR_AVAILABLE = False
    print("Warning: OCR libraries (pytesseract, pdf2image) not found. Fallback mode disabled.")

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

def clean_extracted_text(text):
    """
    Post-processes extracted text to fix broken lines and hyphenation.
    """
    if not text:
        return ""

    # 1. Fix hyphenated words at line ends (e.g. "exam-\nple" -> "example")
    # Matches a word character, hyphen, newline, then another word character
    text = re.sub(r'(\w+)-\n(\w+)', r'\1\2', text)

    # 2. Fix broken sentences (Single newline -> Space)
    # Lookbehind (?<!\n) and Lookahead (?!\n) ensure we only target SINGLE newlines.
    # We keep double newlines (\n\n) because they usually indicate a new paragraph.
    text = re.sub(r'(?<!\n)\n(?!\n)', ' ', text)

    # 3. Collapse multiple spaces into one
    text = re.sub(r'[ \t]+', ' ', text)

    return text.strip()


def process_page_ocr(pdf_path, page_num):
    """Helper function to process a single page for OCR"""
    try:
        # Lower DPI to 150 for speed (usually sufficient for text)
        images = convert_from_path(pdf_path, first_page=page_num, last_page=page_num, dpi=150)
        if images:
            return pytesseract.image_to_string(images[0])
    except Exception:
        return ""
    return ""

def extract_text_from_pdf(pdf_path):
    try:
        doc = fitz.open(pdf_path)
        full_text = [""] * len(doc) # Pre-allocate list to keep order
        pages_to_ocr = []

        # Step 1: Quick Extraction & Identify Scanned Pages
        for i, page in enumerate(doc):
            text = page.get_text("text")
            cleaned_text = clean_extracted_text(text)
            
            # If text is good, store it. If bad, mark for OCR.
            if OCR_AVAILABLE and len(cleaned_text) < 50:
                pages_to_ocr.append(i) # Save index to process later
            else:
                full_text[i] = cleaned_text

        doc.close()

        # Step 2: Run OCR in Parallel (Only for bad pages)
        if pages_to_ocr:
            sys.stderr.write(f"Running OCR on {len(pages_to_ocr)} pages...\n")
            with concurrent.futures.ThreadPoolExecutor() as executor:
                # Submit all OCR tasks at once
                future_to_page = {
                    executor.submit(process_page_ocr, pdf_path, i + 1): i 
                    for i in pages_to_ocr
                }
                
                for future in concurrent.futures.as_completed(future_to_page):
                    page_idx = future_to_page[future]
                    try:
                        ocr_result = future.result()
                        # Only use OCR if it actually returned something meaningful
                        if len(ocr_result.strip()) > 0:
                            full_text[page_idx] = clean_extracted_text(ocr_result)
                    except Exception as exc:
                        print(f"Page {page_idx+1} generated an exception: {exc}")

        return "\n\n".join(full_text) if any(full_text) else "No text found."

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


def sign_pdf(input_pdf_path, output_pdf_path, signature_image_path, page_number, position, all_pages=False):
    """
    Signs a PDF by inserting an image signature.

    :param input_pdf_path: Path to the input PDF.
    :param output_pdf_path: Path to save the signed PDF.
    :param signature_image_path: Path to the signature image.
    :param page_number: The page number to sign (1-based index).
    :param position: A tuple (x, y, width, height) for the signature placement.
    :param all_pages: Boolean, if True signs all pages.
    :return: dict
    """
    try:
        doc = fitz.open(input_pdf_path)
        x, y, width, height = position
        rect = fitz.Rect(x, y, x + width, y + height)

        if all_pages:
            for page in doc:
                page.insert_image(rect, filename=signature_image_path)
        else:
            # Validate page number
            if page_number < 1 or page_number > len(doc):
                return {"error": "Invalid page number."}
            
            # Select the target page (0-based index)
            page = doc[page_number - 1]
            page.insert_image(rect, filename=signature_image_path)

        doc.save(output_pdf_path)
        doc.close()

        return {"message": "PDF signed successfully", "output_file": output_pdf_path}

    except Exception as e:
        return {"error": f"Error signing PDF: {e}"}







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

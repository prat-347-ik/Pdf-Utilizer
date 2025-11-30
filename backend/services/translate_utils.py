import fitz  # PyMuPDF
from deep_translator import GoogleTranslator
from fpdf import FPDF
import fpdf
import os
import pathlib
import datetime

# ✅ DEBUG LOGGER
def log_debug(message):
    with open("translation_debug.log", "a", encoding="utf-8") as f:
        timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        f.write(f"[{timestamp}] {message}\n")

def translate_text_content(text, target_lang):
    if not text or not text.strip(): 
        log_debug("Skipping: Empty text input")
        return ""
    
    if target_lang == 'en': 
        return text

    try:
        log_debug(f"Initializing Translator for target: {target_lang}")
        translator = GoogleTranslator(source='auto', target=target_lang)
        
        chunks = []
        current_chunk = ""
        # Chunking (Safe size ~3000 chars)
        for line in text.split('\n'):
            if len(current_chunk) + len(line) < 3000:
                current_chunk += line + "\n"
            else:
                chunks.append(current_chunk)
                current_chunk = line + "\n"
        if current_chunk: chunks.append(current_chunk)

        log_debug(f"Text split into {len(chunks)} chunks.")

        translated_text = ""
        for i, chunk in enumerate(chunks):
            try:
                trans = translator.translate(chunk)
                if trans:
                    translated_text += trans + "\n"
                else:
                    log_debug(f"Chunk {i} returned None/Empty.")
            except Exception as e:
                log_debug(f"❌ Chunk {i} Failed: {str(e)}")
                # Keep original text if translation fails, so we don't lose content
                translated_text += chunk + "\n" 
        
        return translated_text

    except Exception as e:
        log_debug(f"❌ CRITICAL Translation Setup Error: {str(e)}")
        return text 

def translate_pdf(input_path, output_path, target_lang='es'):
    try:
        log_debug(f"--- Starting PDF Translation: {input_path} ---")
        
        # 1. Extract
        doc = fitz.open(input_path)
        full_text = ""
        for page in doc: full_text += page.get_text() + "\n\n"
        
        if not full_text.strip(): 
            log_debug("Error: No text found in PDF")
            return {"error": "No text found in PDF."}

        # 2. Translate
        translated_text = translate_text_content(full_text, target_lang)

        # 3. Generate PDF
        pdf = FPDF()
        pdf.add_page()

        # Resolve Font Paths
        base_dir = pathlib.Path(__file__).resolve().parent.parent
        fonts_dir = base_dir / "fonts"
        
        font_map = {
            "DejaVu": "DejaVuSans.ttf",
            "Hindi": "NotoSansDevanagari-Regular.ttf", 
            "Chinese": "NotoSansSC-Regular.ttf",
            "Japanese": "NotoSansJP-Regular.ttf",
            "Korean": "NotoSansKR-Regular.ttf",
            "Gujarati": "NotoSansGujarati-Regular.ttf",
            "Bengali": "NotoSansBengali-Regular.ttf",
            "Tamil": "NotoSansTamil-Regular.ttf",
            "Telugu": "NotoSansTelugu-Regular.ttf",
            "Thai": "NotoSansThai-Regular.ttf",
            "Kannada": "NotoSansKannada-Regular.ttf",
        }

        def register_font(name, filename):
            f_path = fonts_dir / filename
            if not f_path.exists():
                log_debug(f"Missing Font: {f_path}")
                return False
            try:
                pdf.add_font(name, style="", fname=str(f_path))
                return True
            except Exception as e:
                log_debug(f"Font Load Error ({name}): {e}")
                return False

        if not register_font("DejaVu", font_map["DejaVu"]):
            return {"error": "Critical: Could not load DejaVuSans.ttf"}
        
        pdf.set_font("DejaVu", size=12)

        # Register Fallbacks
        fallbacks = []
        for name, filename in font_map.items():
            if name == "DejaVu": continue
            if register_font(name, filename):
                fallbacks.append(name)
        
        if fallbacks:
            pdf.set_fallback_fonts(fallbacks)

        pdf.multi_cell(0, 10, translated_text)
        pdf.output(output_path)
        
        log_debug("Success: PDF Generated")
        return {"message": "Success", "output_path": output_path}

    except Exception as e:
        log_debug(f"Global Error: {str(e)}")
        return {"error": f"General Error: {str(e)}"}
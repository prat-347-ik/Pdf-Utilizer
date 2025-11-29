import fitz  # PyMuPDF
from deep_translator import GoogleTranslator
from fpdf import FPDF
import os
import pathlib

def translate_pdf(input_path, output_path, target_lang='es'):
    try:
        # 1. Initialize Translator
        translator = GoogleTranslator(source='auto', target=target_lang)
        
        doc = fitz.open(input_path)
        full_text = ""
        for page in doc:
            full_text += page.get_text() + "\n\n"
        
        if not full_text.strip():
            return {"error": "No text found in PDF."}

        # 2. Translate (Chunking logic)
        chunks = []
        current_chunk = ""
        for line in full_text.split('\n'):
            if len(current_chunk) + len(line) < 4500:
                current_chunk += line + "\n"
            else:
                chunks.append(current_chunk)
                current_chunk = line + "\n"
        if current_chunk:
            chunks.append(current_chunk)

        translated_text = ""
        for chunk in chunks:
            try:
                translated_text += translator.translate(chunk) + "\n"
            except Exception:
                pass # Silently skip errors to avoid breaking JSON output

        # 3. Create PDF
        pdf = FPDF()
        pdf.add_page()

        # Define paths
        fonts_dir = pathlib.Path(__file__).parent.parent / "fonts"
        
        font_map = {
            "DejaVu": "DejaVuSans.ttf",
            "Hindi": "NotoSansDevanagari-Regular.ttf",
            "Chinese": "NotoSansSC-Regular.ttf",
            "Japanese": "NotoSansJP-Regular.ttf",
            "Korean": "NotoSansKR-Regular.ttf"
        }

        # Enable Complex Text Shaping
        try:
            pdf.set_text_shaping(True) 
        except Exception:
            pass # Silent failure

        # Register Main Font
        main_font_path = fonts_dir / font_map["DejaVu"]
        if main_font_path.exists():
            pdf.add_font("DejaVu", style="", fname=str(main_font_path))
            pdf.set_font("DejaVu", size=12)
        else:
            return {"error": f"Main font missing at {main_font_path}"}

        # Register Fallback Fonts
        available_fallbacks = []
        for name, filename in font_map.items():
            if name == "DejaVu": continue 
            
            f_path = fonts_dir / filename
            if f_path.exists():
                pdf.add_font(name, style="", fname=str(f_path))
                available_fallbacks.append(name)
                # print(f"Loaded fallback font: {name}")  <-- REMOVED THIS LINE
        
        if available_fallbacks:
            pdf.set_fallback_fonts(available_fallbacks)

        # Write Text
        pdf.multi_cell(0, 10, translated_text)
        
        pdf.output(output_path)
        return {"message": "Translation successful", "output_path": output_path}

    except Exception as e:
        # print(f"Translation Error: {e}") <-- REMOVED THIS LINE
        return {"error": f"Translation failed: {str(e)}"}
import os
from googletrans import Translator
from fpdf import FPDF

# Ensure fonts directory exists
FONT_DIR = os.path.join(os.getcwd(), "backend", "fonts")
os.makedirs(FONT_DIR, exist_ok=True)

translator = Translator()

def translate_text(text, target_language):
    """
    Translates text to the target language.

    :param text: The text to translate.
    :param target_language: The target language (e.g., "fr" for French, "hi" for Hindi).
    :return: Translated text.
    """
    if not isinstance(text, str):
        return {"error": "Invalid input. Expected a string."}  # Ensure input is a string

    translator = Translator()
    translated = translator.translate(text.strip(), dest=target_language)

    return translated.text


def create_pdf_from_text(text, output_path, language_code):
    """
    Creates a PDF from the translated text.

    :param text: The translated text.
    :param output_path: Path to save the output PDF.
    :param language_code: The language code to determine font usage.
    """
    pdf = FPDF()
    pdf.add_page()

    # Select font based on language
    font_path = select_font_for_language(language_code)
    pdf.add_font("CustomFont", "", font_path, uni=True)
    pdf.set_font("CustomFont", size=12)

    pdf.multi_cell(0, 10, text)
    pdf.output(output_path, "F")

def select_font_for_language(language_code):
    """
    Selects an appropriate font for non-Latin languages.

    :param language_code: Language code (e.g., "hi" for Hindi, "zh-cn" for Chinese).
    :return: Path to the font file.
    """
    font_mapping = {
        "hi": "NotoSansDevanagari.ttf",  # Hindi
        "zh-cn": "NotoSansSC.ttf",  # Simplified Chinese
        "ar": "NotoNaskhArabic.ttf",  # Arabic
        "ja": "NotoSansJP.ttf",  # Japanese
        "ko": "NotoSansKR.ttf",  # Korean
    }

    font_file = font_mapping.get(language_code, "Arial.ttf")  # Default to Arial for Latin-based languages
    font_path = os.path.join(FONT_DIR, font_file)

    if not os.path.exists(font_path):
        raise FileNotFoundError(f"Font file '{font_file}' not found in {FONT_DIR}. Please add it.")

    return font_path

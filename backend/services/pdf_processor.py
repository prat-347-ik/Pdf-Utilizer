import sys
import io
import json
import os

# Set encoding to handle special characters
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

# ✅ KEEP LIGHTWEIGHT IMPORTS AT THE TOP
from pdf_utils import (
    merge_pdfs, split_pdf, rotate_pdf, protect_pdf, 
    compress_pdf, extract_text_from_pdf, extract_images_from_pdf, 
    sign_pdf, create_pdf_from_text
)

def send_response(success, data=None, error=None):
    print(json.dumps({"success": success, "data": data, "error": error}))

def main():
    try:
        if len(sys.argv) < 3:
            raise Exception("Insufficient arguments")

        operation = sys.argv[1]
        payload = json.loads(sys.argv[2])

        # --- 1. MERGE ---
        if operation == "merge":
            result = merge_pdfs(payload['files'], payload['output'])
            if "error" in result: raise Exception(result['error'])
            send_response(True, data={"filePath": result['output_path']})

        # --- 2. SPLIT ---
        elif operation == "split":
            pages = [int(p) for p in payload['pages']]
            result = split_pdf(payload['file'], pages, payload['output_folder'])
            if "error" in result: raise Exception(result['error'])
            send_response(True, data={"filePath": result['output_file']})

        # --- 3. ROTATE ---
        elif operation == "rotate":
            rotations = {int(k): int(v) for k, v in payload['rotations'].items()}
            result = rotate_pdf(payload['file'], payload['output'], rotations)
            if "error" in result: raise Exception(result['error'])
            send_response(True, data={"filePath": result['output_file']})

        # --- 4. PROTECT ---
        elif operation == "protect":
            result = protect_pdf(payload['file'], payload['output'], payload['password'])
            if isinstance(result, dict) and "error" in result: raise Exception(result['error'])
            send_response(True, data={"filePath": payload['output']})

        # --- 5. COMPRESS ---
        elif operation == "compress":
            result = compress_pdf(payload['file'], payload['output'], payload.get('level', 'medium'))
            if "error" in result: raise Exception(result['error'])
            send_response(True, data={"filePath": result['output_path']})

        # --- 6. EXTRACT TEXT ---
        elif operation == "extract_text":
            text = extract_text_from_pdf(payload['file'])
            if text.startswith("Error"): raise Exception(text)
            send_response(True, data={"text": text})

        # --- 7. EXTRACT IMAGES ---
        elif operation == "extract_images":
            result = extract_images_from_pdf(payload['file'], payload['output_folder'])
            if "error" in result: raise Exception(result['error'])
            send_response(True, data={"folder": result['output_folder']})
            
        # --- 8. CREATE PDF FROM TEXT ---
        elif operation == "create_from_text":
            create_pdf_from_text(payload['text'], payload['output'])
            send_response(True, data={"filePath": payload['output']})

        # --- 9. SIGN ---
        elif operation == "sign":
            result = sign_pdf(
                payload['file'], 
                payload['output'], 
                payload['signature_img'], 
                int(payload['page']), 
                tuple(payload['position']),
                payload.get('all_pages', False)
            )
            if "error" in result: raise Exception(result['error'])
            send_response(True, data={"filePath": result['output_file']})

        # --- 10. TRANSLATE (HEAVY IMPORT) ---
        elif operation == "translate":
            # 🔴 Lazy Import: Only load this if user asks for translation
            from translate_utils import translate_pdf
            result = translate_pdf(payload['file'], payload['output'], payload['lang'])
            if "error" in result: raise Exception(result['error'])
            send_response(True, data={"filePath": result['output_path']})

        # --- 11. TTS (HEAVY IMPORT) ---
        elif operation == "tts":
            # 🔴 Lazy Import
            from translate_utils import translate_text_content
            from tts_utils import text_to_speech
            
            text_content = extract_text_from_pdf(payload['file'])
            if not text_content or text_content.strip() == "":
                raise Exception("Could not extract text from this PDF.")
            
            target_lang = payload.get('lang', 'en')
            final_text = translate_text_content(text_content, target_lang)
            text_to_speech(final_text, payload['output'], target_lang)
            send_response(True, data={"filePath": payload['output']}) 

        # --- 12. RAG INGEST (HEAVY IMPORT) ---
        elif operation == "rag_ingest":
            # 🔴 Lazy Import
            from rag_utils import ingest_pdf
            result = ingest_pdf(payload['file'], payload['index_id'])
            if "error" in result: raise Exception(result['error'])
            send_response(True, data=result)

        # --- 13. RAG QUERY (HEAVY IMPORT) ---
        elif operation == "rag_query":
            # 🔴 Lazy Import
            from rag_utils import ask_pdf
            result = ask_pdf(payload['query'], payload['index_id'])
            if "error" in result: raise Exception(result['error'])
            send_response(True, data=result)    

        # --- 14. GENERATE QUIZ (HEAVY IMPORT) ---
        elif operation == "generate_quiz":
            # 🔴 Lazy Import
            from quiz_utils import extract_text_for_quiz, generate_quiz_json
            
            text_content = extract_text_for_quiz(payload['file'])
            if len(text_content) < 100:
                raise Exception("PDF text is too short to generate a quiz.")
            quiz_data = generate_quiz_json(text_content)
            send_response(True, data={"quiz": quiz_data})  

        else:
            raise Exception(f"Unknown operation: {operation}")

    except Exception as e:
        send_response(False, error=str(e))

if __name__ == "__main__":
    main()
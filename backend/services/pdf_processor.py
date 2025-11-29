import sys
import json
import os

# Import functions from your provided utils file
from pdf_utils import (
    merge_pdfs, split_pdf, rotate_pdf, protect_pdf, 
    compress_pdf, extract_text_from_pdf, extract_images_from_pdf, 
    sign_pdf, create_pdf_from_text
)

def send_response(success, data=None, error=None):
    """Helper to print JSON to stdout for Node.js to capture."""
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
            # Ensure pages are integers
            pages = [int(p) for p in payload['pages']]
            result = split_pdf(payload['file'], pages, payload['output_folder'])
            if "error" in result: raise Exception(result['error'])
            send_response(True, data={"filePath": result['output_file']})

        # --- 3. ROTATE ---
        elif operation == "rotate":
            # Convert keys to integers because JSON keys are always strings
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
            # Check if function returned an error string starting with "Error"
            if text.startswith("Error"): raise Exception(text)
            send_response(True, data={"text": text})

        # --- 7. EXTRACT IMAGES ---
        elif operation == "extract_images":
            result = extract_images_from_pdf(payload['file'], payload['output_folder'])
            if "error" in result: raise Exception(result['error'])
            send_response(True, data={"folder": result['output_folder']})
            
        # --- 8. CREATE PDF FROM TEXT ---
        elif operation == "create_from_text":
             # Your utils function doesn't return anything on success, so we catch exceptions
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
           payload.get('all_pages', False) # ✅ Get flag, default to False
           )
            if "error" in result: raise Exception(result['error'])
            send_response(True, data={"filePath": result['output_file']})

        else:
            raise Exception(f"Unknown operation: {operation}")

    except Exception as e:
        send_response(False, error=str(e))

if __name__ == "__main__":
    main()
import sys
import fitz  # PyMuPDF
from presidio_analyzer import AnalyzerEngine
from presidio_analyzer.nlp_engine import NlpEngineProvider # 1. Import Provider

# --- CONFIGURATION FOR LOW MEMORY (Fixes 502 Error) ---
# We explicitly tell Presidio to use the 'sm' (Small) model instead of 'lg'
configuration = {
    "nlp_engine_name": "spacy",
    "models": [{"lang_code": "en", "model_name": "en_core_web_sm"}],
}

# Initialize the NLP engine with our small model config
provider = NlpEngineProvider(nlp_configuration=configuration)
nlp_engine = provider.create_engine()

# Pass the custom engine to the Analyzer
analyzer = AnalyzerEngine(nlp_engine=nlp_engine, supported_languages=["en"])
# ------------------------------------------------------

def redact_pdf_stream(input_path, entities_to_redact=None):
    # Log to stderr to avoid corrupting the stdout PDF stream
    print(f"Processing: {input_path}", file=sys.stderr)

    if entities_to_redact is None:
        entities_to_redact = ["EMAIL_ADDRESS", "PHONE_NUMBER", "US_SSN"]

    doc = fitz.open(input_path)
    
    for page in doc:
        text = page.get_text()
        if not text.strip():
            continue

        # Analyze text for PII
        results = analyzer.analyze(text=text, entities=entities_to_redact, language='en')

        # Collect unique PII strings
        redaction_candidates = set()
        for result in results:
            pii_text = text[result.start:result.end]
            redaction_candidates.add(pii_text)

        # Apply Redaction
        for pii_text in redaction_candidates:
            # Search for the text in the PDF
            areas = page.search_for(pii_text)
            
            # Add redaction annotation (black box)
            for area in areas:
                page.add_redact_annot(area, fill=(0, 0, 0)) 
        
        # Commit the redactions to the page
        page.apply_redactions()

    # STREAM RESULT: Write bytes directly to standard output
    pdf_bytes = doc.tobytes()
    sys.stdout.buffer.write(pdf_bytes)
    doc.close()

if __name__ == "__main__":
    # Expects: script.py <input_path> <types>
    if len(sys.argv) > 1:
        input_file = sys.argv[1]
        
        pii_types = ["EMAIL_ADDRESS", "PHONE_NUMBER", "US_SSN"]
        if len(sys.argv) > 2:
            raw_types = sys.argv[2]
            if raw_types and raw_types != "undefined":
                pii_types = raw_types.split(",")

        try:
            redact_pdf_stream(input_file, pii_types)
        except Exception as e:
            # Print error to stderr so it doesn't crash the Node.js stream
            print(f"Error: {str(e)}", file=sys.stderr)
            sys.exit(1)
    else:
        print("Error: Insufficient arguments", file=sys.stderr)
        sys.exit(1)
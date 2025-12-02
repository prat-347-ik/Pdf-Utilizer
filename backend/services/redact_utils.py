import sys
import fitz  # PyMuPDF
from presidio_analyzer import AnalyzerEngine
from presidio_analyzer.nlp_engine import SpacyNlpEngine

# Initialize engine outside the function if possible, 
# but for a spawned script, we init inside or globally.
# Using en_core_web_lg for better accuracy.
analyzer = AnalyzerEngine()

def redact_pdf(input_path, output_path, entities_to_redact=None):
    """
    scans input_path for PII, redacts it, saves to output_path.
    entities_to_redact: list of strings e.g. ["EMAIL_ADDRESS", "PHONE_NUMBER", "PERSON"]
    """
    if entities_to_redact is None:
        entities_to_redact = ["EMAIL_ADDRESS", "PHONE_NUMBER", "US_SSN"]

    doc = fitz.open(input_path)
    
    for page in doc:
        # 1. Get text from the page
        text = page.get_text()
        
        if not text.strip():
            continue

        # 2. Analyze text for PII
        results = analyzer.analyze(text=text,
                                   entities=entities_to_redact,
                                   language='en')

        # 3. Create redactions
        # We collect unique sensitive text snippets to search for them
        # Note: robust implementation might use character offsets, 
        # but search_for is more reliable for PDF visual layout.
        
        redaction_candidates = set()
        for result in results:
            # Extract the actual text identified as PII
            pii_text = text[result.start:result.end]
            redaction_candidates.add(pii_text)

        # 4. Apply annotations
        for pii_text in redaction_candidates:
            # search_for returns a list of Rect objects (coordinates)
            areas = page.search_for(pii_text)
            
            for area in areas:
                # Add a "Redact" annotation (the red outline)
                page.add_redact_annot(area, fill=(0, 0, 0)) 

        # 5. Burn in the redactions (Apply)
        # This physically removes the text and places the black box
        page.apply_redactions()

    doc.save(output_path)
    doc.close()

if __name__ == "__main__":
    # Simple CLI argument handling for integration with Node.js
    # Usage: python redact_utils.py <input> <output> <types_comma_separated>
    if len(sys.argv) > 2:
        input_file = sys.argv[1]
        output_file = sys.argv[2]
        
        # Parse PII types if provided
        pii_types = ["EMAIL_ADDRESS", "PHONE_NUMBER", "US_SSN"]
        if len(sys.argv) > 3:
            raw_types = sys.argv[3]
            if raw_types and raw_types != "undefined":
                pii_types = raw_types.split(",")

        redact_pdf(input_file, output_file, pii_types)
        print(f"Redaction Complete: {output_file}")
    else:
        print("Error: Insufficient arguments.")
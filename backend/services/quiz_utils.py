import os
import json
import fitz  # PyMuPDF
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.schema import HumanMessage

def extract_text_for_quiz(file_path):
    """Extracts text from PDF, limiting size to avoid token limits."""
    try:
        doc = fitz.open(file_path)
        text = ""
        for page in doc:
            text += page.get_text()
        # Limit to ~30k characters to fit context window
        return text[:30000]
    except Exception as e:
        print(f"Error extracting text: {e}")
        return ""

def generate_quiz_json(text_content):
    """
    Uses Gemini to generate a structured JSON quiz with EXPLANATIONS.
    Returns: A Python list of dictionaries (Question Objects).
    """
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        raise Exception("GOOGLE_API_KEY is missing in environment variables.")

    llm = ChatGoogleGenerativeAI(
        model="gemini-2.0-flash", 
        temperature=0.3,
        google_api_key=api_key
    )

    # UPDATED PROMPT: Requesting 'id', 'correctAnswer', and 'explanation'
    prompt = f"""
    You are an expert teacher. Create a 10-question multiple-choice quiz based on the following text.
    
    Rules:
    1. Return ONLY raw JSON. No markdown formatting (no ```json).
    2. The output must be a valid JSON Array.
    3. Each object must follow this exact schema:
       {{
         "id": 1,
         "question": "The question text?",
         "options": ["A) Option 1", "B) Option 2", "C) Option 3", "D) Option 4"],
         "correctAnswer": "A) Option 1",
         "explanation": "A short, 1-2 sentence explanation of why this answer is correct."
       }}
    4. Ensure the "correctAnswer" matches one of the "options" exactly.

    Text content:
    {text_content}
    """

    try:
        response = llm.invoke([HumanMessage(content=prompt)])
        content = response.content.strip()
        
        # Cleanup markdown if LLM adds it
        if content.startswith("```json"): content = content[7:]
        elif content.startswith("```"): content = content[3:]
        if content.endswith("```"): content = content[:-3]
            
        return json.loads(content)
    except Exception as e:
        raise Exception(f"Failed to generate quiz JSON: {str(e)}")
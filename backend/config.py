import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "fallback_secret_key")  # Use .env or fallback
    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL", "postgresql://postgres:password@localhost:5432/pdf_utilizer")
    SQLALCHEMY_TRACK_MODIFICATIONS = False  

    # Upload directories
    UPLOAD_FOLDER = "backend/uploads"
    MERGED_FOLDER = "backend/merged_pdfs"
    SPLIT_FOLDER = "backend/split_pdfs"
    EXTRACTED_TEXT_FOLDER = "backend/extracted_texts"
    EXTRACTED_IMAGES_FOLDER = "backend/extracted_images"
    COMPRESSED_FOLDER = "backend/compressed_pdfs"

import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize database
db = SQLAlchemy()

def create_app():
    app = Flask(__name__)
    CORS(app, resources={r"/*": {"origins": "*"}})

    # Load config
    app.config.from_object("backend.config.Config")

    # Initialize extensionsc
    db.init_app(app)  # ✅ This is still here!
    JWTManager(app)

    # Import and register blueprints
    from backend.routes.auth_routes import auth_bp
    from backend.routes.pdf_routes import pdf_bp
    from backend.routes.tts_routes import tts_bp
    from backend.routes.stt_routes import stt_bp
    from backend.routes.translate_routes import translate_bp

    app.register_blueprint(auth_bp, url_prefix="/auth")
    app.register_blueprint(pdf_bp, url_prefix="/pdf")
    app.register_blueprint(tts_bp, url_prefix="/api/tts")
    app.register_blueprint(stt_bp, url_prefix="/api/stt")
    app.register_blueprint(translate_bp, url_prefix="/api")

    # Create database tables
    with app.app_context():
        db.create_all()

    return app

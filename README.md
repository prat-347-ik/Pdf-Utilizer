# PDF Utilizer - Backend

![Node.js](https://img.shields.io/badge/Node.js-v18%2B-43853D?style=flat&logo=node.js&logoColor=white)
![Python](https://img.shields.io/badge/Python-v3.10%2B-3776AB?style=flat&logo=python&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-v14%2B-336791?style=flat&logo=postgresql&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-yellow.svg)
![Build Status](https://img.shields.io/badge/Status-Active_Development-brightgreen)

This is the backend server for the "PDF Utilizer" application. It utilizes a **hybrid architecture**:
* **Node.js (Express):** Handles API routing, authentication (JWT), file uploads (Multer), and managing the request/response lifecycle.
* **Python:** Operates as a microservice/script runner for heavy computational tasks (PDF manipulation, NLP, OCR, and AI generation).

## 🏗 Architecture Overview

The backend follows a service-oriented pattern where Node.js spawns Python child processes to execute specific PDF tasks.

### 1. Core Services (Node.js)
* **Auth Service:** User registration, login, and JWT issuance.
* **File Service:** Manages temporary storage (`uploads/`) and processed files (`processed/`).
* **Controller Layer:** Validates inputs and spawns Python scripts.

### 2. PDF Intelligence Engine (Python)
The Python layer handles the heavy lifting using libraries like `PyMuPDF`, `FPDF2`, and `Presidio`:
* **Standard Utils:** Merge, Split, Rotate, Compress.
* **Smart Redaction (PII Shield):** Uses Microsoft Presidio & Spacy to detect and redact sensitive data.
* **Visual Diff:** Compares two PDFs and highlights textual changes.
* **Quiz Generator:** Uses OpenAI LLM + FPDF2 to generate study quizzes from PDF content.

## 📋 Prerequisites

Ensure you have the following installed:
* **Node.js** (v18 or higher)
* **Python** (v3.10 or higher)
* **MongoDB** (Local instance or Atlas URI)

## 🚀 Installation & Setup

### 1. Clone & Navigate
```bash
git clone https://github.com/prat-347-ik/Pdf-Utilizer
cd backend
```

### 2. Node.js Setup
Install the JavaScript dependencies:
```bash
npm install
```

### 3. Python Setup
It is highly recommended to use a virtual environment to prevent dependency conflicts.
### Create Virtual Environment:
```bash
# Windows
python -m venv venv
.\venv\Scripts\activate

# Mac/Linux
python3 -m venv venv
source venv/bin/activate
```

### Install Python Dependencies:
```bash
pip install -r requirements.txt
```

### 4. ⚠️ CRITICAL: Content Intelligence Setup
For the **Smart Redaction** feature to function, you must download the Spacy NLP model. If you skip this, PII detection will fail.
```bash
python -m spacy download en_core_web_lg
```

## ⚙️ Configuration (.env)
Create a .env file in the backend/ root directory. Copy the following template:

```
# --- Server Config ---
PORT=5000
NODE_ENV=development

# --- Database ---
DATABASE_URL=mongodb://localhost:27017/pdf_utilizer

# --- Authentication ---
JWT_SECRET=replace_this_with_a_secure_random_string
JWT_EXPIRES_IN=7d

# --- AI Services (Required for Quiz Gen) ---
OPENAI_API_KEY=sk-your-openai-key-here

# --- Python Path (Optional) ---
# If your system python is different from the venv python, specify the path to the python executable here.
# PYTHON_PATH=./venv/bin/python
```

## 🏃‍♂️ Running the Application
Ensure Postgres is running locally or that your Postgres URI is valid.

**Development Mode**
Runs with nodemon for auto-reloading on changes.
```bash
npm run dev
```
**Production Mode**
```bash
npm start
```
The server will start on: http://localhost:5000

## 📂 Project Structure
```
backend/
├── src/
│   ├── config/         # Database and App Config
│   ├── controllers/    # Route Logic (Spawns Python Scripts)
│   ├── middleware/     # Auth and Upload handling
│   ├── models/         # Mongoose Schemas (User, History)
│   ├── routes/         # Express API Routes
│   └── services/       # PythonSpawner Service
├── services/           # PYTHON SCRIPTS
│   ├── pdf_processor.py # Main Entry Point (Router)
│   ├── pdf_utils.py    # Basic PDF Functions
│   ├── redact_utils.py # PII Redaction Logic
│   ├── diff_utils.py   # PDF Comparison Logic
│   └── quiz_utils.py   # Quiz Generation Logic
├── uploads/            # Temp Input Files
├── processed/          # Temp Output Files
├── fonts/              # Custom Fonts for PDF Generation
└── server.js           # App Entry Point
```
## 🛠 Troubleshooting
 **Issue: "Python script failed with code 1"**
 -Check Venv: Ensure you activated your virtual environment before running the Node server, or set the PYTHON_PATH in your .env to point directly to the venv executable (e.g., backend/venv/bin/python).

 -Check Model: Did you run python -m spacy download en_core_web_lg?

 -Check Logs: The Node console will print the stderr from Python. Read that error message for specifics.

 **Issue: "OSError: [E050] Can't find model 'en_core_web_lg'"**
 -Run the download command mentioned in step 4 above.

 **Issue: Font Errors in Quiz Generation**
 -Ensure the backend/fonts/ directory exists and contains DejaVuSans.ttf or your chosen unicode font



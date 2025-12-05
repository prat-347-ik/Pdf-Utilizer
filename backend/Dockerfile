# backend/Dockerfile

# 1. Use a Linux base image that has both Node and Python
FROM node:18-slim

# 2. Install Python and other necessary tools
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-venv \
    && rm -rf /var/lib/apt/lists/*

# 3. Create a virtual environment for Python (Recommended)
ENV VIRTUAL_ENV=/opt/venv
RUN python3 -m venv $VIRTUAL_ENV
ENV PATH="$VIRTUAL_ENV/bin:$PATH"

# 4. Set the working directory inside the container
WORKDIR /app

# 5. Copy package files first (for better caching)
COPY package*.json ./
COPY requirements.txt ./

# 6. Install Node dependencies
RUN npm install

# 7. Install Python dependencies
RUN pip install -r requirements.txt

# --- NEW STEP: Download Spacy NLP Model ---
# --- UPDATED STEP: Install Spacy Model directly via PIP ---
# We replace the 'python -m spacy download' command with this direct link.
# This bypasses the downloader glitch.
# The large model (580MB) crashes the free tier memory. The small model (12MB) works perfectly.
RUN pip install https://github.com/explosion/spacy-models/releases/download/en_core_web_sm-3.7.1/en_core_web_sm-3.7.1-py3-none-any.whl
# 8. Copy the rest of your backend code
COPY . .

# 9. Create the uploads folder manually to be safe
RUN mkdir -p uploads && chmod 777 uploads
# 10. Expose the port your app runs on
EXPOSE 5000

# 11. Start the server
CMD ["npm", "start"]
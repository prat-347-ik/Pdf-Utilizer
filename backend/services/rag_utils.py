import os
import sys
import traceback
from langchain_community.document_loaders import PyMuPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS
# We import Chat here because it is used in ask_pdf, but Embeddings are lazy-loaded
from langchain_google_genai import ChatGoogleGenerativeAI

# 1. SETUP: Define absolute path for robustness
# usage of abspath ensures we get the full c:\... path on Windows
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
INDEX_FOLDER = os.path.join(BASE_DIR, "../uploads/indices")
os.makedirs(INDEX_FOLDER, exist_ok=True)

def get_embeddings():
    """
    Smart Embedding Selection:
    - If on RENDER: Use Google Gemini (Saves RAM).
    - If LOCAL: Use HuggingFace (Unlimited, Free).
    """
    is_render = os.getenv("RENDER") == "true"

    if is_render:
        print("🌍 Environment: RENDER. Using Google Gemini Embeddings.", file=sys.stderr)
        try:
            from langchain_google_genai import GoogleGenerativeAIEmbeddings
        except ImportError:
            raise ImportError("Module 'langchain_google_genai' not found.")

        api_key = os.getenv("GOOGLE_API_KEY")
        if not api_key:
            raise ValueError("GOOGLE_API_KEY not found in environment variables")
        
        return GoogleGenerativeAIEmbeddings(model="models/text-embedding-004", google_api_key=api_key)
    else:
        print("💻 Environment: LOCAL. Using HuggingFace Embeddings.", file=sys.stderr)
        from langchain_community.embeddings import HuggingFaceEmbeddings
        return HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")

# ... existing imports ...

def ingest_pdf(file_path, index_id):
    try:
        print(f"Starting ingestion for file: {file_path}", file=sys.stderr)

        # 1. Load PDF
        loader = PyMuPDFLoader(file_path)
        documents = loader.load()
        if not documents:
            return {"error": "PDF could not be loaded or is empty."}
            
        print(f"PDF Loaded. Total Pages: {len(documents)}", file=sys.stderr)

        # 🛑 OPTIMIZATION 1: Limit Pages for Free Tier Stability
        # Process max 15 pages to prevent Timeout/Crash
        MAX_PAGES = 15
        if len(documents) > MAX_PAGES:
            print(f"⚠️ Limit reached. Processing first {MAX_PAGES} pages only.", file=sys.stderr)
            documents = documents[:MAX_PAGES]

        # 🛑 OPTIMIZATION 2: Increase Chunk Size (Fewer API Calls = Faster)
        # 1000 -> 4000 reduces API calls by 4x
        text_splitter = RecursiveCharacterTextSplitter(chunk_size=4000, chunk_overlap=400)
        chunks = text_splitter.split_documents(documents)
        print(f"Text Split into {len(chunks)} chunks.", file=sys.stderr)

        # 3. Create Vector Store (Auto-switches based on env)
        embeddings = get_embeddings()
        vector_store = FAISS.from_documents(chunks, embeddings)
        
        # 4. Save to Disk
        save_path = os.path.join(INDEX_FOLDER, index_id)
        vector_store.save_local(save_path)
        print(f"Index saved successfully to {save_path}", file=sys.stderr)

        return {"status": "success", "chunks": len(chunks), "index_id": index_id}

    except Exception as e:
        print(f"ERROR in ingest_pdf: {str(e)}", file=sys.stderr)
        traceback.print_exc(file=sys.stderr)
        return {"error": f"Ingestion failed: {str(e)}"}

# ... rest of the file (ask_pdf, etc) ...

def ask_pdf(query, index_id):
    try:
        load_path = os.path.join(INDEX_FOLDER, index_id)
        
        # 🔍 DEBUG: Print where we are looking
        print(f"🔍 DEBUG: Attempting to load index from: {load_path}", file=sys.stderr)
        print(f"🔍 DEBUG: Does this path exist? {os.path.exists(load_path)}", file=sys.stderr)
        print(f"🔍 DEBUG: Contents of parent folder ({INDEX_FOLDER}): {os.listdir(INDEX_FOLDER)}", file=sys.stderr)
        
        if not os.path.exists(load_path):
            print(f"❌ Error: Index path not found: {load_path}", file=sys.stderr)
            return {"error": "Index not found. Please re-upload the file."}

        # Load Vector Store
        embeddings = get_embeddings()
        vector_store = FAISS.load_local(load_path, embeddings, allow_dangerous_deserialization=True)
        
        # Retrieve Context
        docs = vector_store.similarity_search(query, k=5)
        context_text = "\n\n".join([doc.page_content for doc in docs])

        api_key = os.getenv("GOOGLE_API_KEY")
        if not api_key:
             return {"error": "Missing GOOGLE_API_KEY"}

        llm = ChatGoogleGenerativeAI(
            model="gemini-2.0-flash-lite",
            temperature=0.3,
            google_api_key=api_key
        )
        
        prompt = f"""
        **ROLE**: You are an expert PDF analysis and summarization assistant. Your task is to provide clear, concise, and accurate answers to the user's question based *only* on the provided context.

        **CONTEXT**:
        {context_text}
        
        **INSTRUCTIONS**:
        1. **Strictly adhere** to the information provided in the CONTEXT above. Do not use outside knowledge.
        2. If the answer cannot be found in the provided CONTEXT, you **must** state: "I apologize, but the required information is not available in the document."
        3. Do not mention that the answer came from the context or the document; simply state the answer directly.
        4. If the question is a "how-to" or requests a list, use bullet points or numbered lists for clarity.

        **USER QUESTION**: 
        {query}
        
        **ANSWER**:"""
        
        response = llm.invoke(prompt)
        
        return {
            "answer": response.content,
            "context": context_text,
            "relevant_chunks": len(docs)
        }

    except Exception as e:
        print(f"ERROR in ask_pdf: {str(e)}", file=sys.stderr)
        traceback.print_exc(file=sys.stderr)
        return {"error": f"RAG Query failed: {str(e)}"}
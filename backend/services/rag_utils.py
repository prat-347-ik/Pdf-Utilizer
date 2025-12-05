import os
import sys
import traceback
from langchain_community.document_loaders import PyMuPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
from langchain_google_genai import ChatGoogleGenerativeAI

# 1. SETUP: Define where to store the vector indices
INDEX_FOLDER = os.path.join(os.path.dirname(__file__), "../uploads/indices")
os.makedirs(INDEX_FOLDER, exist_ok=True)

# 2. EMBEDDING MODEL
# We initialize this globally. If it fails, we log it immediately.
embeddings = None
try:
    print("Loading Embedding Model...", file=sys.stderr)
    embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
    print("Embedding Model Loaded Successfully.", file=sys.stderr)
except Exception as e:
    print(f"CRITICAL ERROR: Failed to load embedding model: {e}", file=sys.stderr)
    traceback.print_exc(file=sys.stderr)

def ingest_pdf(file_path, index_id):
    try:
        if embeddings is None:
            raise Exception("Embedding model is not initialized. Check server logs.")

        print(f"Starting ingestion for file: {file_path}", file=sys.stderr)

        # Load PDF
        loader = PyMuPDFLoader(file_path)
        documents = loader.load()
        print(f"PDF Loaded. Pages: {len(documents)}", file=sys.stderr)

        # Split Text
        text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
        chunks = text_splitter.split_documents(documents)
        print(f"Text Split into {len(chunks)} chunks.", file=sys.stderr)

        # Create Vector Store
        vector_store = FAISS.from_documents(chunks, embeddings)
        
        # Save to Disk
        save_path = os.path.join(INDEX_FOLDER, index_id)
        vector_store.save_local(save_path)
        print(f"Index saved successfully to {save_path}", file=sys.stderr)

        return {"status": "success", "chunks": len(chunks), "index_id": index_id}

    except Exception as e:
        # 🔴 LOGGING THE ACTUAL ERROR
        print(f"ERROR in ingest_pdf: {str(e)}", file=sys.stderr)
        traceback.print_exc(file=sys.stderr)
        return {"error": f"Ingestion failed: {str(e)}"}

def ask_pdf(query, index_id):
    try:
        if embeddings is None:
            raise Exception("Embedding model is not initialized.")

        load_path = os.path.join(INDEX_FOLDER, index_id)
        
        if not os.path.exists(load_path):
            print(f"Error: Index path does not exist: {load_path}", file=sys.stderr)
            return {"error": "Index not found. Please re-upload the file."}

        # Load Vector Store
        vector_store = FAISS.load_local(load_path, embeddings, allow_dangerous_deserialization=True)
        
        # Retrieve Context
        docs = vector_store.similarity_search(query, k=5)
        context_text = "\n\n".join([doc.page_content for doc in docs])
        print(f"Retrieved {len(docs)} context chunks for query: {query}", file=sys.stderr)

        # Check API Key
        api_key = os.getenv("GOOGLE_API_KEY")
        if not api_key:
            print("CRITICAL: GOOGLE_API_KEY is missing from environment variables.", file=sys.stderr)
            return {"error": "Server configuration error: Missing Google API Key."}

        # Chat with Gemini
        llm = ChatGoogleGenerativeAI(
            model="gemini-1.5-flash", # Use 1.5-flash as it is the current standard/stable version
            temperature=0.3,
            google_api_key=api_key
        )
        
        prompt = f"""You are a helpful PDF assistant. Use the context below to answer the user's question accurately.
        
        Context:
        {context_text}
        
        Question: 
        {query}
        
        Answer:"""
        
        response = llm.invoke(prompt)
        return {
            "answer": response.content,
            "context": context_text,
            "relevant_chunks": len(docs)
        }

    except Exception as e:
        # 🔴 LOGGING THE ACTUAL ERROR
        print(f"ERROR in ask_pdf: {str(e)}", file=sys.stderr)
        traceback.print_exc(file=sys.stderr)
        return {"error": f"RAG Query failed: {str(e)}"}
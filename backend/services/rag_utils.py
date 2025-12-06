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

def ingest_pdf(file_path, index_id):
    try:
        print(f"🔍 DEBUG: Starting ingestion.", file=sys.stderr)
        print(f"🔍 DEBUG: Input File: {file_path}", file=sys.stderr)

        loader = PyMuPDFLoader(file_path)
        documents = loader.load()
        if not documents:
            return {"error": "PDF could not be loaded or is empty."}

        text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
        chunks = text_splitter.split_documents(documents)
        
        embeddings = get_embeddings()
        vector_store = FAISS.from_documents(chunks, embeddings)
        
        # Save to Disk
        save_path = os.path.join(INDEX_FOLDER, index_id)
        # 🔍 DEBUG: Print the exact save path
        print(f"🔍 DEBUG: Saving Index to: {save_path}", file=sys.stderr)
        
        vector_store.save_local(save_path)
        
        # Double check if it actually saved
        if os.path.exists(save_path):
             print(f"✅ DEBUG: Index folder created successfully at {save_path}", file=sys.stderr)
        else:
             print(f"❌ DEBUG: FAILED to create index folder at {save_path}", file=sys.stderr)

        return {"status": "success", "chunks": len(chunks), "index_id": index_id}

    except Exception as e:
        print(f"ERROR in ingest_pdf: {str(e)}", file=sys.stderr)
        traceback.print_exc(file=sys.stderr)
        return {"error": f"Ingestion failed: {str(e)}"}

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
            model="gemini-2.0-flash",
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
        print(f"ERROR in ask_pdf: {str(e)}", file=sys.stderr)
        traceback.print_exc(file=sys.stderr)
        return {"error": f"RAG Query failed: {str(e)}"}
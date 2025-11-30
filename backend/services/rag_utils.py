import os
from langchain_community.document_loaders import PyMuPDFLoader
# ✅ FIX: Use the correct import for newer LangChain versions
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
# ✅ NEW: Import Google Gemini
from langchain_google_genai import ChatGoogleGenerativeAI

# 1. SETUP: Define where to store the vector indices
INDEX_FOLDER = os.path.join(os.path.dirname(__file__), "../uploads/indices")
os.makedirs(INDEX_FOLDER, exist_ok=True)

# 2. EMBEDDING MODEL (Kept local for speed/free cost)
embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")

def ingest_pdf(file_path, index_id):
    try:
        # Load PDF
        loader = PyMuPDFLoader(file_path)
        documents = loader.load()

        # Split Text (Chunks)
        text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
        chunks = text_splitter.split_documents(documents)

        # Create Vector Store
        vector_store = FAISS.from_documents(chunks, embeddings)

        # Save to Disk
        save_path = os.path.join(INDEX_FOLDER, index_id)
        vector_store.save_local(save_path)

        return {"status": "success", "chunks": len(chunks), "index_id": index_id}
    except Exception as e:
        return {"error": str(e)}

def ask_pdf(query, index_id):
    try:
        load_path = os.path.join(INDEX_FOLDER, index_id)
        
        if not os.path.exists(load_path):
            return {"error": "Index not found. Please re-upload the file."}

        # Load Vector Store
        vector_store = FAISS.load_local(load_path, embeddings, allow_dangerous_deserialization=True)
        
        # Retrieve Context (Top 5 relevant chunks)
        docs = vector_store.similarity_search(query, k=5)
        context_text = "\n\n".join([doc.page_content for doc in docs])

        # ✅ NEW: Use Gemini to answer
        # Ensure you have set GOOGLE_API_KEY in your environment or pass it here
        llm = ChatGoogleGenerativeAI(
            model="gemini-2.5-flash", # 'flash' is faster/free-er, 'pro' is smarter
            temperature=0.3,
            google_api_key=os.getenv("GOOGLE_API_KEY") # <--- REPLACE OR USE ENV VAR
        )
        
        # Construct the Prompt
        prompt = f"""You are a helpful PDF assistant. Use the context below to answer the user's question accurately.
        If the answer is not in the context, say you don't know.
        
        Context:
        {context_text}
        
        Question: 
        {query}
        
        Answer:"""
        
        # Generate Answer
        response = llm.invoke(prompt)
        
        return {
            "answer": response.content,
            "context": context_text, # Optional: Send back context if you want to show "Sources"
            "relevant_chunks": len(docs)
        }

    except Exception as e:
        return {"error": str(e)}
import os
import google.generativeai as genai
from dotenv import load_dotenv

# Load .env variables
load_dotenv()

api_key = os.getenv("GOOGLE_API_KEY")

if not api_key:
    print("❌ Error: GOOGLE_API_KEY not found in .env file")
else:
    print(f"✅ Found API Key: {api_key[:5]}...*****")
    genai.configure(api_key=api_key)

    print("\n🔍 Listing Available Models...")
    try:
        count = 0
        for m in genai.list_models():
            if 'generateContent' in m.supported_generation_methods:
                print(f" - {m.name}")
                count += 1
        
        if count == 0:
            print("\n❌ No models found. Your API Key might be invalid or restricted.")
        else:
            print(f"\n✅ Found {count} chat models.")
            
    except Exception as e:
        print(f"\n❌ API Error: {e}")
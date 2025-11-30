from deep_translator import GoogleTranslator

def test():
    print("--- DIAGNOSTIC TEST ---")
    text = "Hello world. This is a test."
    target = "hi" # Hindi

    print(f"Attempting to translate: '{text}' -> '{target}'")

    try:
        # 1. Try Google Translator
        translator = GoogleTranslator(source='auto', target=target)
        res = translator.translate(text)
        
        if res == text:
            print("❌ FAILED: Translator returned original text (Soft Failure).")
        else:
            print(f"✅ SUCCESS: Result: {res}")

    except Exception as e:
        print(f"❌ CRITICAL ERROR: {type(e).__name__}: {e}")

if __name__ == "__main__":
    test()
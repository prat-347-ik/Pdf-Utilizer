from gtts import gTTS
import os

def text_to_speech(text, output_path, lang='en'):
    """
    Converts text to speech and saves it as an audio file.
    """
    try:
        if not text or not text.strip():
            raise Exception("No text content found to convert.")

        # Slow=False means normal speed
        tts = gTTS(text=text, lang=lang, slow=False)
        tts.save(output_path)
        return output_path
    
    except Exception as e:
        raise Exception(f"TTS Generation failed: {str(e)}")
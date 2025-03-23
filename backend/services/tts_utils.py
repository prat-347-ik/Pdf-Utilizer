from gtts import gTTS
import os

def text_to_speech(text, output_path):
    """
    Converts text to speech and saves it as an audio file.
    :param text: The input text to convert to speech
    :param output_path: The path where the audio file will be saved
    :return: Path to the generated audio file
    """
    try:
        tts = gTTS(text=text, lang='en', slow=False)
        tts.save(output_path)
        return output_path
    except Exception as e:
        print(f"Error generating speech: {str(e)}")
        return None

if __name__ == "__main__":
    sample_text = "Hello, this is a test for text-to-speech conversion."
    output_file = "sample_audio.mp3"
    output = text_to_speech(sample_text, output_file)
    
    if output:
        print(f"Audio file saved: {output}")
    else:
        print("Failed to generate audio.")
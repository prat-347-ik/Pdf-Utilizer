import speech_recognition as sr
from pydub import AudioSegment
import os

def convert_to_wav(audio_path):
    """
    Converts any given audio format to WAV for compatibility with SpeechRecognition.
    :param audio_path: Path to the input audio file.
    :return: Path to the converted WAV file.
    """
    wav_path = os.path.splitext(audio_path)[0] + ".wav"
    
    try:
        audio = AudioSegment.from_file(audio_path)
        audio.export(wav_path, format="wav")
        return wav_path
    except Exception as e:
        raise RuntimeError(f"Failed to convert audio file: {e}")

def speech_to_text(audio_path):
    """
    Converts speech from an audio file to text.
    :param audio_path: Path to the audio file.
    :return: Transcribed text and confidence score (if available).
    """
    recognizer = sr.Recognizer()

    # Convert to WAV format if necessary
    if not audio_path.endswith(".wav"):
        try:
            audio_path = convert_to_wav(audio_path)
        except RuntimeError as e:
            return str(e), 0.0

    try:
        with sr.AudioFile(audio_path) as source:
            audio_data = recognizer.record(source)  # Read entire audio file
            text = recognizer.recognize_google(audio_data)  # Use Google Web Speech API
            return text, 1.0  # Google API does not return confidence score
    except sr.UnknownValueError:
        return "Could not understand the audio", 0.0
    except sr.RequestError as e:
        return f"API request error: {e}", 0.0

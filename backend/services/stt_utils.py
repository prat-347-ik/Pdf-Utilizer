import speech_recognition as sr

def speech_to_text(audio_file):
    """
    Convert speech from an audio file to text.
    """
    recognizer = sr.Recognizer()

    with sr.AudioFile(audio_file) as source:
        audio_data = recognizer.record(source)

    return recognizer.recognize_google(audio_data)

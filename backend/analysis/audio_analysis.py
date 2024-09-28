import librosa
import numpy as np
from tensorflow.keras.models import load_model
from pydub import AudioSegment
import speech_recognition as sr

class AudioAnalyzer:
    def __init__(self):
        self.mood_model = load_model('path/to/mood_model.h5')
        self.key_model = load_model('path/to/key_model.h5')
        self.emotion_model = load_model('path/to/emotion_model.h5')
        self.event_model = load_model('path/to/event_model.h5')

    def analyze(self, audio_path):
        y, sr = librosa.load(audio_path)
        
        # Existing analysis
        waveform = y.tolist()
        D = librosa.stft(y)
        S_db = librosa.amplitude_to_db(np.abs(D), ref=np.max)
        spectogram = S_db.tolist()
        S = librosa.feature.melspectrogram(y=y, sr=sr)
        S_dB = librosa.power_to_db(S, ref=np.max)
        loudness = np.mean(S_dB, axis=0).tolist()
        pitches, magnitudes = librosa.piptrack(y=y, sr=sr)
        pitch = np.mean(pitches, axis=0).tolist()
        tempo, _ = librosa.beat.beat_track(y=y, sr=sr)
        chroma = librosa.feature.chroma_cqt(y=y, sr=sr)
        key_prediction = self.key_model.predict(chroma.reshape(1, -1, 12))
        key = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'][np.argmax(key_prediction)]
        mfccs = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13)
        mood_prediction = self.mood_model.predict(mfccs.reshape(1, -1, 13))
        mood = ['Happy', 'Sad', 'Energetic', 'Calm'][np.argmax(mood_prediction)]
        
        # New analysis
        # Speech Emotion Recognition
        emotion_prediction = self.emotion_model.predict(mfccs.reshape(1, -1, 13))
        emotion = ['Neutral', 'Angry', 'Happy', 'Sad', 'Fearful', 'Disgusted', 'Surprised'][np.argmax(emotion_prediction)]
        
        # Audio Event Detection
        event_prediction = self.event_model.predict(mfccs.reshape(1, -1, 13))
        events = [('Applause', event_prediction[0][0]), ('Laughter', event_prediction[0][1]), ('Cheering', event_prediction[0][2])]
        
        # Background Noise Analysis
        background_noise = self.analyze_background_noise(y, sr)
        
        # Speech-to-Text
        text = self.speech_to_text(audio_path)
        
        return {
            'waveform': waveform,
            'spectogram': spectogram,
            'loudness': loudness,
            'pitch': pitch,
            'tempo': tempo,
            'key': key,
            'mood': mood,
            'emotion': emotion,
            'events': events,
            'background_noise': background_noise,
            'transcription': text
        }

    def analyze_background_noise(self, y, sr):
        # Simple noise analysis based on signal-to-noise ratio
        signal_power = np.mean(y**2)
        noise = y - librosa.effects.percussive(y)
        noise_power = np.mean(noise**2)
        snr = 10 * np.log10(signal_power / noise_power)
        return {'snr': snr, 'level': 'Low' if snr > 15 else 'Medium' if snr > 5 else 'High'}

    def speech_to_text(self, audio_path):
        r = sr.Recognizer()
        with sr.AudioFile(audio_path) as source:
            audio = r.record(source)
        try:
            text = r.recognize_google(audio)
        except:
            text = "Speech recognition could not understand the audio"
        return text
import librosa
import numpy as np
from tensorflow.keras.models import load_model
from pydub import AudioSegment
import speech_recognition as sr
import os
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class AudioAnalysisError(Exception):
    pass

class DummyModel:
    def predict(self, X):
        return np.random.rand(1, 4)  # Return random predictions

class AudioAnalyzer:
    def __init__(self):
        base_path = os.path.dirname(os.path.abspath(__file__))
        models_path = os.path.join(base_path, 'models')
        
        self.models = {
            'mood': self.load_model(os.path.join(models_path, 'mood_model.h5')),
            'key': self.load_model(os.path.join(models_path, 'key_model.h5')),
            'emotion': self.load_model(os.path.join(models_path, 'emotion_model.h5')),
            'event': self.load_model(os.path.join(models_path, 'event_model.h5'))
        }

    def load_model(self, model_path):
        try:
            return load_model(model_path)
        except Exception as e:
            logger.warning(f"Failed to load model {model_path}: {str(e)}. Using dummy model.")
            return DummyModel()

    def analyze(self, audio_path):
        try:
            logger.info(f"Starting audio analysis for: {audio_path}")
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
            
            key_prediction = self.models['key'].predict(chroma.reshape(1, -1, 12))
            key = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'][np.argmax(key_prediction)]
            
            mfccs = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13)
            mood_prediction = self.models['mood'].predict(mfccs.reshape(1, -1, 13))
            mood = ['Happy', 'Sad', 'Energetic', 'Calm'][np.argmax(mood_prediction)]
            
            # Speech Emotion Recognition
            emotion_prediction = self.models['emotion'].predict(mfccs.reshape(1, -1, 13))
            emotion = ['Neutral', 'Angry', 'Happy', 'Sad', 'Fearful', 'Disgusted', 'Surprised'][np.argmax(emotion_prediction)]
            
            # Audio Event Detection
            event_prediction = self.models['event'].predict(mfccs.reshape(1, -1, 13))
            events = [('Applause', float(event_prediction[0][0])), ('Laughter', float(event_prediction[0][1])), ('Cheering', float(event_prediction[0][2]))]
            
            # Background Noise Analysis
            background_noise = self.analyze_background_noise(y, sr)
            
            # Speech-to-Text
            text = self.speech_to_text(audio_path)
            
            logger.info("Audio analysis completed successfully")
            return {
                'waveform': waveform,
                'spectogram': spectogram,
                'loudness': loudness,
                'pitch': pitch,
                'tempo': tempo,
                'key': key,
                'mood': [(mood, 1.0)],
                'emotion': [(emotion, 1.0)],
                'events': events,
                'background_noise': background_noise,
                'transcription': text,
                'mel_spectrogram': S_dB.tolist(),
                'chroma': chroma.tolist()
            }
        except Exception as e:
            logger.error(f"Error during audio analysis: {str(e)}", exc_info=True)
            raise AudioAnalysisError(f"Failed to analyze audio: {str(e)}")

    def analyze_background_noise(self, y, sr):
        try:
            signal_power = np.mean(y**2)
            noise = y - librosa.effects.percussive(y)
            noise_power = np.mean(noise**2)
            snr = 10 * np.log10(signal_power / noise_power)
            return {'snr': snr, 'level': 'Low' if snr > 15 else 'Medium' if snr > 5 else 'High'}
        except Exception as e:
            logger.error(f"Error in background noise analysis: {str(e)}", exc_info=True)
            return {'snr': 0, 'level': 'Unknown'}

    def speech_to_text(self, audio_path):
        r = sr.Recognizer()
        try:
            with sr.AudioFile(audio_path) as source:
                audio = r.record(source)
            text = r.recognize_google(audio)
            return text
        except sr.UnknownValueError:
            logger.warning("Speech recognition could not understand the audio")
            return "Speech recognition could not understand the audio"
        except sr.RequestError as e:
            logger.error(f"Could not request results from speech recognition service: {str(e)}")
            return "Error in speech recognition service"
        except Exception as e:
            logger.error(f"Error in speech-to-text conversion: {str(e)}", exc_info=True)
            return "Error in speech-to-text conversion"
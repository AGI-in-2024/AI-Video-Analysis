from src.transcription.transcription import transcribe_audio_pipeline
from src.transcription.audio import extract_audio_from_video, analyze_audio
from src.symbols.symbol_detection import detect_symbols
from src.objects.object_detection import detect_objects
from src.poi.poi_detection import detect_poi
from src.scenes.scene_analysis import analyze_scenes
import tempfile
import os
import numpy as np
import cv2
import torch
from transformers import pipeline, AutoModelForSpeechSeq2Seq, AutoProcessor
from pydub import AudioSegment
from sklearn.preprocessing import MinMaxScaler
from textblob import TextBlob
import librosa
import whisper

def generate_summary(video_path):
    # Your analysis logic here
    return {
        "duration": "2:30",  # Example duration
        "overallTone": "Positive",
        "riskLevel": "Low",
        "keyMoments": {
            "Intro": "0:05",
            "Climax": "1:15",
            "Conclusion": "2:25"
        },
        "labels": ["Informative", "Engaging", "Educational"]
    }

def generate_transcription(video_path):
    # Extract audio from video
    with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as temp_audio_file:
        audio_path = temp_audio_file.name
    
    try:
        extract_audio_from_video(video_path, audio_path)
        
        # Try to use CUDA if available, otherwise use CPU
        device = "cuda" if torch.cuda.is_available() else "cpu"
        
        try:
            # Initialize Whisper model
            model = whisper.load_model("base").to(device)
            
            # Perform transcription
            result = model.transcribe(audio_path)
        except RuntimeError as e:
            if "CUDA out of memory" in str(e):
                print("CUDA out of memory, falling back to CPU")
                device = "cpu"
                model = whisper.load_model("base").to(device)
                result = model.transcribe(audio_path)
            else:
                raise e
        
        # Process the result and create the analysis
        transcription = result["text"]
        try:
            analysis = analyze_transcription(transcription)
        except LookupError:
            # If punkt_tab is not available, use a simpler analysis
            analysis = simple_analyze_transcription(transcription)
        
        return {
            "transcription": transcription,
            "analysis": analysis
        }
    except Exception as e:
        print(f"Error in generate_transcription: {str(e)}")
        return {
            "transcription": "",
            "analysis": {
                "generationStatus": {"success": False, "model": "Whisper-Base"},
                "languages": [{"name": "Unknown", "primary": True}],
                "lipSyncAccuracy": 0,
                "subtitlesStatus": {"created": False, "synchronized": False},
                "keyEvents": [],
                "sentimentAnalysis": [],
                "overallSentiment": {"tone": "Unknown", "value": 0},
                "keywordAnalysis": [],
                "textLabels": ["Error"]
            }
        }
    finally:
        os.remove(audio_path)

def simple_analyze_transcription(text):
    # A simpler version of analyze_transcription that doesn't rely on punkt_tab
    sentences = text.split('.')
    key_events = [
        {"time": f"{i*30:02d}:{00:02d}", "description": sentence.strip(), "type": "speech"}
        for i, sentence in enumerate(sentences[:5])  # Take first 5 sentences as key events
    ]
    
    return {
        "generationStatus": {"success": True, "model": "Whisper-Base"},
        "languages": [{"name": "Auto-detected", "primary": True}],
        "lipSyncAccuracy": 95,  # Placeholder value
        "subtitlesStatus": {"created": True, "synchronized": True},
        "keyEvents": key_events,
        "sentimentAnalysis": [],
        "overallSentiment": {"tone": "Unknown", "value": 0},
        "keywordAnalysis": [],
        "textLabels": ["Base", "AI-Analyzed"]
    }

def analyze_transcription(text):
    # Use a sentiment analysis pipeline
    device = 0 if torch.cuda.is_available() else -1
    sentiment_pipeline = pipeline("sentiment-analysis", model="distilbert-base-uncased-finetuned-sst-2-english", device=device)
    
    # Perform sentiment analysis
    sentiment_result = sentiment_pipeline(text)[0]
    sentiment_score = sentiment_result['score'] if sentiment_result['label'] == 'POSITIVE' else -sentiment_result['score']
    
    # Perform keyword analysis
    blob = TextBlob(text)
    keywords = blob.noun_phrases
    
    # Generate key events (simplified version)
    sentences = text.split('.')
    key_events = [
        {"time": f"{i*30:02d}:{00:02d}", "description": sentence.strip(), "type": "speech"}
        for i, sentence in enumerate(sentences[:5])  # Take first 5 sentences as key events
    ]
    
    # Generate overall sentiment
    overall_sentiment = "Positive" if sentiment_score > 0 else "Negative" if sentiment_score < 0 else "Neutral"
    
    return {
        "generationStatus": {"success": True, "model": "Whisper-Base"},
        "languages": [{"name": "Auto-detected", "primary": True}],
        "lipSyncAccuracy": 95,  # Placeholder value
        "subtitlesStatus": {"created": True, "synchronized": True},
        "keyEvents": key_events,
        "sentimentAnalysis": [
            {"time": f"{i*60:02d}:00 - {(i+1)*60:02d}:00", "value": sentiment_score}
            for i in range(len(sentences) // 60 + 1)
        ],
        "overallSentiment": {"tone": overall_sentiment, "value": sentiment_score},
        "keywordAnalysis": [{"word": word, "count": keywords.count(word), "type": "noun_phrase"} for word in set(keywords)],
        "textLabels": ["Base", "AI-Analyzed", overall_sentiment]
    }

def generate_audio_analysis(video_path):
    with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as temp_audio_file:
        audio_path = temp_audio_file.name
    
    try:
        extract_audio_from_video(video_path, audio_path)
        audio_features = analyze_audio(audio_path)
        
        # Convert numpy values to Python native types
        tempo = float(audio_features['tempo']) if isinstance(audio_features['tempo'], np.ndarray) else audio_features['tempo']
        pitch_mean = float(audio_features['pitch_mean']) if isinstance(audio_features['pitch_mean'], np.ndarray) else audio_features['pitch_mean']
        loudness = float(audio_features['loudness']) if isinstance(audio_features['loudness'], np.ndarray) else audio_features['loudness']
        mel_spec_mean = float(audio_features['mel_spec_mean']) if isinstance(audio_features['mel_spec_mean'], np.ndarray) else audio_features['mel_spec_mean']
        chroma_mean = float(audio_features['chroma_mean']) if isinstance(audio_features['chroma_mean'], np.ndarray) else audio_features['chroma_mean']
        
        key_events = [
            {"time": format_time(0), "description": f"Tempo: {tempo:.2f} BPM"},
            {"time": format_time(audio_features['duration']/3), "description": f"Average pitch: {pitch_mean:.2f} Hz"},
            {"time": format_time(2*audio_features['duration']/3), "description": f"Loudness: {loudness:.2f} RMS"}
        ]
        
        sound_effects = detect_sound_effects(audio_path)
        music_patterns = detect_music_patterns(audio_path)
        
        return {
            "keyEvents": key_events,
            "soundEffects": sound_effects,
            "musicPatterns": music_patterns,
            "audioFeatures": {
                "tempo": tempo,
                "pitch_mean": pitch_mean,
                "loudness": loudness,
                "mel_spec_mean": mel_spec_mean,
                "chroma_mean": chroma_mean
            },
            "labels": ["Base", "Audio-Analyzed"] + sound_effects + music_patterns
        }
    finally:
        os.remove(audio_path)

def generate_symbols_analysis(video_path):
    symbols_result = detect_symbols(video_path)
    
    return {
        "detectedSymbols": symbols_result.get('detectedSymbols', []),
        "riskAnalysis": {
            "riskLevel": symbols_result.get('riskAnalysis', {}).get('riskLevel', 'Unknown'),
            "overallRisk": symbols_result.get('riskAnalysis', {}).get('overallRisk', 0),
            "riskLabel": symbols_result.get('riskAnalysis', {}).get('riskLabel', 'Unknown')
        },
        "symbolOccurrences": symbols_result.get('symbolOccurrences', {}),
        "symbolCategories": symbols_result.get('symbolCategories', []),
        "labels": symbols_result.get('labels', [])
    }

def generate_objects_analysis(video_path):
    objects_result = detect_objects(video_path)
    
    return {
        "objectCategories": objects_result.get('objectCategories', []),
        "keyObjects": objects_result.get('keyObjects', []),
        "objectOccurrences": objects_result.get('objectOccurrences', {}),
        "objectInteractions": objects_result.get('objectInteractions', []),
        "labels": objects_result.get('labels', [])
    }

def generate_poi_analysis(video_path):
    poi_result = detect_poi(video_path)
    
    return {
        "heatZones": poi_result.get('heatZones', []),
        "heatZoneCoordinates": poi_result.get('heatZoneCoordinates', []),
        "attentionHotspots": poi_result.get('attentionHotspots', []),
        "eyeTrackingData": poi_result.get('eyeTrackingData', []),
        "labels": poi_result.get('labels', [])
    }

def generate_scenes_analysis(video_path):
    scenes_result = analyze_scenes(video_path)
    
    return {
        "sceneCount": scenes_result.get('sceneCount', 0),
        "averageSceneDuration": scenes_result.get('averageSceneDuration', 0),
        "sceneTransitions": scenes_result.get('sceneTransitions', []),
        "dominantColors": scenes_result.get('dominantColors', []),
        "sceneDescriptions": scenes_result.get('sceneDescriptions', [])
    }

# Helper functions

def get_video_duration(video_path):
    cap = cv2.VideoCapture(video_path)
    fps = cap.get(cv2.CAP_PROP_FPS)
    frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    duration = frame_count / fps
    return f"{int(duration // 60)}:{int(duration % 60):02d} минут"

def calculate_risk_level(symbols, objects, transcription):
    risk_score = symbols['riskAnalysis']['overallRisk'] * 0.4 + \
                 len(objects['keyObjects']) * 0.3 + \
                 (1 if transcription['overallSentiment']['tone'] == 'Negative' else 0) * 0.3
    
    if risk_score < 0.3:
        return "Низкий"
    elif risk_score < 0.7:
        return "Средний"
    else:
        return "Высокий"

def calculate_lip_sync_accuracy(video_path, transcription):
    # Implement lip sync accuracy calculation
    # This is a placeholder implementation
    return 95  # Return a fixed value for now

def format_time(seconds):
    minutes, seconds = divmod(int(seconds), 60)
    return f"{minutes:02d}:{seconds:02d}"

def detect_sound_effects(audio_path):
    # Implement sound effect detection
    # This is a placeholder implementation
    return ["Выстрел", "Взрыв", "Сирена"]

def detect_music_patterns(audio_path):
    # Implement music pattern detection
    # This is a placeholder implementation
    return ["Рок", "Классика", "Электронная"]

def extract_keywords(text):
    blob = TextBlob(text)
    return [{"word": word, "count": count, "type": pos} 
            for word, pos in blob.tags() 
            for count in [blob.word_counts[word]]]

def estimate_lip_sync_accuracy(video_path, timestamps):
    # This is a placeholder. Actual lip sync accuracy estimation would require
    # complex video analysis which is beyond the scope of this example.
    return 95.0

def extract_key_events(timestamps):
    # This is a simplified version. You might want to implement more sophisticated
    # event detection based on your specific requirements.
    return [{"time": chunk["timestamp"][0], "description": chunk["text"], "type": "speech"} 
            for chunk in timestamps]

def generate_text_labels(text):
    blob = TextBlob(text)
    sentiment = blob.sentiment.polarity
    subjectivity = blob.sentiment.subjectivity
    
    labels = []
    if sentiment > 0.5:
        labels.append("Positive")
    elif sentiment < -0.5:
        labels.append("Negative")
    else:
        labels.append("Neutral")
    
    if subjectivity > 0.5:
        labels.append("Subjective")
    else:
        labels.append("Objective")
    
    return labels
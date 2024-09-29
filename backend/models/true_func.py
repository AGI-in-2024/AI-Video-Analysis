from src.transcription.transcription import transcribe_audio_pipeline
from src.transcription.audio import extract_audio_from_video, analyze_audio
from src.symbols.symbol_detection import detect_symbols
from src.objects.object_detection import detect_objects
from src.poi.poi_detection import detect_poi, preprocess_frame, find_heat_zones, find_attention_hotspots, generate_eye_tracking_data
from src.scenes.complex_scene_analysis import analyze_complex_scenes
from src.scenes.scene_analysis import analyze_scenes as analyze_simple_scenes
from src.detection.detection import detect_yolo10
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
from torchvision.models.detection import fasterrcnn_resnet50_fpn_v2, FasterRCNN_ResNet50_FPN_V2_Weights, ssd300_vgg16, SSD300_VGG16_Weights
from torchvision.transforms import functional as F
from collections import defaultdict
from tqdm import tqdm
import logging
import io
from torchvision.models import resnet50, ResNet50_Weights
from scipy.ndimage import gaussian_filter
from sklearn.cluster import KMeans
from src.audio.audio_analysis import AudioAnalyzer, AudioAnalysisError
from src.objects.object_detection import ObjectDetector
from src.symbols.symbol_detection import SymbolDetector
from src.detection.detection import detect_yolo10
import cv2
import numpy as np
import tempfile
import os
import torch
from collections import defaultdict
import av
from scenedetect import detect, AdaptiveDetector, VideoManager, SceneManager
from scenedetect.detectors import ContentDetector, ThresholdDetector, HistogramDetector, HashDetector
from collections import Counter
import base64

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

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
    audio_analyzer = AudioAnalyzer()
    
    # Extract audio from video
    with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as temp_audio_file:
        audio_path = temp_audio_file.name
    
    try:
        logger.info(f"Extracting audio from video: {video_path}")
        extract_audio_from_video(video_path, audio_path)
        
        logger.info(f"Analyzing audio: {audio_path}")
        results = audio_analyzer.analyze(audio_path)
        
        # Process the results
        timeline = []
        for i, (tempo, pitch, loudness) in enumerate(zip(
            results.get('tempo', []),
            results.get('pitch', []),
            results.get('loudness', [])
        )):
            time = format_time(i * 5)  # Assuming 5-second intervals
            timeline.append(f"{time}: Tempo: {tempo:.2f} BPM, Pitch: {pitch:.2f} Hz, Loudness: {loudness:.2f} RMS")
        
        # Handle mood results more flexibly
        music_patterns = []
        if isinstance(results.get('mood'), list):
            music_patterns = [f"{genre}: {confidence:.2f}" for genre, confidence in results['mood']]
        elif isinstance(results.get('mood'), str):
            music_patterns = [results['mood']]
        
        logger.info("Audio analysis completed successfully")
        return {
            "timeline": timeline,
            "soundEffects": results.get('events', []),
            "musicPatterns": music_patterns,
            "audioFeatures": {
                "Tempo": np.mean(results.get('tempo', [0])),
                "Pitch Mean": np.mean(results.get('pitch', [0])),
                "Loudness": np.mean(results.get('loudness', [0])),
                "Mel Spectrogram Mean": np.mean(results.get('mel_spectrogram', [0])),
                "Chroma Mean": np.mean(results.get('chroma', [0])),
            },
            "emotionAnalysis": results.get('emotion', []),
            "backgroundNoise": results.get('background_noise', {}),
            "transcription": results.get('transcription', '')
        }
    except AudioAnalysisError as e:
        logger.error(f"Audio analysis failed: {str(e)}")
        return {
            "error": str(e),
            "timeline": [],
            "soundEffects": [],
            "musicPatterns": [],
            "audioFeatures": {},
            "emotionAnalysis": [],
            "backgroundNoise": {},
            "transcription": ""
        }
    except Exception as e:
        logger.error(f"Unexpected error in audio analysis: {str(e)}", exc_info=True)
        return {
            "error": "An unexpected error occurred during audio analysis",
            "timeline": [],
            "soundEffects": [],
            "musicPatterns": [],
            "audioFeatures": {},
            "emotionAnalysis": [],
            "backgroundNoise": {},
            "transcription": ""
        }
    finally:
        logger.info(f"Cleaning up temporary audio file: {audio_path}")
        os.remove(audio_path)

def generate_objects_analysis(video_path):
    logger.info(f"Starting object analysis for video: {video_path}")
    object_detector = ObjectDetector()
    try:
        results = object_detector.detect_objects(video_path)
        logger.info(f"Object analysis completed successfully. Detected {len(results)} objects.")
        return results
    except Exception as e:
        logger.error(f"Error during object analysis: {str(e)}")
        return []

def generate_symbols_analysis(video_path):
    symbol_detector = SymbolDetector()
    try:
        results = symbol_detector.detect_symbols(video_path)
    except Exception as e:
        logging.error(f"Error in symbol detection: {str(e)}")
        results = {'detectedSymbols': []}

    # Process the results
    detected_symbols = [
        {
            'symbol': symbol['symbol'],
            'confidence': symbol['confidence'],
            'time': format_time(symbol['time']),
            'location': f"({symbol['x']:.0f}, {symbol['y']:.0f})"
        }
        for symbol in results['detectedSymbols']
    ]
    
    symbol_occurrences = defaultdict(int)
    for symbol in detected_symbols:
        symbol_occurrences[symbol['symbol']] += 1
    
    risk_analysis = analyze_symbol_risk(detected_symbols)
    
    return {
        "detectedSymbols": detected_symbols,
        "riskAnalysis": risk_analysis,
        "symbolOccurrences": dict(symbol_occurrences),
        "symbolCategories": list(set(symbol['category'] for symbol in results['detectedSymbols'] if 'category' in symbol)),
        "labels": ["Symbol-Detected", "AI-Analyzed", risk_analysis['riskLabel']]
    }

def analyze_symbol_risk(detected_symbols):
    risk_symbols = {
        'high': ['warning', 'danger', 'prohibited'],
        'medium': ['caution', 'yield', 'restricted'],
        'low': ['information', 'regulatory', 'mandatory']
    }
    
    risk_scores = []
    for symbol in detected_symbols:
        if any(risk_word in symbol['symbol'].lower() for risk_word in risk_symbols['high']):
            risk_scores.append(1.0)
        elif any(risk_word in symbol['symbol'].lower() for risk_word in risk_symbols['medium']):
            risk_scores.append(0.5)
        elif any(risk_word in symbol['symbol'].lower() for risk_word in risk_symbols['low']):
            risk_scores.append(0.2)
        else:
            risk_scores.append(0.1)
    
    overall_risk = np.mean(risk_scores)
    
    if overall_risk > 0.7:
        risk_level = "Высокий"
        risk_label = "Опасный"
    elif overall_risk > 0.4:
        risk_level = "Средний"
        risk_label = "Требует внимания"
    else:
        risk_level = "Низкий"
        risk_label = "Безопасный"
    
    return {
        "riskLevel": risk_level,
        "overallRisk": float(overall_risk),
        "riskLabel": risk_label
    }

def generate_yolo_analysis(video_path):
    # Read video file as binary
    with open(video_path, 'rb') as video_file:
        video_binary = video_file.read()
    
    # Perform YOLO detection
    detections = detect_yolo10(video_binary, frequency=30)  # Detect every 30 frames
    
    # Process detections
    object_categories = set()
    object_occurrences = defaultdict(int)
    key_objects = []
    
    for frame, frame_detections in detections.items():
        for detection in frame_detections:
            object_categories.add(detection['class'])
            object_occurrences[detection['class']] += 1
            
            if detection['confidence'] > 0.8:  # High confidence detections
                key_objects.append({
                    'time': format_time(frame / 30),  # Assuming 30 fps
                    'description': f"{detection['class']} at ({detection['coordinates'][0]:.0f}, {detection['coordinates'][1]:.0f})"
                })
    
    return {
        "objectCategories": list(object_categories),
        "keyObjects": key_objects,
        "objectOccurrences": dict(object_occurrences),
        "labels": ["YOLO-Detected", "AI-Analyzed"] + list(object_categories)
    }

def generate_poi_analysis(video_path):
    logging.info("Starting POI analysis")
    
    # Initialize the device
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    logging.info(f"Using device: {device}")

    # Load pre-trained ResNet50 model
    model = resnet50(weights=ResNet50_Weights.DEFAULT).to(device)
    model.eval()

    # Open the video file
    cap = cv2.VideoCapture(video_path)
    
    if not cap.isOpened():
        logging.error("Error opening video file")
        return {
            "heatZones": [],
            "heatZoneCoordinates": [],
            "attentionHotspots": [],
            "eyeTrackingData": [],
            "labels": ["Error: Unable to process video"]
        }

    # Get video properties
    frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    fps = int(cap.get(cv2.CAP_PROP_FPS))
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

    # Initialize heatmap
    heatmap = np.zeros((height, width), dtype=np.float32)

    # Process every 30th frame (adjust as needed)
    frame_interval = 30

    for frame_number in range(0, frame_count, frame_interval):
        cap.set(cv2.CAP_PROP_POS_FRAMES, frame_number)
        ret, frame = cap.read()
        
        if not ret:
            break

        # Preprocess the frame
        input_tensor = preprocess_frame(frame).unsqueeze(0).to(device)

        # Get feature map
        with torch.no_grad():
            features = model.conv1(input_tensor)
            features = model.bn1(features)
            features = model.relu(features)
            features = model.maxpool(features)
            features = model.layer1(features)
            features = model.layer2(features)
            features = model.layer3(features)
            features = model.layer4(features)

        # Convert feature map to heatmap
        feature_map = features.squeeze().sum(dim=0).cpu().numpy()
        feature_map = cv2.resize(feature_map, (width, height))
        heatmap += feature_map

    cap.release()

    # Normalize and smooth the heatmap
    heatmap = cv2.normalize(heatmap, None, 0, 255, cv2.NORM_MINMAX)
    heatmap = gaussian_filter(heatmap, sigma=5)

    # Use the detect_poi function from poi_detection.py
    poi_results = detect_poi(video_path, heatmap, frame_count, fps)

    # Generate the analysis
    analysis = generate_poi_analysis_text(poi_results)

    # Combine the results
    combined_results = {
        **poi_results,
        "analysis": analysis,
        "labels": poi_results["labels"] + ["Тепловые зоны", "Горячие точки", "Разметка POI"]
    }

    return combined_results

def generate_poi_analysis_text(poi_results):
    analysis = {
        "heatZonesAnalysis": "Тепловые зоны внимания:\n",
        "heatZoneCoordinates": "Координаты и площадь теплоых зон:\n",
        "hotspots": "Грячие точки внимания:\n",
        "poiLabeling": "Разметка на основе точек интереса:\n"
    }

    # Heat zones analysis
    for i, zone in enumerate(poi_results["heatZones"], 1):
        analysis["heatZonesAnalysis"] += f"Зона {i}: Интенсивность: {zone['intensity']:.2f}, Размер: {zone['size']:.2f} px²\n"

    # Heat zone coordinates
    for zone in poi_results["heatZoneCoordinates"]:
        analysis["heatZoneCoordinates"] += f"Зона {zone['id']}: X: {zone['x']}, Y: {zone['y']}, Площадь: {zone['width'] * zone['height']} px²\n"

    # Hotspots
    for hotspot in poi_results["attentionHotspots"]:
        analysis["hotspots"] += f"Точка {hotspot['id']}: X: {hotspot['x']}, Y: {hotspot['y']}, Интенсивность: {hotspot['intensity']:.2f}\n"

    # POI labeling
    unique_objects = set()
    for poi in poi_results.get("objectPOIs", []):
        unique_objects.add(poi["object"])
    analysis["poiLabeling"] += f"Обнаружено {len(unique_objects)} уникальных объектов: {', '.join(unique_objects)}\n"

    return analysis

def combine_poi_and_object_results(poi_results, object_results, heatmap):
    # Enhance heat zones with object information
    for zone in poi_results["heatZones"]:
        zone_objects = get_objects_in_zone(object_results, zone, poi_results["heatZoneCoordinates"])
        zone["objects"] = zone_objects

    # Enhance attention hotspots with object information
    for hotspot in poi_results["attentionHotspots"]:
        hotspot_objects = get_objects_near_hotspot(object_results, hotspot)
        hotspot["objects"] = hotspot_objects

    # Add object-based points of interest
    object_pois = generate_object_pois(object_results, heatmap)
    poi_results["objectPOIs"] = object_pois

    # Combine labels
    combined_labels = list(set(poi_results["labels"] + object_results.get("labels", [])))

    return {
        **poi_results,
        "objectCategories": object_results.get("objectCategories", []),
        "objectOccurrences": object_results.get("objectOccurrences", {}),
        "objectInteractions": object_results.get("objectInteractions", []),
        "labels": combined_labels
    }

def get_objects_in_zone(object_results, zone, zone_coordinates):
    zone_objects = []
    zone_coord = next((coord for coord in zone_coordinates if coord["id"] == zone["id"]), None)
    if zone_coord:
        for obj in object_results.get("keyObjects", []):
            if isinstance(obj, dict) and "time" in obj and "description" in obj:
                # Assuming objects don't have coordinates, we'll just include them all
                zone_objects.append(obj)
    return zone_objects

def get_objects_near_hotspot(object_results, hotspot):
    # Since we don't have coordinates for objects, we'll just return all objects
    return object_results.get("keyObjects", [])

def generate_object_pois(object_results, heatmap):
    object_pois = []
    for i, obj in enumerate(object_results.get("keyObjects", [])):
        if isinstance(obj, dict) and "time" in obj and "description" in obj:
            # Generate random coordinates for demonstration purposes
            height, width = heatmap.shape
            x = np.random.randint(0, width)
            y = np.random.randint(0, height)
            intensity = float(heatmap[y, x])
            object_pois.append({
                "id": i + 1,
                "x": int(x),
                "y": int(y),
                "intensity": intensity,
                "object": obj["description"],
                "time": obj["time"]
            })
    return object_pois

def generate_scenes_analysis(video_path):
    complex_analysis = analyze_complex_scenes(video_path)
    simple_analysis = analyze_simple_scenes(video_path)
    
    return {
        "complex": complex_analysis,
        "simple": simple_analysis
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
import cv2
import numpy as np
from tensorflow.keras.applications.mobilenet_v2 import MobileNetV2, preprocess_input, decode_predictions
import cv2
import numpy as np
import pytesseract
from tensorflow.keras.applications.mobilenet_v2 import MobileNetV2, preprocess_input
from tensorflow.keras.applications.resnet50 import ResNet50, preprocess_input as resnet_preprocess
import tensorflow as tf
import logging

def detect_symbols(video_path):
    # Load the pre-trained MobileNetV2 model
    model = MobileNetV2(weights='imagenet')
    
    # Open the video file
    cap = cv2.VideoCapture(video_path)
    
    detected_symbols = []
    frame_count = 0
    
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break
        
        if frame_count % 30 == 0:  # Process every 30th frame
            # Preprocess the frame
            resized_frame = cv2.resize(frame, (224, 224))
            x = np.expand_dims(resized_frame, axis=0)
            x = preprocess_input(x)
            
            # Make predictions
            preds = model.predict(x)
            top_preds = decode_predictions(preds, top=1)[0]
            
            for (i, (imagenet_id, label, score)) in enumerate(top_preds):
                if score > 0.5:  # Only consider predictions with confidence > 50%
                    detected_symbols.append({
                        "time": format_time(frame_count / cap.get(cv2.CAP_PROP_FPS)),
                        "description": label
                    })
        
        frame_count += 1
    
    cap.release()
    
    # Calculate risk analysis based on detected symbols
    risk_analysis = calculate_risk_analysis(detected_symbols)
    
    return {
        "detectedSymbols": detected_symbols,
        "riskAnalysis": risk_analysis,
        "labels": ["Symbols", "AI-Analyzed"]
    }

def calculate_risk_analysis(detected_symbols):
    # Implement risk analysis based on detected symbols
    # This is a placeholder implementation
    risk_score = min(len(detected_symbols) * 0.1, 1.0)
    
    return {
        "overallRisk": risk_score,
        "riskLevel": "Низкий" if risk_score < 0.3 else "Средний" if risk_score < 0.7 else "Высокий",
        "riskLabel": "Безопасный" if risk_score < 0.3 else "Потенциально опасный" if risk_score < 0.7 else "Опасный"
    }

def format_time(seconds):
    minutes, seconds = divmod(int(seconds), 60)
    return f"{minutes:02d}:{seconds:02d}"




class SymbolDetector:
    def __init__(self):
        self.feature_extractor = MobileNetV2(weights='imagenet', include_top=False, input_shape=(224, 224, 3))
        self.logo_model = ResNet50(weights='imagenet')
        self.gesture_model = None
        try:
            self.gesture_model = tf.keras.models.load_model('path/to/gesture_model.h5')
        except FileNotFoundError:
            logging.warning("Gesture model file not found. Gesture detection will be disabled.")
        except Exception as e:
            logging.error(f"Error loading gesture model: {str(e)}")

    def detect_symbols(self, video_path):
        # Implement symbol detection logic here
        # Use self.gesture_model if it's available, otherwise skip gesture detection
        
        # Placeholder implementation
        detected_symbols = [
            {
                'symbol': 'Example Symbol',
                'confidence': 0.95,
                'time': 1.5,
                'x': 100,
                'y': 200,
                'category': 'Example Category'
            }
        ]
        
        return {
            'detectedSymbols': detected_symbols
        }
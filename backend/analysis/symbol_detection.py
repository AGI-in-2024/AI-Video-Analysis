import cv2
import numpy as np
import pytesseract
from tensorflow.keras.applications.mobilenet_v2 import MobileNetV2, preprocess_input
from tensorflow.keras.applications.resnet50 import ResNet50, preprocess_input as resnet_preprocess
import tensorflow as tf

class SymbolDetector:
    def __init__(self):
        self.feature_extractor = MobileNetV2(weights='imagenet', include_top=False, input_shape=(224, 224, 3))
        self.logo_model = ResNet50(weights='imagenet')
        self.gesture_model = tf.keras.models.load_model('path/to/gesture_model.h5')

    def detect_symbols(self, video_path):
        cap = cv2.VideoCapture(video_path)
        fps = cap.get(cv2.CAP_PROP_FPS)
        detected_symbols = []
        detected_text = []
        detected_logos = []
        detected_gestures = []

        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break

            current_time = cap.get(cv2.CAP_PROP_POS_MSEC) / 1000.0

            # Symbol Detection
            img = cv2.resize(frame, (224, 224))
            img = preprocess_input(img)
            img = np.expand_dims(img, axis=0)
            features = self.feature_extractor.predict(img)

            # OCR for Text Detection
            text = pytesseract.image_to_string(frame, config='--psm 11')
            if text.strip():
                detected_text.append({
                    'text': text.strip(),
                    'timeAppeared': current_time,
                    'timeDuration': 1 / fps
                })

            # Logo Detection
            logo_img = resnet_preprocess(img)
            logo_preds = self.logo_model.predict(logo_img)
            logo_results = tf.keras.applications.imagenet_utils.decode_predictions(logo_preds, top=1)[0]
            if logo_results[0][2] > 0.5:  # Confidence threshold
                detected_logos.append({
                    'logo': logo_results[0][1],
                    'confidence': float(logo_results[0][2]),
                    'timeAppeared': current_time,
                    'timeDuration': 1 / fps
                })

            # Gesture Recognition
            gesture_img = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            gesture_img = cv2.resize(gesture_img, (64, 64))
            gesture_img = np.expand_dims(gesture_img, axis=[0, -1])
            gesture_pred = self.gesture_model.predict(gesture_img)
            gesture_label = ['Thumbs Up', 'Thumbs Down', 'Peace', 'Fist', 'Open Palm'][np.argmax(gesture_pred)]
            if np.max(gesture_pred) > 0.7:  # Confidence threshold
                detected_gestures.append({
                    'gesture': gesture_label,
                    'confidence': float(np.max(gesture_pred)),
                    'timeAppeared': current_time,
                    'timeDuration': 1 / fps
                })

            for symbol in text:
                if not symbol.isalnum() and symbol != ' ':
                    detected_symbols.append({
                        'symbol': symbol,
                        'confidence': 0.9,
                        'location': {
                            'x': 0.5,
                            'y': 0.5
                        },
                        'timeAppeared': current_time,
                        'timeDuration': 1 / fps
                    })

        cap.release()
        return {
            'detectedSymbols': detected_symbols,
            'detectedText': detected_text,
            'detectedLogos': detected_logos,
            'detectedGestures': detected_gestures
        }
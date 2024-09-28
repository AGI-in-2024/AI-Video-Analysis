from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from src.detection import detect_yolo10
from src.ocr import ocr_trocr_ru
from src.transcription.audio import extract_audio_from_video
from src.transcription.transcription import transcribe_audio_pipeline
from src.ai_insights import generate_ai_insights
from models.true_func import (
    generate_summary,
    generate_transcription,
    generate_audio_analysis,
    generate_symbols_analysis,
    generate_objects_analysis,
    generate_poi_analysis,
    generate_scenes_analysis
)
import tempfile
import os
import logging
import random
import string
import nltk
import ssl
from textblob import download_corpora
import cv2
import io
import numpy as np
import json  # Add this import at the top of the file with other imports
from tqdm import tqdm

def setup_nltk():
    try:
        _create_unverified_https_context = ssl._create_unverified_context
    except AttributeError:
        pass
    else:
        ssl._create_default_https_context = _create_unverified_https_context

    nltk.download('punkt')
    nltk.download('averaged_perceptron_tagger')
    nltk.download('punkt_tab')  # Add this line to download punkt_tab

    # Download whisper model
    import whisper
    try:
        whisper.load_model("base")
    except Exception as e:
        print(f"Error loading Whisper model: {str(e)}. Falling back to CPU.")

def setup_textblob():
    import nltk
    nltk.download('punkt')
    nltk.download('averaged_perceptron_tagger')
    
    # Download TextBlob corpora
    import subprocess
    import sys
    
    subprocess.check_call([sys.executable, '-m', 'textblob.download_corpora'])

app = Flask(__name__)
CORS(app)  # This enables CORS for all routes

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def ensure_serializable(obj):
    if isinstance(obj, np.generic):
        return obj.item()
    elif isinstance(obj, (list, tuple)):
        return [ensure_serializable(item) for item in obj]
    elif isinstance(obj, dict):
        return {key: ensure_serializable(value) for key, value in obj.items()}
    return obj

@app.route('/api/mock-analyze-video', methods=['POST'])
def mock_analyze_video():
    logger.info("Received mock video analysis request")
    if 'video' not in request.files:
        logger.error("No video file provided in the request")
        return jsonify({'error': 'No video file provided'}), 400
    
    video_file = request.files['video']
    analysis_settings = request.form.get('settings', '{}')
    
    logger.info(f"Received video file: {video_file.filename}")
    logger.info(f"Analysis settings: {analysis_settings}")
    
    # Create a temporary file for the video
    with tempfile.NamedTemporaryFile(delete=False, suffix='.mp4') as temp_video_file:
        video_file.save(temp_video_file.name)
        temp_video_path = temp_video_file.name
        logger.info(f"Saved video to temporary file: {temp_video_path}")
    
    try:
        # Generate mock results for all analysis types
        results = {
            "summary": generate_mock_summary(),
            "transcription": generate_mock_transcription(),
            "audio": generate_mock_audio_analysis(),
            "symbols": generate_mock_symbols_analysis(),
            "objects": generate_mock_objects_analysis(),
            "poi": generate_mock_poi_analysis(),
            "scenes": generate_mock_scenes_analysis()
        }
        
        return jsonify({'results': results})
    except Exception as e:
        logger.error(f"Error during mock video analysis: {str(e)}", exc_info=True)
        return jsonify({'error': str(e)}), 500
    finally:
        # Clean up temporary file
        logger.info("Cleaning up temporary files")
        os.remove(temp_video_path)

@app.route('/api/frame/<int:frame_number>', methods=['GET'])
def get_frame(frame_number):
    video_path = request.args.get('video_path')
    if not video_path:
        return jsonify({'error': 'Video path not provided'}), 400

    try:
        cap = cv2.VideoCapture(video_path)
        cap.set(cv2.CAP_PROP_POS_FRAMES, frame_number)
        ret, frame = cap.read()
        cap.release()

        if not ret:
            return jsonify({'error': 'Frame not found'}), 404

        _, buffer = cv2.imencode('.jpg', frame)
        return send_file(
            io.BytesIO(buffer),
            mimetype='image/jpeg'
        )
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/ai-insights', methods=['POST'])
def ai_insights():
    video_file = request.files['video']
    with tempfile.NamedTemporaryFile(delete=False, suffix='.mp4') as temp_video_file:
        video_file.save(temp_video_file.name)
        temp_video_path = temp_video_file.name

    try:
        insights = generate_ai_insights(temp_video_path)
        return jsonify({'insights': insights})
    except Exception as e:
        logger.error(f"Error generating AI insights: {str(e)}", exc_info=True)
        return jsonify({'error': str(e)}), 500
    finally:
        os.remove(temp_video_path)

@app.route('/api/analyze-video', methods=['POST'])
def analyze_video():
    logger.info("Received video analysis request")
    if 'video' not in request.files:
        logger.error("No video file provided in the request")
        return jsonify({'error': 'No video file provided'}), 400
    
    video_file = request.files['video']
    analysis_settings = json.loads(request.form.get('settings', '{}'))
    advanced_settings = json.loads(request.form.get('advanced_settings', '{}'))
    
    logger.info(f"Received video file: {video_file.filename}")
    logger.info(f"Analysis settings: {analysis_settings}")
    logger.info(f"Advanced settings: {advanced_settings}")
    
    # Create a temporary file for the video
    with tempfile.NamedTemporaryFile(delete=False, suffix='.mp4') as temp_video_file:
        video_file.save(temp_video_file.name)
        temp_video_path = temp_video_file.name
        logger.info(f"Saved video to temporary file: {temp_video_path}")
    
    try:
        results = {}
        
        if analysis_settings.get('summary', False):
            logger.info("Generating summary")
            results["summary"] = generate_summary(temp_video_path)
        
        if analysis_settings.get('transcription', False):
            logger.info("Generating transcription")
            results["transcription"] = generate_transcription(temp_video_path)
        
        if analysis_settings.get('audio_analysis', False):
            logger.info("Performing audio analysis")
            results["audio"] = generate_audio_analysis(temp_video_path)
        
        if analysis_settings.get('symbol_detection', False):
            logger.info("Performing symbol detection")
            results["symbols"] = generate_symbols_analysis(temp_video_path)
        
        if analysis_settings.get('object_detection', False):
            logger.info("Performing object detection")
            results["objects"] = generate_objects_analysis(temp_video_path)
        
        if analysis_settings.get('point_of_interest', False):
            logger.info("Detecting points of interest")
            results["poi"] = generate_poi_analysis(temp_video_path)
        
        if analysis_settings.get('scene_detection', False):
            logger.info("Performing scene detection")
            results["scenes"] = generate_scenes_analysis(temp_video_path)
        
        # Ensure all values are JSON serializable
        serializable_results = ensure_serializable(results)
        
        logger.info("Video analysis completed successfully")
        return jsonify({'results': serializable_results})
    except Exception as e:
        logger.error(f"Error during video analysis: {str(e)}", exc_info=True)
        return jsonify({'error': f"An error occurred during video analysis: {str(e)}"}), 500
    finally:
        # Clean up temporary file
        logger.info("Cleaning up temporary files")
        os.remove(temp_video_path)

@app.route('/api/admin-decision', methods=['POST'])
def save_admin_decision():
    decision = request.json
    
    # Here you would typically save the decision to your database
    # For this example, we'll just log it
    logger.info(f"Received admin decision: {decision}")
    
    # You might also want to update the video analysis results with this decision
    # This would depend on your specific database structure and requirements
    
    return jsonify({'message': 'Decision saved successfully'}), 200

setup_nltk()
setup_textblob()

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
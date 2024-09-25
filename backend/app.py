from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from src.detection import detect_yolo10
from src.ocr import ocr_trocr_ru
from src.transcription.audio import extract_audio_from_video
from src.transcription.transcription import transcribe_audio_pipeline
from src.ai_insights import generate_ai_insights
import io
import tempfile
import os
import logging
import cv2

app = Flask(__name__)
CORS(app)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@app.route('/api/analyze-video', methods=['POST'])
def analyze_video():
    logger.info("Received video analysis request")
    if 'video' not in request.files:
        logger.error("No video file provided in the request")
        return jsonify({'error': 'No video file provided'}), 400
    
    video_file = request.files['video']
    logger.info(f"Received video file: {video_file.filename}")
    
    # Create temporary files for video and audio
    with tempfile.NamedTemporaryFile(delete=False, suffix='.mp4') as temp_video_file:
        video_file.save(temp_video_file.name)
        temp_video_path = temp_video_file.name
        logger.info(f"Saved video to temporary file: {temp_video_path}")

    with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as temp_audio_file:
        temp_audio_path = temp_audio_file.name
        logger.info(f"Created temporary audio file: {temp_audio_path}")
    
    try:
        # Object detection
        logger.info("Starting object detection")
        with open(temp_video_path, 'rb') as f:
            video_binary = f.read()
        detection_results = detect_yolo10(video_binary, frequency=10)
        logger.info("Object detection completed")
        
        # OCR analysis
        logger.info("Starting OCR analysis")
        ocr_results = ocr_trocr_ru(video_binary, frame_rate=1000)
        logger.info("OCR analysis completed")
        
        # Audio extraction and transcription
        logger.info("Starting audio extraction")
        extract_audio_from_video(temp_video_path, temp_audio_path)
        logger.info("Audio extraction completed")
        logger.info("Starting transcription")
        transcription_result = transcribe_audio_pipeline(temp_video_path, temp_audio_path)
        logger.info("Transcription completed")
        
        # Combine results
        combined_results = {
            'object_detection': detection_results,
            'ocr': ocr_results,
            'transcription': transcription_result
        }
        
        logger.info("Analysis completed. Results structure:")
        logger.info(f"Object detection: {type(detection_results)}, {len(detection_results) if isinstance(detection_results, (list, dict)) else 'N/A'} items")
        logger.info(f"OCR: {type(ocr_results)}, {len(ocr_results) if isinstance(ocr_results, (list, dict)) else 'N/A'} items")
        logger.info(f"Transcription: {type(transcription_result)}, {len(transcription_result) if isinstance(transcription_result, (list, dict)) else 'N/A'} items")
        
        return jsonify({'results': combined_results})
    except Exception as e:
        logger.error(f"Error during video analysis: {str(e)}", exc_info=True)
        return jsonify({'error': str(e)}), 500
    finally:
        # Clean up temporary files
        logger.info("Cleaning up temporary files")
        os.remove(temp_video_path)
        os.remove(temp_audio_path)

@app.route('/api/frame/<int:frame_number>', methods=['GET'])
def get_frame(frame_number):
    video_path = request.args.get('video_path')
    if not video_path:
        return jsonify({'error': 'Video path not provided'}), 400

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

if __name__ == '__main__':
    app.run(debug=True)

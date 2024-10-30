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
    generate_scenes_analysis,
    fist_video_processing
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

temp_video_path = "video/news.mp4"
fist_video_processing(temp_video_path)
"""
results = {}
results["summary"] = generate_summary(temp_video_path)
results["transcription"] = generate_transcription(temp_video_path)
results["audio"] = generate_audio_analysis(temp_video_path)
results["objects"] = generate_objects_analysis(temp_video_path)
results["symbols"] = generate_symbols_analysis(temp_video_path)
results["scenes"] = generate_scenes_analysis(temp_video_path)
results["poi"] = generate_poi_analysis(temp_video_path)

# Ensure all values are JSON serializable
serializable_results = ensure_serializable(results)

"""
import cv2
import numpy as np
import torch
from torchvision.models import resnet18, ResNet18_Weights
from torchvision.transforms import functional as F
from sklearn.cluster import KMeans
from scenedetect import detect, ContentDetector
from PIL import Image
import io
import logging
from scipy.spatial.distance import cosine
from sklearn.preprocessing import MinMaxScaler
import pytesseract
from transformers import pipeline

# Load mood detection model
mood_classifier = pipeline("text-classification", model="j-hartmann/emotion-english-distilroberta-base", top_k=1)

def analyze_scenes(video_path):
    logging.info(f"Starting scene analysis for video: {video_path}")
    
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    logging.info(f"Using device: {device}")
    
    model = resnet18(weights=ResNet18_Weights.DEFAULT).to(device)
    model.eval()
    
    scenes = detect(video_path, ContentDetector())
    logging.info(f"Detected {len(scenes)} scenes")
    
    frame_features = []
    scene_times = []
    scene_complexities = []
    motion_intensities = []
    scene_texts = []
    
    cap = cv2.VideoCapture(video_path)
    fps = cap.get(cv2.CAP_PROP_FPS)
    
    prev_frame = None
    for i, scene in enumerate(scenes):
        start_frame = scene[0].frame_num
        end_frame = scene[1].frame_num
        mid_frame = (start_frame + end_frame) // 2
        
        cap.set(cv2.CAP_PROP_POS_FRAMES, mid_frame)
        ret, frame = cap.read()
        
        if ret:
            frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            pil_image = Image.fromarray(frame_rgb)
            input_tensor = F.to_tensor(pil_image).unsqueeze(0).to(device)
            
            with torch.no_grad():
                features = model(input_tensor)
            
            frame_features.append(features.cpu().numpy().flatten())
            scene_times.append(mid_frame / fps)
            
            # Scene complexity
            complexity = cv2.Laplacian(frame, cv2.CV_64F).var()
            scene_complexities.append(complexity)
            
            # Motion intensity
            if prev_frame is not None:
                motion = cv2.absdiff(frame, prev_frame).mean()
                motion_intensities.append(motion)
            prev_frame = frame
            
            # Text detection
            text = pytesseract.image_to_string(frame_rgb)
            scene_texts.append(text.strip())
        else:
            logging.warning(f"Failed to read frame for scene {i}")
    
    cap.release()
    
    # Scene clustering
    kmeans = KMeans(n_clusters=min(4, len(frame_features)), random_state=42)
    scene_labels = kmeans.fit_predict(frame_features)
    
    # Scene similarity
    similarity_matrix = calculate_similarity_matrix(frame_features)
    
    # Scene mood detection
    scene_moods = detect_scene_moods(scene_texts)
    
    # Normalize complexities and motion intensities
    scaler = MinMaxScaler()
    normalized_complexities = scaler.fit_transform(np.array(scene_complexities).reshape(-1, 1)).flatten()
    normalized_motions = scaler.fit_transform(np.array(motion_intensities).reshape(-1, 1)).flatten()
    
    # Generate results
    key_scenes = []
    for i, scene in enumerate(scenes):
        start_time = scene[0].get_seconds()
        end_time = scene[1].get_seconds()
        key_scenes.append({
            "time": f"{format_time(start_time)} - {format_time(end_time)}",
            "type": f"Сцена типа {scene_labels[i]}",
            "complexity": float(normalized_complexities[i]),
            "motionIntensity": float(normalized_motions[i]) if i < len(normalized_motions) else 0,
            "mood": scene_moods[i],
            "text": scene_texts[i]
        })
    
    dominant_colors = calculate_dominant_colors(video_path)
    scene_descriptions = generate_scene_descriptions(key_scenes, dominant_colors)
    
    result = {
        "sceneCount": len(key_scenes),
        "averageSceneDuration": calculate_average_scene_duration(key_scenes),
        "sceneTransitions": generate_scene_transitions(key_scenes),
        "dominantColors": dominant_colors,
        "sceneDescriptions": scene_descriptions,
        "keyScenes": key_scenes,
        "similarityMatrix": similarity_matrix.tolist(),
        "labels": ["Scenes", "AI-Analyzed", "ResNet18", "Mood Detection", "Complexity Analysis"]
    }
    
    logging.info("Scene analysis completed")
    return result

def calculate_similarity_matrix(features):
    n = len(features)
    similarity_matrix = np.zeros((n, n))
    for i in range(n):
        for j in range(i, n):
            similarity = 1 - cosine(features[i], features[j])
            similarity_matrix[i, j] = similarity_matrix[j, i] = similarity
    return similarity_matrix

def detect_scene_moods(scene_texts):
    moods = []
    for text in scene_texts:
        if text:
            result = mood_classifier(text)
            mood = result[0][0]['label']
        else:
            mood = "neutral"
        moods.append(mood)
    return moods

def format_time(seconds):
    minutes, seconds = divmod(int(seconds), 60)
    return f"{minutes:02d}:{seconds:02d}"

def calculate_average_scene_duration(key_scenes):
    durations = []
    for scene in key_scenes:
        start, end = scene["time"].split(" - ")
        start_seconds = sum(int(x) * 60 ** i for i, x in enumerate(reversed(start.split(":"))))
        end_seconds = sum(int(x) * 60 ** i for i, x in enumerate(reversed(end.split(":"))))
        durations.append(end_seconds - start_seconds)
    return sum(durations) / len(durations) if durations else 0

def generate_scene_transitions(key_scenes):
    transitions = []
    for i in range(len(key_scenes) - 1):
        transitions.append({
            "from": key_scenes[i]["type"],
            "to": key_scenes[i+1]["type"],
            "time": key_scenes[i+1]["time"].split(" - ")[0]
        })
    return transitions

def calculate_dominant_colors(video_path):
    cap = cv2.VideoCapture(video_path)
    frames = []
    frame_count = 0
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break
        if frame_count % 30 == 0:  # Sample every 30th frame
            frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            frame = cv2.resize(frame, (100, 100))  # Resize for faster processing
            frames.append(frame)
        frame_count += 1
    cap.release()
    
    if not frames:
        return []
    
    # Concatenate all frames and reshape
    all_pixels = np.concatenate(frames).reshape(-1, 3)
    
    # Use a smaller subset of pixels for faster processing
    subset_size = min(100000, all_pixels.shape[0])
    pixel_subset = all_pixels[np.random.choice(all_pixels.shape[0], subset_size, replace=False)]
    
    kmeans = KMeans(n_clusters=5, random_state=42, n_init=10)
    kmeans.fit(pixel_subset)
    
    colors = kmeans.cluster_centers_.astype(int)
    
    # Sort colors by frequency
    labels = kmeans.predict(pixel_subset)
    color_frequencies = np.bincount(labels)
    sorted_indices = np.argsort(color_frequencies)[::-1]
    sorted_colors = colors[sorted_indices]
    
    # Ensure colors are within valid RGB range
    sorted_colors = np.clip(sorted_colors, 0, 255)
    
    return [{'r': int(color[0]), 'g': int(color[1]), 'b': int(color[2])} for color in sorted_colors]

def generate_scene_descriptions(key_scenes, dominant_colors):
    descriptions = []
    for i, scene in enumerate(key_scenes):
        color_index = i % len(dominant_colors)
        color = dominant_colors[color_index]
        descriptions.append(f"Сцена {i+1}: {scene['type']} с преобладающим цветом RGB({color['r']}, {color['g']}, {color['b']}). "
                            f"Сложность: {scene['complexity']:.2f}, Интенсивность движения: {scene['motionIntensity']:.2f}, "
                            f"Настроение: {scene['mood']}. Текст: {scene['text'][:50]}...")
    return descriptions
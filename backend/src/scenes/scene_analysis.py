import cv2
import numpy as np
from sklearn.cluster import KMeans

def analyze_scenes(video_path):
    # Open the video file
    cap = cv2.VideoCapture(video_path)
    
    frame_features = []
    frame_times = []
    frame_count = 0
    
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break
        
        if frame_count % 30 == 0:  # Process every 30th frame
            # Extract features from the frame (e.g., color histogram)
            hist = cv2.calcHist([frame], [0, 1, 2], None, [8, 8, 8], [0, 256, 0, 256, 0, 256])
            hist = cv2.normalize(hist, hist).flatten()
            
            frame_features.append(hist)
            frame_times.append(frame_count / cap.get(cv2.CAP_PROP_FPS))
        
        frame_count += 1
    
    cap.release()
    
    # Perform clustering to identify scene types
    kmeans = KMeans(n_clusters=4, random_state=42)
    scene_labels = kmeans.fit_predict(frame_features)
    
    # Identify key scenes
    key_scenes = []
    current_scene = scene_labels[0]
    scene_start = frame_times[0]
    
    for i in range(1, len(scene_labels)):
        if scene_labels[i] != current_scene:
            key_scenes.append({
                "time": f"{format_time(scene_start)} - {format_time(frame_times[i])}",
                "type": f"Сцена типа {current_scene}"
            })
            current_scene = scene_labels[i]
            scene_start = frame_times[i]
    
    # Add the last scene
    key_scenes.append({
        "time": f"{format_time(scene_start)} - {format_time(frame_times[-1])}",
        "type": f"Сцена типа {current_scene}"
    })
    
    return {
        "sceneTypes": [f"Сцена типа {i}" for i in range(4)],
        "keyScenes": key_scenes,
        "labels": ["Scenes", "AI-Analyzed"]
    }

def format_time(seconds):
    minutes, seconds = divmod(int(seconds), 60)
    return f"{minutes:02d}:{seconds:02d}"
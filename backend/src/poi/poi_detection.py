import cv2
import numpy as np
import torch
from torchvision.transforms import functional as F
from sklearn.cluster import KMeans

def detect_poi(video_path, heatmap, frame_count, fps):
    # Find heat zones with timestamps
    heat_zones, heat_zone_coordinates = find_heat_zones(heatmap, frame_count, fps)

    # Find attention hotspots with timestamps
    attention_hotspots = find_attention_hotspots(heatmap, frame_count, fps)

    # Generate eye tracking data (simplified) with timestamps
    eye_tracking_data = generate_eye_tracking_data(heatmap, frame_count, fps)

    return {
        "heatZones": heat_zones,
        "heatZoneCoordinates": heat_zone_coordinates,
        "attentionHotspots": attention_hotspots,
        "eyeTrackingData": eye_tracking_data,
        "labels": ["POI Analysis", "ResNet50", "Heatmap"]
    }

def preprocess_frame(frame):
    frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    frame = cv2.resize(frame, (224, 224))
    frame = F.to_tensor(frame)
    frame = F.normalize(frame, mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
    return frame

def find_heat_zones(heatmap, frame_count, fps, n_zones=3):
    # Threshold the heatmap
    _, binary = cv2.threshold(heatmap.astype(np.uint8), 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)

    # Find contours
    contours, _ = cv2.findContours(binary, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    # Sort contours by area and get the top n_zones
    contours = sorted(contours, key=cv2.contourArea, reverse=True)[:n_zones]

    heat_zones = []
    heat_zone_coordinates = []

    for i, contour in enumerate(contours):
        # Get bounding box
        x, y, w, h = cv2.boundingRect(contour)
        
        # Calculate centroid
        M = cv2.moments(contour)
        cx = int(M['m10'] / M['m00'])
        cy = int(M['m01'] / M['m00'])

        timestamp = (i * frame_count) / (n_zones * fps)  # Estimate timestamp

        heat_zones.append({
            "id": i + 1,
            "intensity": float(np.mean(heatmap[y:y+h, x:x+w])),
            "size": float(cv2.contourArea(contour)),
            "timestamp": timestamp
        })

        heat_zone_coordinates.append({
            "id": i + 1,
            "x": int(x),
            "y": int(y),
            "width": int(w),
            "height": int(h),
            "centroidX": int(cx),
            "centroidY": int(cy),
            "timestamp": timestamp
        })

    return heat_zones, heat_zone_coordinates

def find_attention_hotspots(heatmap, frame_count, fps, n_hotspots=5):
    # Flatten the heatmap and find the indices of the top n_hotspots values
    flat_heatmap = heatmap.flatten()
    hotspot_indices = np.argsort(flat_heatmap)[-n_hotspots:][::-1]

    height, width = heatmap.shape
    hotspots = []

    for i, index in enumerate(hotspot_indices):
        y, x = np.unravel_index(index, (height, width))
        timestamp = (i * frame_count) / (n_hotspots * fps)  # Estimate timestamp
        hotspots.append({
            "id": i + 1,
            "x": int(x),
            "y": int(y),
            "intensity": float(heatmap[y, x]),
            "timestamp": timestamp
        })

    return hotspots

def generate_eye_tracking_data(heatmap, frame_count, fps, n_points=100):
    height, width = heatmap.shape
    
    # Use KMeans to generate simulated eye tracking points
    points = np.argwhere(heatmap > np.percentile(heatmap, 90))
    if len(points) > n_points:
        kmeans = KMeans(n_clusters=n_points, random_state=42)
        kmeans.fit(points)
        points = kmeans.cluster_centers_

    eye_tracking_data = []
    for i, (y, x) in enumerate(points):
        eye_tracking_data.append({
            "id": i + 1,
            "x": int(x),
            "y": int(y),
            "timestamp": float(i * frame_count / (n_points * fps)),
            "duration": float(frame_count / (n_points * fps))
        })

    return eye_tracking_data

def format_time(seconds):
    minutes, seconds = divmod(int(seconds), 60)
    return f"{minutes:02d}:{seconds:02d}"
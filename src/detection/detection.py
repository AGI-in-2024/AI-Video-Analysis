import cv2
import numpy as np
from ultralytics import YOLO
import tempfile
import os


def detect_yolo10(video_binary, frequency=1):
    """
    Detect objects using YOLOv10 in a video.

    Parameters:
    - video_binary (bytes): The video file as binary data.
    - frequency (int): The frame detection frequency (e.g., 1 = every frame, 2 = every second frame, etc.).

    Returns:
    - dict: A dictionary containing detection results with frame number as key and detected objects as values.
    """

    # Save the video binary to a temporary file
    temp_video = tempfile.NamedTemporaryFile(delete=False, suffix='.mp4')
    temp_video.write(video_binary)
    temp_video.close()

    # Load YOLOv10 model (you can specify the model variant, e.g., 'yolov10n.pt')
    model = YOLO('./weights/yolov10n.pt')  # Assuming you have downloaded the weights

    # Open video file
    cap = cv2.VideoCapture(temp_video.name)
    if not cap.isOpened():
        raise ValueError("Error opening video stream or file")

    frame_count = 0
    detections = {}

    while True:
        ret, frame = cap.read()
        if not ret:
            break  # End of video

        if frame_count % frequency == 0:
            # Run detection on the current frame
            results = model(frame)

            # Process the results
            frame_detections = []
            for result in results:
                boxes = result.boxes  # Get bounding boxes
                for box in boxes:
                    cls = result.names[int(box.cls[0])]  # Get class name
                    conf = float(box.conf[0])  # Confidence
                    coords = box.xyxy[0].tolist()  # Bounding box coordinates
                    frame_detections.append({
                        'class': cls,
                        'confidence': conf,
                        'coordinates': coords
                    })
            detections[frame_count] = frame_detections

        frame_count += 1

    # Release video capture and delete temporary video file
    cap.release()
    os.remove(temp_video.name)

    return detections


def detect_yolo_world(video_binary, class_names, frequency=1):
    """
    Detect objects using YOLO-World in a video.

    Parameters:
    - video_binary (bytes): The video file as binary data.
    - class_names (list): A list of class names.
    - frequency (int): The frame detection frequency (e.g., 1 = every frame, 2 = every second frame, etc.).

    Returns:
    - dict: A dictionary containing detection results with frame number as key and detected objects as values.
    """

    # Save the video binary to a temporary file
    temp_video = tempfile.NamedTemporaryFile(delete=False, suffix='.mp4')
    temp_video.write(video_binary)
    temp_video.close()

    model = YOLO('./weights/yolov8m-worldv2.pt')  # Assuming you have downloaded the weights
    model.set_classes(class_names)

    # Open video file
    cap = cv2.VideoCapture(temp_video.name)
    if not cap.isOpened():
        raise ValueError("Error opening video stream or file")

    frame_count = 0
    detections = {}

    while True:
        ret, frame = cap.read()
        if not ret:
            break  # End of video

        if frame_count % frequency == 0:
            # Run detection on the current frame
            results = model(frame)

            # Process the results
            frame_detections = []
            for result in results:
                boxes = result.boxes  # Get bounding boxes
                for box in boxes:
                    cls = result.names[int(box.cls[0])]  # Get class name
                    conf = float(box.conf[0])  # Confidence
                    coords = box.xyxy[0].tolist()  # Bounding box coordinates
                    frame_detections.append({
                        'class': cls,
                        'confidence': conf,
                        'coordinates': coords
                    })
            detections[frame_count] = frame_detections

        frame_count += 1

    # Release video capture and delete temporary video file
    cap.release()
    os.remove(temp_video.name)

    return detections

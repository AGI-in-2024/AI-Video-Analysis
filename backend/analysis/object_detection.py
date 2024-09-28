import cv2
import numpy as np
from tensorflow.keras.applications.mobilenet_v2 import MobileNetV2, preprocess_input, decode_predictions
from tensorflow.keras.applications.resnet50 import ResNet50, preprocess_input as resnet_preprocess
from scipy.spatial.distance import cosine

class ObjectDetector:
    def __init__(self):
        self.model = MobileNetV2(weights='imagenet')
        self.scene_model = ResNet50(weights='places365')
        self.tracker = cv2.TrackerKCF_create()

    def detect_objects(self, video_path):
        cap = cv2.VideoCapture(video_path)
        fps = cap.get(cv2.CAP_PROP_FPS)
        detected_objects = []
        tracked_objects = {}
        scene_classifications = []
        object_interactions = []

        frame_count = 0
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break

            current_time = cap.get(cv2.CAP_PROP_POS_MSEC) / 1000.0

            # Object Detection
            img = cv2.resize(frame, (224, 224))
            img = preprocess_input(img)
            img = np.expand_dims(img, axis=0)
            preds = self.model.predict(img)
            results = decode_predictions(preds, top=3)[0]

            frame_objects = []
            for (_, label, confidence) in results:
                obj = {
                    'label': label,
                    'confidence': float(confidence),
                    'boundingBox': self.get_bounding_box(frame, label),
                    'timeAppeared': current_time,
                    'timeDuration': 1 / fps
                }
                frame_objects.append(obj)
                detected_objects.append(obj)

            # Object Tracking
            for obj in frame_objects:
                if obj['label'] not in tracked_objects:
                    self.tracker.init(frame, obj['boundingBox'])
                    tracked_objects[obj['label']] = {'tracker': self.tracker, 'last_seen': current_time}
                else:
                    success, box = tracked_objects[obj['label']]['tracker'].update(frame)
                    if success:
                        obj['boundingBox'] = box
                        tracked_objects[obj['label']]['last_seen'] = current_time

            # Scene Classification
            if frame_count % 30 == 0:  # Classify scene every 30 frames
                scene_img = cv2.resize(frame, (224, 224))
                scene_img = resnet_preprocess(scene_img)
                scene_img = np.expand_dims(scene_img, axis=0)
                scene_preds = self.scene_model.predict(scene_img)
                scene_label = decode_predictions(scene_preds, top=1)[0][0][1]
                scene_classifications.append({'time': current_time, 'scene': scene_label})

            # Object Interaction Detection
            if len(frame_objects) > 1:
                for i in range(len(frame_objects)):
                    for j in range(i+1, len(frame_objects)):
                        if self.check_interaction(frame_objects[i]['boundingBox'], frame_objects[j]['boundingBox']):
                            object_interactions.append({
                                'time': current_time,
                                'object1': frame_objects[i]['label'],
                                'object2': frame_objects[j]['label']
                            })

            frame_count += 1

        cap.release()
        return {
            'detectedObjects': detected_objects,
            'sceneClassifications': scene_classifications,
            'objectInteractions': object_interactions
        }

    def get_bounding_box(self, frame, label):
        # This is a placeholder. In a real implementation, you'd use an object detection model to get accurate bounding boxes.
        height, width = frame.shape[:2]
        return [width/4, height/4, width/2, height/2]

    def check_interaction(self, box1, box2):
        # Check if bounding boxes overlap
        x1, y1, w1, h1 = box1
        x2, y2, w2, h2 = box2
        return not (x1+w1 < x2 or x2+w2 < x1 or y1+h1 < y2 or y2+h2 < y1)
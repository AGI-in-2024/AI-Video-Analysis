# ИИ фичи
## Мультимодальный поиск
- Что под капотом: CLIP
- Исходный код: [notebooks/text-to-image/ruCLIP.ipynb](notebooks/text-to-image/ruCLIP.ipynb)

Поиск с поимощью текст->изображение или изображение->изображение
<img src="https://habrastorage.org/r/w1560/getpro/habr/upload_files/d20/11e/754/d2011e7548f96770e349510166d4ff25.png"/>

- Пример выхода:
<img src="https://www.mydeliciousmeals.com/images/recipephotos/large/seasoned-oven-baked-chicken-breast-bites-recipe1.jpg"/>

- Исходный код: [notebooks/video/detection/detection_example.ipynb](notebooks/video/detection/detection_example.ipynb), [src/detection/detection.py](src/detection/detection.py)
```python
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
```
- Пример выхода:
```python
results = detect_yolo_world(video_binary, class_names=["car", "plane"], frequency=10)  # Detect objects every 10th frame

# Display detection results
for frame_num, detections in results.items():
    print(f"Frame {frame_num}: {detections}")

# ->
# 
# ...
# Frame 100: [{'class': 'car', 'confidence': 0.45161107182502747, 'coordinates': [604.96484375, 227.2288360595703, 761.029296875, 368.57037353515625]}]
# Frame 110: [{'class': 'car', 'confidence': 0.2925072908401489, 'coordinates': [597.0692138671875, 226.84547424316406, 767.8201904296875, 382.01513671875]}]
# Frame 120: []
# ...
```

<img src="./loss weight.png" alt="eat"/>

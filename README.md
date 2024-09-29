# ИИ фичи

## Обнаружение в видео произвольных объектов и символов из расширяемой базы
- Что под капотом: Yolo-World
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

## Распознавание текста на видео
- Что под капотом: Trocr
- Исходный код: [notebooks/video/ocr/ocr_example.ipynb](notebooks/video/ocr/ocr_example.ipynb), [src/ocr/ocr.py](src/ocr/ocr.py)
```python
def ocr_trocr_ru(video_binary, frame_rate=1):
    """
    Pipeline to extract text from video using TrOCR.

    Parameters:
    - video_binary (bytes): The video file as binary data.
    - frame_rate (int): The frame extraction frequency (e.g., 1 = every frame, 2 = every second frame, etc.).

    Returns:
    - dict: A dictionary where keys are frame numbers and values are recognized text.
    """
```
- Пример выхода:
```python
recognized_text = ocr_trocr_ru(video_binary, frame_rate=1000)

for frame_num, text in recognized_text.items():
        print(f"Frame {frame_num}: {text}")

# ->
# 
# ...
# Frame 0: постановка
# Frame 1000: -
# Frame 2000: г
# Frame 3000: принято
# ...
```

## Транскрибация аудио + диаризация (выделение собеседников) + мультиязычное распознавание
- Что под капотом: whisperX + [фокусы](https://github.com/openai/whisper/discussions/2009)
- Исходный код: [notebooks/video/transcription/transcription_example.ipynb](notebooks/video/transcription/transcription_example.ipynb), [src/transcription/transcription.py](src/transcription/transcription.py)
- Пример выхода:
```python
{"segments":[{"start":0.009,"end":2.813,"text":" The Hispaniola was rolling scuppers under in the ocean swell.","words":[{"word":"The","start":0.009,"end":0.069,"score":0.0},{"word":"Hispaniola","start":0.109,"end":0.81,"score":0.917},{"word":"was","start":0.83,"end":0.95,"score":0.501},{"word":"rolling","start":0.99,"end":1.251,"score":0.839},{"word":"scuppers","start":1.311,"end":1.671,"score":0.947},{"word":"under","start":1.751,"end":1.932,"score":0.939},{"word":"in","start":1.952,"end":2.012,"score":0.746},{"word":"the","start":2.032,"end":2.132,"score":0.667},{"word":"ocean","start":2.212,"end":2.472,"score":0.783},{"word":"swell.","start":2.512,"end":2.813,"score":0.865}]},{"start":3.494,"end":10.263,"text":"The booms were tearing at the blocks, the rudder was banging to and fro, and the whole ship creaking, groaning, and jumping like a manufactory.","words":[{"word":"The","start":3.494,"end":3.594,"score":0.752},{"word":"booms","start":3.614,"end":3.914,"score":0.867},{"word":"were","start":3.934,"end":4.054,"score":0.778},{"word":"tearing","start":4.074,"end":4.315,"score":0.808},{"word":"at","start":4.335,"end":4.395,"score":0.748},{"word":"the","start":4.415,"end":4.475,"score":0.993},{"word":"blocks,","start":4.495,"end":4.855,"score":0.918},{"word":"the","start":5.236,"end":5.316,"score":0.859},{"word":"rudder","start":5.356,"end":5.576,"score":0.894},{"word":"was","start":5.596,"end":5.717,"score":0.711},{"word":"banging","start":5.757,"end":6.117,"score":0.767},{"word":"to","start":6.177,"end":6.317,"score":0.781},{"word":"and","start":6.377,"end":6.458,"score":0.833},{"word":"fro,","start":6.498,"end":6.758,"score":0.657},{"word":"and","start":7.058,"end":7.159,"score":0.759},{"word":"the","start":7.179,"end":7.259,"score":0.833},{"word":"whole","start":7.299,"end":7.479,"score":0.807},{"word":"ship","start":7.539,"end":7.759,"score":0.79},{"word":"creaking,","start":7.859,"end":8.26,"score":0.774},{"word":"groaning,","start":8.44,"end":8.821,"score":0.75},{"word":"and","start":8.861,"end":8.941,"score":0.837},{"word":"jumping","start":8.981,"end":9.321,"score":0.859},{"word":"like","start":9.382,"end":9.502,"score":0.876},{"word":"a","start":9.542,"end":9.582,"score":0.5},{"word":"manufactory.","start":9.622,"end":10.263,"score":0.886}]}],"word_segments":[{"word":"The","start":0.009,"end":0.069,"score":0.0},{"word":"Hispaniola","start":0.109,"end":0.81,"score":0.917},{"word":"was","start":0.83,"end":0.95,"score":0.501},{"word":"rolling","start":0.99,"end":1.251,"score":0.839},{"word":"scuppers","start":1.311,"end":1.671,"score":0.947},{"word":"under","start":1.751,"end":1.932,"score":0.939},{"word":"in","start":1.952,"end":2.012,"score":0.746},{"word":"the","start":2.032,"end":2.132,"score":0.667},{"word":"ocean","start":2.212,"end":2.472,"score":0.783},{"word":"swell.","start":2.512,"end":2.813,"score":0.865},{"word":"The","start":3.494,"end":3.594,"score":0.752},{"word":"booms","start":3.614,"end":3.914,"score":0.867},{"word":"were","start":3.934,"end":4.054,"score":0.778},{"word":"tearing","start":4.074,"end":4.315,"score":0.808},{"word":"at","start":4.335,"end":4.395,"score":0.748},{"word":"the","start":4.415,"end":4.475,"score":0.993},{"word":"blocks,","start":4.495,"end":4.855,"score":0.918},{"word":"the","start":5.236,"end":5.316,"score":0.859},{"word":"rudder","start":5.356,"end":5.576,"score":0.894},{"word":"was","start":5.596,"end":5.717,"score":0.711},{"word":"banging","start":5.757,"end":6.117,"score":0.767},{"word":"to","start":6.177,"end":6.317,"score":0.781},{"word":"and","start":6.377,"end":6.458,"score":0.833},{"word":"fro,","start":6.498,"end":6.758,"score":0.657},{"word":"and","start":7.058,"end":7.159,"score":0.759},{"word":"the","start":7.179,"end":7.259,"score":0.833},{"word":"whole","start":7.299,"end":7.479,"score":0.807},{"word":"ship","start":7.539,"end":7.759,"score":0.79},{"word":"creaking,","start":7.859,"end":8.26,"score":0.774},{"word":"groaning,","start":8.44,"end":8.821,"score":0.75},{"word":"and","start":8.861,"end":8.941,"score":0.837},{"word":"jumping","start":8.981,"end":9.321,"score":0.859},{"word":"like","start":9.382,"end":9.502,"score":0.876},{"word":"a","start":9.542,"end":9.582,"score":0.5},{"word":"manufactory.","start":9.622,"end":10.263,"score":0.886}]}%
```

## Обнаружение точек интереса по аудиодорожке
- Что под капотом: Hubert - классификация эмоций в сегменте аудио, librosa - анализ громкости в сегменте аудио, Wav2Vec2 - классификация звуков насилия в сегменте аудио. На выходе имеем данные классификации, далее логика: громкий звук + злость + насилие = точка интереса и т.п.
- Исходный код: [notebooks/audio/interest_detection.ipynb](notebooks/audio/interest_detection.ipynb), [notebooks/audio/violence_detection.ipynb](notebooks/audio/violence_detection.ipynb)
- Пример выхода:
```python
{0: ('neutral', 0.898531436920166), 10: ('unknown', 0.5047914981842041), 20: ('unknown', 0.6240713000297546), 30: ('unknown', 0.4543779790401459), 40: ('angry', 0.758493185043335), 50: ('angry', 0.7123038172721863), 60: ('unknown', 0.6553771495819092), 70: ('unknown', 0.4523645341396332), 80: ('unknown', 0.616582989692688), 90: ('angry', 0.9587709307670593), 100: ('angry', 0.8447172045707703), 110: ('unknown', 0.6968732476234436), 120: ('unknown', 0.5530036687850952), 130: ('unknown', 0.5075026750564575), 140: ('angry', 0.8949615359306335), 150: ('unknown', 0.5432318449020386), 160: ('unknown', 0.5116928219795227), 170: ('neutral', 0.7228280305862427), 180: ('unknown', 0.6902819275856018), 190: ('unknown', 0.5846384167671204), 200: ('neutral', 0.9654733538627625), 210: ('neutral', 0.981601893901825), 220: ('neutral', 0.7543083429336548), 230: ('angry', 0.8148767948150635)}
{0: (0.052737, -4.346724599599838, 'normal'), 10: (0.047385897, -14.052446186542511, 'quiet'), 20: (0.052177295, -5.3619083017110825, 'normal'), 30: (0.054364823, -1.3942159712314606, 'normal'), 40: (0.05919643, 7.369254529476166, 'normal'), 50: (0.05567366, 0.9797235950827599, 'normal'), 60: (0.055661913, 0.9584192186594009, 'normal'), 70: (0.056004174, 1.5792051330208778, 'normal'), 80: (0.05390702, -2.2245725616812706, 'normal'), 90: (0.05659374, 2.6485448703169823, 'normal'), 100: (0.05345071, -3.052212856709957, 'normal'), 110: (0.054948863, -0.3348967060446739, 'normal'), 120: (0.05337519, -3.1891945749521255, 'normal'), 130: (0.05855794, 6.211170554161072, 'normal'), 140: (0.056462802, 2.4110550060868263, 'normal'), 150: (0.056765426, 2.959948033094406, 'normal'), 160: (0.058398627, 5.922213569283485, 'normal'), 170: (0.04427266, -19.69916820526123, 'quiet'), 180: (0.05806135, 5.310468375682831, 'normal'), 190: (0.0502579, -8.84326919913292, 'normal'), 200: (0.06275149, 13.81734013557434, 'loud'), 210: (0.065787315, 19.323663413524628, 'loud'), 220: (0.062907085, 14.099560678005219, 'loud'), 230: (0.050390385, -8.602968603372574, 'normal')}
{0: 'violence', 10: 'non_violence', 20: 'non_violence', 30: 'non_violence', 40: 'non_violence', 50: 'non_violence', 60: 'non_violence', 70: 'violence', 80: 'non_violence', 90: 'non_violence'}
```

## Обнаружение музыки и звуков и сопоставление их с расширяемой базой треков
- Что под капотом: DistilHuBERT - классификация сегмента аудио как музыки или не музыки, алгоритм поиска по отпечатку трека (как в Shazam) - сопоставление сегмента с каким-то треком из расширенной базы
- Исходный код: [notebooks/audio/music_recognition.ipynb](notebooks/audio/music_recognition.ipynb), [notebooks/audio/music_detection.ipynb](notebooks/audio/music_detection.ipynb)
- Пример выхода (клип на песню Portugal. The Man - Feel It Still):
```python
{0: 'non_music', 10: 'match found: data/audio/test/Portugal. The Man - Feel It Still (Official Music Video).wav', 20: 'match found: data/audio/test/Portugal. The Man - Feel It Still (Official Music Video).wav', 30: 'match found: data/audio/test/Portugal. The Man - Feel It Still (Official Music Video).wav', 40: 'match found: data/audio/test/Portugal. The Man - Feel It Still (Official Music Video).wav', 50: 'match found: data/audio/test/Portugal. The Man - Feel It Still (Official Music Video).wav', 60: 'match found: data/audio/test/Portugal. The Man - Feel It Still (Official Music Video).wav', 70: 'match found: data/audio/test/Portugal. The Man - Feel It Still (Official Music Video).wav', 80: 'match found: data/audio/test/Portugal. The Man - Feel It Still (Official Music Video).wav', 90: 'match found: data/audio/test/Portugal. The Man - Feel It Still (Official Music Video).wav', 100: 'match found: data/audio/test/Portugal. The Man - Feel It Still (Official Music Video).wav', 110: 'match found: data/audio/test/Portugal. The Man - Feel It Still (Official Music Video).wav', 120: 'match found: data/audio/test/Portugal. The Man - Feel It Still (Official Music Video).wav', 130: 'match found: data/audio/test/Portugal. The Man - Feel It Still (Official Music Video).wav', 140: 'match found: data/audio/test/Portugal. The Man - Feel It Still (Official Music Video).wav', 150: 'match found: data/audio/test/Portugal. The Man - Feel It Still (Official Music Video).wav', 160: 'match found: data/audio/test/Portugal. The Man - Feel It Still (Official Music Video).wav'}
```

<br>

<img src="./loss weight.png" alt="eat" width="500"/>


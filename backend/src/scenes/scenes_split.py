import av
import numpy as np
import matplotlib.pyplot as plt
import math
import os
from scenedetect import VideoManager, SceneManager
from scenedetect.detectors import AdaptiveDetector, ContentDetector, HashDetector, HistogramDetector, ThresholdDetector
from scenedetect.scene_detector import SceneDetector
from collections import Counter
import uuid
from PIL import Image


# Функция для объединения сцен с устранением дубликатов
def merge_scene_lists(scene_lists, fps):
    fps_window = fps * 1.3

    all_scene_list = []
    all_scene_list.append(scene_lists[0][0][0].get_frames())
    for scene_list in scene_lists:
        for scene in scene_list:
            all_scene_list.append(scene[1].get_frames())

    scene_counter = Counter(all_scene_list)
    scene_counter_key = sorted(scene_counter.keys())

    # Список для объединенных сцен
    combined_scenes = []

    # Проходим по отсортированным сценам и объединяем их при необходимости
    current_scene = scene_counter_key[0]  # Инициализируем первой сценой

    x = 0
    for next_scene in scene_counter_key[1:]:
        # Если разница между концом текущей сцены и началом следующей меньше порога, объединяем
        if next_scene - current_scene <= fps_window:
            if scene_counter[next_scene] > scene_counter[current_scene]:
                scene_counter[next_scene] += scene_counter[current_scene] / 2
                del scene_counter[current_scene]
                current_scene = next_scene

            else:
                scene_counter[current_scene] += scene_counter[next_scene] / 2
                del scene_counter[next_scene]
        else:
            current_scene = next_scene

    filtered_scene_counter = {k: v for k, v in scene_counter.items() if v > 2}

    return sorted(filtered_scene_counter.keys())



def split_video(video_path):
    container = av.open(video_path)
    fps = container.streams.video[0].average_rate
    fps = eval(str(fps))

    # Создаем VideoManager и SceneManager
    video_manager = VideoManager([video_path])

    # Подготавливаем несколько SceneManager для разных детекторов
    scene_managers = [SceneManager() for _ in range(5)]

    # Добавляем различные детекторы к каждому SceneManager
    scene_managers[0].add_detector(ContentDetector(threshold=30.0))  # Обнаружение по содержимому
    scene_managers[1].add_detector(ThresholdDetector(threshold=12))  # Обнаружение по порогу изменений
    scene_managers[2].add_detector(HistogramDetector(min_scene_len=15))  # Обнаружение по гистограмме
    scene_managers[3].add_detector(AdaptiveDetector(adaptive_threshold=3.0))  # Адаптивный детектор
    scene_managers[4].add_detector(HashDetector())  # Гистограммный детектор

    # Запускаем VideoManager
    # video_manager.set_downscale_factor()  # Понижение качества для ускорения
    video_manager.start()

    # Массив для хранения списков сцен от разных детекторов
    all_scene_lists = []

    # Запускаем детекцию для каждого SceneManager и собираем результаты
    for scene_manager in scene_managers:
        scene_manager.detect_scenes(frame_source=video_manager)
        scenes = scene_manager.get_scene_list()
        all_scene_lists.append(scenes)
        video_manager.reset()

    merged_scenes = merge_scene_lists(all_scene_lists, fps)
    return merged_scenes


def save_all_frames_random_names(video_path, output_folder, frame_indices, extension="png"):
    # Проверяем, существует ли выходная папка, если нет — создаем её
    if not os.path.exists(output_folder):
        os.makedirs(output_folder)

    res = []
    # Открываем видеофайл
    with av.open(video_path) as container:
        # Создаем счётчик для отслеживания индексов кадров
        for i, frame in enumerate(container.decode(video=0)):
            # Сохраняем только кадры, которые входят в frame_indices
            if i in frame_indices:
                # Конвертируем кадр в изображение формата PIL
                img = frame.to_image()

                # Генерируем уникальное случайное имя файла
                random_name = str(uuid.uuid4())  # Используем UUID для уникальности

                # Полный путь для сохранения кадра
                frame_filename = os.path.join(output_folder, f"{random_name}.{extension}")

                # Сохраняем кадр
                img.save(frame_filename)
                res.append(random_name)

    return res


if __name__ == "__main__":
    folder_path = 'video'
    # Получаем список файлов в папке
    files_list = [f for f in os.listdir(folder_path) if os.path.isfile(os.path.join(folder_path, f))]

    video_path = os.path.abspath(os.path.join(folder_path, files_list[2]))


    scene_list = split_video(video_path)
    frames_random_name = save_all_frames_random_names(video_path, "frames", scene_list)
    print(frames_random_name)
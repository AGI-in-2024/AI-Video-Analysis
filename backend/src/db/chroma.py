from PIL import Image
import requests
import ruclip
import numpy as np
import torch
import base64
import requests
import matplotlib.pyplot as plt
from PIL import Image
from io import BytesIO


import chromadb
from chromadb.config import Settings
import os
# Инициализация клиента с указанием пути к существующей базе данных
client = chromadb.PersistentClient(path=".")
device = "cuda"
clip, processor = ruclip.load("ruclip-vit-large-patch14-336", device=device)
#clip.to(device)

def add_frames_random_name(frames_random_name):
    # Наполнение БД эмбеддингами изображений
    # Создание/Подключение к существующей коллекции (если она уже была создана)
    collection = client.get_or_create_collection("frame_embeddings")

    frames_dir = "frames"
    # Обрабатываем изображения в папке frames
    #for file_name in os.listdir(frames_dir):
    if len(frames_random_name)==0:
        frames_random_name = os.listdir(frames_dir)

    for file_name in frames_random_name:
        file_name+= ".png"
        if file_name.endswith((".png", ".jpg", ".jpeg")):  # Работать только с изображениями
            image_id = os.path.splitext(file_name)[0]  # Убираем расширение для id
            image_path = os.path.join(frames_dir, file_name)

            # Проверяем, есть ли запись с таким id в базе данных
            existing_record = collection.get(ids=[image_id])
            if len(existing_record['ids']) > 0:
                print(f"Запись с id {image_id} уже существует в базе данных. Пропускаем...")
                continue  # Пропускаем, если запись уже есть

            # Открываем изображение
            image = Image.open(image_path)

            # Подготовьте изображение для модели
            inputs = processor(images=[image], return_tensors="pt")

            # Перенесите тензоры на устройство
            pixel_values = inputs["pixel_values"].to("cuda")  # Используйте "cuda", если есть GPU

            # Создайте эмбеддинг изображения
            with torch.no_grad():
                image_embedding = clip.encode_image(pixel_values)

            # Преобразование в numpy для дальнейшего использования
            image_embedding = image_embedding.cpu().numpy()[0]

            # Нормализуйте эмбеддинг с использованием numpy
            image_embedding = image_embedding / np.linalg.norm(image_embedding)

            # Преобразуйте numpy.ndarray в список
            image_embedding = image_embedding.tolist()

            # Добавляем эмбеддинг в базу данных
            collection.add(
                embeddings=[image_embedding],  # Эмбеддинг изображения
                metadatas=[{"file_name": file_name}],  # Дополнительные данные
                ids=[image_id]  # Идентификатор (имя файла без расширения)
            )
            print(f"Эмбеддинг для {image_id} успешно добавлен в базу данных.")
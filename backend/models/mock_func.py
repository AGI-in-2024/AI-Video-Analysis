def generate_mock_summary():
    return {
        "duration": "6:30 минут",
        "overallTone": "Позитивная",
        "riskLevel": "Средний",
        "keyMoments": {
            "transcription": "3 ключевых события",
            "audio": "3 значимых звуковых эффекта",
            "symbols": "3 выявленных символа",
            "objects": "3 ключевых объекта",
            "poi": "3 тепловые зоны",
            "scenes": "3 основных типа сцен"
        },
        "labels": ["Highlights", "Base", "18+", "Gray", "Black"]
    }

def generate_mock_transcription():
    return {
        "generationStatus": {
            "success": True,
            "model": "WhisperX-FastAPI"
        },
        "languages": [
            {"name": "Русский", "primary": True},
            {"name": "Английский", "primary": False},
            {"name": "Испанский", "primary": False}
        ],
        "lipSyncAccuracy": 95,
        "subtitlesStatus": {
            "created": True,
            "synchronized": True
        },
        "keyEvents": [
            {"time": "00:15", "description": "Драматическое событие: внезапный громкий звук", "type": "Модерация"},
            {"time": "01:30", "description": "Потенциальное нарушение правил: упоминание запрещенных веществ", "type": "18+"},
            {"time": "02:45", "description": "Вирусный момент: неожиданная шутка", "type": "Вирусный"},
            {"time": "03:45", "description": "Подходящий момент для рекламы", "type": "Реклама"}
        ],
        "sentimentAnalysis": [
            {"name": "00:00 - 01:30", "value": 0.2},
            {"name": "01:31 - 03:00", "value": 0.8},
            {"name": "03:01 - 06:30", "value": 0.9}
        ],
        "overallSentiment": {
            "tone": "Позитивная",
            "value": 0.7
        },
        "keywordAnalysis": [
            {"word": "криптовалюта", "count": 5, "type": "Сленг"},
            {"word": "artificial intelligence", "count": 3, "type": "Иностранные слова"},
            {"word": "блокчейн", "count": 2, "type": "Сленг"}
        ],
        "textLabels": ["Highlights", "Base", "18+", "Gray", "Black"]
    }

def generate_mock_audio_analysis():
    return {
        "keyEvents": [
            {"time": "00:30", "description": "Событие 1"},
            {"time": "02:15", "description": "Событие 2"},
            {"time": "04:00", "description": "Событие 3"}
        ],
        "soundEffects": ["Выстрел", "Взрыв", "Сирена"],
        "musicPatterns": ["Рок", "Классика", "Электронная"],
        "labels": ["Highlights", "Base", "18+", "Gray", "Black"]
    }

def generate_mock_symbols_analysis():
    return {
        "detectedSymbols": [
            {"time": "00:45", "description": "Символ 1"},
            {"time": "02:30", "description": "Символ 2"},
            {"time": "03:15", "description": "Символ 3"}
        ],
        "riskAnalysis": {
            "overallRisk": 0.5,
            "riskLevel": "Средний",
            "riskLabel": "Потенциально опасный"
        },
        "labels": ["Highlights", "Base", "18+", "Gray", "Black"]
    }

def generate_mock_objects_analysis():
    return {
        "objectCategories": ["Люди", "Предметы", "Природа", "Транспорт"],
        "keyObjects": [
            {"time": "01:00", "description": "Объект 1"},
            {"time": "03:45", "description": "Объект 2"},
            {"time": "05:30", "description": "Объект 3"}
        ],
        "labels": ["Highlights", "Base", "18+", "Gray", "Black"]
    }

def generate_mock_poi_analysis():
    return {
        "heatZones": [
            {"time": "00:30 - 00:45", "description": "Мимика"},
            {"time": "02:15 - 02:30", "description": "Движущийся объект"},
            {"time": "04:00 - 04:15", "description": "Текст на экране"}
        ],
        "heatZoneCoordinates": [
            {"x": 100, "y": 200, "area": 5000},
            {"x": 300, "y": 150, "area": 3000},
            {"x": 500, "y": 400, "area": 2000}
        ]
    }

def generate_mock_scenes_analysis():
    return {
        "sceneTypes": ["Действие", "Диалог", "Пейзаж", "Монтаж"],
        "keyScenes": [
            {"time": "00:00 - 01:30", "type": "Действие"},
            {"time": "01:31 - 03:00", "type": "Диалог"},
            {"time": "03:01 - 04:30", "type": "Пейзаж"}
        ],
        "labels": ["Highlights", "Base", "18+", "Gray", "Black"]
    }

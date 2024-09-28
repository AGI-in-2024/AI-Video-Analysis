import whisper
from .audio import extract_audio_from_video
from transformers import pipeline
from collections import Counter
import numpy as np
import torch

def transcribe_audio_pipeline(video_path: str, output_audio_path: str) -> dict:
    try:
        # Step 1: Extract audio from the video
        extract_audio_from_video(video_path, output_audio_path)

        # Step 2: Transcribe audio using Whisper
        device = "cuda" if torch.cuda.is_available() else "cpu"
        model = whisper.load_model("base").to(device)
        result = model.transcribe(output_audio_path)

        # Step 3: Perform additional analysis
        analysis = analyze_transcription(result["text"])

        return {
            "transcription": result["text"],
            "analysis": analysis
        }
    except Exception as e:
        print(f"Error in transcribe_audio_pipeline: {str(e)}")
        return {
            "transcription": "",
            "analysis": {
                "generationStatus": {"success": False, "model": "Whisper-Base"},
                "languages": [{"name": "Unknown", "primary": True}],
                "keyEvents": [],
                "sentimentAnalysis": [],
                "overallSentiment": {"tone": "Unknown", "value": 0},
                "keywordAnalysis": [],
                "textLabels": ["Error"]
            }
        }

def analyze_transcription(text: str) -> dict:
    """
    Analyze the transcribed text to generate additional insights.
    """
    # Use a more advanced sentiment analysis model
    sentiment_pipeline = pipeline("sentiment-analysis", model="distilbert-base-uncased-finetuned-sst-2-english", device=0 if torch.cuda.is_available() else -1)
    
    # Keyword extraction
    keyword_extractor = pipeline("ner", model="dbmdz/bert-large-cased-finetuned-conll03-english", device=0 if torch.cuda.is_available() else -1)
    
    # Sentiment analysis
    sentiment_result = sentiment_pipeline(text)[0]
    sentiment = sentiment_result['score'] if sentiment_result['label'] == 'POSITIVE' else -sentiment_result['score']
    
    # Keyword analysis
    ner_results = keyword_extractor(text)
    keywords = Counter([item['word'] for item in ner_results])
    top_keywords = [{"word": word, "count": count} for word, count in keywords.most_common(10)]
    
    # Simple key events detection (based on sentence sentiment)
    sentences = text.split('.')
    key_events = []
    for i, sentence in enumerate(sentences):
        if sentence.strip():
            sentence_sentiment = sentiment_pipeline(sentence)[0]
            if abs(sentence_sentiment['score']) > 0.8:
                key_events.append({
                    "time": f"{i * 30:02d}:{00:02d}",  # Rough estimate of time
                    "description": sentence.strip(),
                    "type": sentence_sentiment['label']
                })
    
    # Overall sentiment
    overall_sentiment = "Positive" if sentiment > 0 else "Negative" if sentiment < 0 else "Neutral"
    
    return {
        "generationStatus": {
            "success": True,
            "model": "Whisper-Base + DistilBERT"
        },
        "languages": [
            {"name": "English", "primary": True}  # Whisper auto-detects language, but we're simplifying here
        ],
        "keyEvents": key_events[:4],  # Limit to 4 key events
        "sentimentAnalysis": [
            {"name": f"{i*60:02d}:00 - {(i+1)*60:02d}:00", "value": np.mean([sentiment_pipeline(s)[0]['score'] for s in sentences[i*60:(i+1)*60]])}
            for i in range(len(sentences) // 60 + 1)
        ],
        "overallSentiment": {
            "tone": overall_sentiment,
            "value": sentiment
        },
        "keywordAnalysis": top_keywords,
        "textLabels": ["Base", "AI-Analyzed"]
    }
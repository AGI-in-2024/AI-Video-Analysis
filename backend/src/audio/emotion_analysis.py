import torch
import torch.nn.functional as F
import torchaudio
from transformers import AutoConfig, AutoModelForAudioClassification, Wav2Vec2FeatureExtractor
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Set device
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
logger.info(f"Using device: {device}")

def speech_file_to_array_fn(path, sampling_rate):
    speech_array, _sampling_rate = torchaudio.load(path)
    resampler = torchaudio.transforms.Resample(_sampling_rate)
    speech = resampler(speech_array).squeeze().numpy()
    return speech

def predict(path, sampling_rate):
    try:
        speech = speech_file_to_array_fn(path, sampling_rate)
        inputs = feature_extractor(speech, sampling_rate=sampling_rate, return_tensors="pt", padding=True)
        inputs = {key: inputs[key].to(device) for key in inputs}

        with torch.no_grad():
            logits = model(**inputs).logits

        scores = F.softmax(logits, dim=1).detach().cpu().numpy()[0]
        outputs = [{"Emotion": config.id2label[i], "Score": f"{round(score * 100, 3):.1f}%"} for i, score in enumerate(scores)]
        return outputs
    except Exception as e:
        logger.error(f"Error in emotion prediction: {str(e)}")
        return [{"Emotion": "Unknown", "Score": "100.0%"}]

# Configuration
TRUST = True
MODEL_NAME = 'Aniemore/wav2vec2-xlsr-53-russian-emotion-recognition'

# Load model and configuration
try:
    config = AutoConfig.from_pretrained(MODEL_NAME, trust_remote_code=TRUST)
    model = AutoModelForAudioClassification.from_pretrained(MODEL_NAME, config=config, trust_remote_code=TRUST)
    feature_extractor = Wav2Vec2FeatureExtractor.from_pretrained(MODEL_NAME)

    model.to(device)
    logger.info("Emotion analysis model loaded successfully")
except Exception as e:
    logger.error(f"Error loading emotion analysis model: {str(e)}")
    logger.info("Using fallback emotion analysis")
    
    # Fallback function
    def predict(path, sampling_rate):
        logger.warning("Using fallback emotion prediction")
        return [{"Emotion": "Unknown", "Score": "100.0%"}]

def predict_emotion(audio_path, sample_rate):
    # Your emotion prediction logic here
    # ...
    
    # Return a list of dictionaries with "Emotion" and "Score" keys
    return [
        {"Emotion": "Happy", "Score": "0.7"},
        {"Emotion": "Sad", "Score": "0.2"},
        {"Emotion": "Neutral", "Score": "0.1"}
    ]
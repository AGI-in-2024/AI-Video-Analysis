import moviepy.editor as mp
import librosa
import numpy as np
import torch
import torchaudio

def extract_audio_from_video(video_path, audio_path):
    try:
        video = mp.VideoFileClip(video_path)
        if video.audio is None:
            raise ValueError("The video file does not contain an audio track.")
        video.audio.write_audiofile(audio_path)
        video.close()
    except Exception as e:
        raise ValueError(f"Error extracting audio: {str(e)}")

def analyze_audio(audio_path):
    """
    Perform advanced audio analysis using librosa and torchaudio.
    """
    # Load audio using torchaudio
    waveform, sample_rate = torchaudio.load(audio_path)
    
    # Convert to mono if stereo
    if waveform.shape[0] > 1:
        waveform = torch.mean(waveform, dim=0, keepdim=True)
    
    # Convert to numpy array for librosa compatibility
    y = waveform.numpy().squeeze()
    
    # Detect onset strength
    onset_env = librosa.onset.onset_strength(y=y, sr=sample_rate)
    
    # Detect tempo
    tempo, _ = librosa.beat.beat_track(onset_envelope=onset_env, sr=sample_rate)
    
    # Detect pitch
    pitches, magnitudes = librosa.piptrack(y=y, sr=sample_rate)
    
    # Mel spectrogram
    mel_spec = librosa.feature.melspectrogram(y=y, sr=sample_rate)
    
    # Chromagram
    chroma = librosa.feature.chroma_stft(y=y, sr=sample_rate)
    
    return {
        "duration": len(y) / sample_rate,
        "tempo": tempo,
        "pitch_mean": np.mean(pitches[magnitudes > np.max(magnitudes)/10]),
        "loudness": np.mean(librosa.feature.rms(y=y)),
        "mel_spec_mean": np.mean(mel_spec),
        "chroma_mean": np.mean(chroma)
    }
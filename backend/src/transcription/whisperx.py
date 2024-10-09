import os
import whisperx
import torch
import gc

# Set current working directory
while os.getcwd().split(os.sep)[-1] != "secret-repo":
    os.chdir("..")

# Configure device and settings
device = "cuda"
audio_file = "/home/dukhanin/secret-repo/backend/test_set/y2mate.com - 1 minute funny videos_480.mp4"
batch_size = 32
compute_type = "float16"

YOUR_HF_TOKEN = "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"
# Enable TensorFloat-32 (TF32)
torch.backends.cuda.matmul.allow_tf32 = True
torch.backends.cudnn.allow_tf32 = True

# Load and transcribe audio
model = whisperx.load_model("large-v2", device, compute_type=compute_type, language="ru")
audio = whisperx.load_audio(audio_file)
result = model.transcribe(audio, batch_size=batch_size)
print(result["segments"])  # before alignment

# Align whisper output
model_a, metadata = whisperx.load_align_model(language_code=result["language"], device=device)
result = whisperx.align(result["segments"], model_a, metadata, audio, device, return_char_alignments=False)
print(result["segments"])  # after alignment

# Assign speaker labels
diarize_model = whisperx.DiarizationPipeline(use_auth_token=YOUR_HF_TOKEN, device=device)
diarize_segments = diarize_model(audio)
result = whisperx.assign_word_speakers(diarize_segments, result)
print(diarize_segments)
print(result["segments"])  # segments are now assigned speaker IDs

# Optionally, uncomment these lines if you need to free up GPU resources
# gc.collect()
# torch.cuda.empty_cache()
# del model
# del model_a
# del diarize_model
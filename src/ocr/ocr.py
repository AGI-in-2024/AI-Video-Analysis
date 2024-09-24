import cv2
import torch
from transformers import TrOCRProcessor, VisionEncoderDecoderModel
from PIL import Image
import tempfile
import os


def extract_frames_from_video(video_binary, frame_rate=1):
    """
    Extract frames from the video.

    Parameters:
    - video_binary (bytes): The video file as binary data.
    - frame_rate (int): The frame extraction frequency (e.g., 1 = every frame, 2 = every second frame, etc.).

    Returns:
    - list: A list of extracted frames in PIL.Image format.
    """
    temp_video = tempfile.NamedTemporaryFile(delete=False, suffix='.mp4')
    temp_video.write(video_binary)
    temp_video.close()

    cap = cv2.VideoCapture(temp_video.name)
    frames = []
    frame_count = 0

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        if frame_count % frame_rate == 0:
            # Convert OpenCV image to PIL.Image format
            pil_image = Image.fromarray(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))
            frames.append((frame_count, pil_image))  # Store frame number and image

        frame_count += 1

    cap.release()
    os.remove(temp_video.name)
    return frames


def extract_text_from_frames(frames):
    """
    Apply OCR on frames using the TrOCR model.

    Parameters:
    - frames (list): List of tuples (frame_number, PIL.Image) for text recognition.

    Returns:
    - dict: A dictionary where keys are frame numbers and values are recognized text.
    """
    # Load the model and processor
    processor = TrOCRProcessor.from_pretrained("raxtemur/trocr-base-ru")
    model = VisionEncoderDecoderModel.from_pretrained("raxtemur/trocr-base-ru")
    model.eval()

    recognized_text = {}

    for frame_number, frame in frames:
        # Prepare the image for the model
        pixel_values = processor(images=frame, return_tensors="pt").pixel_values

        # Perform inference
        with torch.no_grad():
            generated_ids = model.generate(pixel_values)

        # Decode the result into text
        decoded_text = processor.batch_decode(generated_ids, skip_special_tokens=True)[0]
        recognized_text[frame_number] = decoded_text

    return recognized_text


def ocr_trocr_ru(video_binary, frame_rate=1):
    """
    Pipeline to extract text from video using TrOCR.

    Parameters:
    - video_binary (bytes): The video file as binary data.
    - frame_rate (int): The frame extraction frequency (e.g., 1 = every frame, 2 = every second frame, etc.).

    Returns:
    - dict: A dictionary where keys are frame numbers and values are recognized text.
    """
    # Extract frames from the video
    frames = extract_frames_from_video(video_binary, frame_rate=frame_rate)

    # Apply OCR on the frames
    recognized_text = extract_text_from_frames(frames)

    return recognized_text

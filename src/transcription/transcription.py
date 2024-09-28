import requests
import time
from .audio import extract_audio_from_video


API_URL = "http://localhost:8000/transcribe/"
STATUS_URL = "http://localhost:8000/transcribe/status/"
RESULT_URL = "http://localhost:8000/transcribe/result/"


def upload_audio_for_transcription(audio_path: str) -> str:
    """
    Upload audio file to FastAPI service for transcription.

    Parameters:
    - audio_path (str): Path to the audio file.

    Returns:
    - task_id (str): Task ID returned by the server to track the transcription status.
    """
    with open(audio_path, 'rb') as audio_file:
        files = {'file': audio_file}
        response = requests.post(API_URL, files=files)

    if response.status_code == 200:
        task_id = response.json().get('task_id')
        print(f"Task ID: {task_id}")
        return task_id
    else:
        raise Exception(f"Error: {response.status_code}, {response.text}")


def check_transcription_status(task_id: str) -> str:
    """
    Check the status of the transcription task.

    Parameters:
    - task_id (str): The task ID to track the transcription status.

    Returns:
    - status (str): The current status of the transcription task.
    """
    response = requests.get(f"{STATUS_URL}{task_id}")

    if response.status_code == 200:
        status = response.json().get('status')
        print(f"Status: {status}")
        return status
    else:
        raise Exception(f"Error: {response.status_code}, {response.text}")


def get_transcription_result(task_id: str) -> dict:
    """
    Get the transcription result once the task is completed.

    Parameters:
    - task_id (str): The task ID to retrieve the transcription result.

    Returns:
    - dict: The transcription result.
    """
    response = requests.get(f"{RESULT_URL}{task_id}")

    if response.status_code == 200:
        result = response.json().get('result')
        return result
    else:
        raise Exception(f"Error: {response.status_code}, {response.text}")


def transcribe_audio_pipeline(video_path: str, output_audio_path: str) -> dict:
    """
    Full pipeline to transcribe audio from video.

    Parameters:
    - video_path (str): Path to the video file.
    - output_audio_path (str): Path to save the extracted audio.

    Returns:
    - dict: The transcription result.
    """
    # Step 1: Extract audio from the video
    extract_audio_from_video(video_path, output_audio_path)

    # Step 2: Upload the audio to the transcription service
    task_id = upload_audio_for_transcription(output_audio_path)

    # Step 3: Poll for the transcription status
    status = check_transcription_status(task_id)
    while status != 'completed':
        time.sleep(10)  # Wait for 10 seconds before checking again
        status = check_transcription_status(task_id)

    # Step 4: Get the transcription result
    result = get_transcription_result(task_id)
    return result

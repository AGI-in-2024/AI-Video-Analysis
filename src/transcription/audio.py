from moviepy.editor import VideoFileClip


def extract_audio_from_video(video_path: str, output_audio_path: str) -> None:
    """
    Extract audio from a video file.

    Parameters:
    - video_path (str): Path to the input video file.
    - output_audio_path (str): Path to save the extracted audio.
    """
    video = VideoFileClip(video_path)
    video.audio.write_audiofile(output_audio_path)

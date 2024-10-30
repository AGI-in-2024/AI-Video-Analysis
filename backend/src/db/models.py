import enum

from datetime import datetime
from pytz import UTC

from sqlalchemy import PrimaryKeyConstraint, UniqueConstraint, Column, \
    Boolean, String, Integer, BigInteger, Date, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship, declarative_base


Base = declarative_base()


class VideoStatus(enum.Enum):
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class Video(Base):
    __tablename__ = "video"

    id = Column(Integer, primary_key=True, autoincrement=True)
    file_name = Column(String(255), nullable=True)
    description = Column(String(2048), nullable=True)
    duration = Column(Integer, nullable=True)
    created_on = Column(DateTime, default=datetime.now)
    updated_on = Column(DateTime, default=datetime.now, onupdate=datetime.now)
    status = Column(Enum(VideoStatus), default=VideoStatus.PROCESSING, nullable=False)

    # Relationships
    frames = relationship("Frame", back_populates="video")

    def to_dict(self):
        return {
            "id": self.id,
            "file_name": self.file_name,
            "description": self.description,
            "duration": self.duration,
            "created_on": self.created_on.isoformat() if self.created_on else None,
            "updated_on": self.updated_on.isoformat() if self.updated_on else None,
            "status": self.status.name if self.status else None,
            "frames": [frame.to_dict() for frame in self.frames] if self.frames else []
        }
    

    def __repr__(self):
        return f"<Video(id={self.id}, title={self.file_name}, status={self.status})>"


class Frame(Base):
    __tablename__ = "frame"

    id = Column(String(100), primary_key=True, unique=True)
    video_id = Column(BigInteger, ForeignKey("video.id"), nullable=False)
    frame_number = Column(Integer, nullable=False)
    timestamp = Column(DateTime, nullable=False)

    # Relationships
    video = relationship("Video", back_populates="frames")

    def __repr__(self):
        return f"<Frame(id={self.id}, video_id={self.video_id}, frame_number={self.frame_number})>"


if __name__ == "__main__":
    from config import engine

    Base.metadata.drop_all(engine)
    Base.metadata.create_all(engine)
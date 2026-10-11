from datetime import datetime

from sqlalchemy import (
    Column,
    Date,
    DateTime,
    ForeignKey,
    Index,
    Integer,
    String,
    Time,
    UniqueConstraint,
)
from sqlalchemy.orm import relationship

from app.db.base import Base


class Attendance(Base):
    """
    Attendance records per Student + Subject + Date + Period + Status.
    Allows up to 7 distinct periods per day across multiple subjects.
    """
    __tablename__ = "attendance"

    __table_args__ = (
        UniqueConstraint("user_id", "date", "subject_id", "period", name="uq_attendance_user_date_subject_period"),
        Index("ix_attendance_date", "date"),
    )

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    subject_id = Column(Integer, ForeignKey("subjects.id", ondelete="SET NULL"), nullable=True, index=True)
    date = Column(Date, nullable=False)
    period = Column(Integer, default=1, nullable=True)  # Period 1..7
    time_in = Column(Time, nullable=True)
    status = Column(String, nullable=False)  # "present" or "absent"
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="attendances")
    subject = relationship("Subject", backref="attendances")

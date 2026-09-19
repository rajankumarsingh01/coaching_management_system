from pydantic import BaseModel
from typing import List, Optional

class TopicStat(BaseModel):
    topic: str
    correct: int
    total: int
    percentage: int

class AttendanceSummary(BaseModel):
    total: int
    present: int
    percentage: int

class FeeSummary(BaseModel):
    paid_amount: float
    pending_amount: float
    next_due_date: Optional[str] = None

class ParentReportRequest(BaseModel):
    student_name: str
    attendance: AttendanceSummary
    fees: FeeSummary
    weak_topics: List[TopicStat]
    all_topics: List[TopicStat]

class ParentReportResponse(BaseModel):
    report: str
from pydantic import BaseModel
from typing import List

class TopicStat(BaseModel):
    topic: str
    correct: int
    total: int
    percentage: int

class StudyPlanRequest(BaseModel):
    student_name: str
    weak_topics: List[TopicStat]
    all_topics: List[TopicStat]

class StudyPlanResponse(BaseModel):
    plan: str
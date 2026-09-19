from pydantic import BaseModel
from typing import Optional, List

class QuestionItem(BaseModel):
    questionText: str
    optionA: str
    optionB: str
    optionC: str
    optionD: str
    correctAnswer: str
    topic: str

class GenerateQuestionsRequest(BaseModel):
    topic: str
    count: int
    difficulty: Optional[str] = "medium"
    institute_id: str

class GenerateQuestionsResponse(BaseModel):
    questions: List[QuestionItem]
    grounded_in_notes: bool  # teacher ko batane ke liye ki notes use hue ya generic knowledge
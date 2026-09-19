from pydantic import BaseModel
from typing import Optional

class DoubtRequest(BaseModel):
    question: str = ""
    subject: Optional[str] = None
    image_url: Optional[str] = None
    institute_id: str = ""   # NEW — retrieval isi se filter hoga

class DoubtResponse(BaseModel):
    answer: str
    subject: str
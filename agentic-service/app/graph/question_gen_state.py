from typing import TypedDict, List, Optional

class QuestionGenState(TypedDict):
    topic: str
    count: int
    difficulty: str
    institute_id: str

    context_chunks: List[dict]
    grounded_in_notes: bool

    draft_questions: List[dict]

    validate_status: str      # "good" | "retry"
    validate_feedback: str
    retry_count: int
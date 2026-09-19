from typing import TypedDict, Optional, List

# TypedDict — ek "typed dictionary". Har node isi shape ka dict le kar
# aata hai aur isi shape ka (partial) dict return karta hai. LangGraph
# automatically returned keys ko existing state mein merge kar deta hai.
class DoubtState(TypedDict):
    question: str
    subject: Optional[str]
    image_url: Optional[str]
    institute_id: str

    context_chunks: List[dict]      # retrieve node fill karega

    draft_answer: str               # reason node fill karega
    draft_subject: str

    verify_status: str              # "good" ya "retry"
    verify_feedback: str            # sirf tab jab "retry" ho
    retry_count: int
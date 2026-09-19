from pydantic import BaseModel

class IngestNoteRequest(BaseModel):
    note_id: str
    file_url: str
    institute_id: str
    batch_id: str
    title: str

class IngestNoteResponse(BaseModel):
    note_id: str
    chunks_indexed: int
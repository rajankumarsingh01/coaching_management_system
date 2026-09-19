import io
import requests
from pypdf import PdfReader
from langchain_text_splitters import RecursiveCharacterTextSplitter

from app.core.mongo import note_chunks_collection
from app.services.embeddings import embed_document_chunk
from app.schemas.notes import IngestNoteRequest

# chunk_size=1000 chars, overlap=150 — overlap isliye taaki ek concept jo
# do chunks ke beech "cut" ho jaye, usका context dono chunks mein thoda-thoda rahe.
splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=150)


def extract_pdf_text(file_url: str) -> str:
    response = requests.get(file_url, timeout=30)
    response.raise_for_status()
    reader = PdfReader(io.BytesIO(response.content))
    pages_text = [page.extract_text() or "" for page in reader.pages]
    return "\n".join(pages_text)


def ingest_note(payload: IngestNoteRequest) -> int:
    """
    PDF download -> text extract -> chunk -> embed -> Mongo mein store.
    Yeh function BackgroundTasks se sync context mein call hota hai,
    isliye normal (non-async) function hai — FastAPI isko khud
    threadpool mein chalata hai, event loop block nahi hota.
    """
    # Agar note pehle se ingest ho chuka tha (re-upload/edit case), purane
    # chunks hata do pehle — warna duplicate/stale data reh jayega.
    note_chunks_collection.delete_many({"noteId": payload.note_id})

    full_text = extract_pdf_text(payload.file_url)
    if not full_text.strip():
        return 0  # scanned/image-only PDF — text nahi mila, skip

    chunks = splitter.split_text(full_text)

    documents = []
    for idx, chunk_text in enumerate(chunks):
        embedding = embed_document_chunk(chunk_text)
        documents.append({
            "noteId": payload.note_id,
            "instituteId": payload.institute_id,
            "batchId": payload.batch_id,
            "title": payload.title,
            "chunkIndex": idx,
            "text": chunk_text,
            "embedding": embedding,
        })

    if documents:
        note_chunks_collection.insert_many(documents)

    return len(documents)


def delete_note_chunks(note_id: str) -> int:
    result = note_chunks_collection.delete_many({"noteId": note_id})
    return result.deleted_count
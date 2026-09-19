from fastapi import APIRouter, BackgroundTasks, Request
from app.schemas.notes import IngestNoteRequest, IngestNoteResponse
from app.services.notes_ingest import ingest_note, delete_note_chunks
from app.core.logging_config import logger
from app.core.rate_limit import limiter

router = APIRouter(prefix="/notes")


def _run_ingest(payload: IngestNoteRequest):
    try:
        count = ingest_note(payload)
        logger.info(f"[ingest] note_id={payload.note_id} -> {count} chunks indexed")
    except Exception:
        logger.exception(f"[ingest] note_id={payload.note_id} FAILED")


@router.post("/ingest", response_model=IngestNoteResponse)
@limiter.limit("5/minute")
async def ingest_note_endpoint(request: Request, payload: IngestNoteRequest, background_tasks: BackgroundTasks):
    background_tasks.add_task(_run_ingest, payload)
    return IngestNoteResponse(note_id=payload.note_id, chunks_indexed=0)


@router.delete("/{note_id}")
async def delete_note_endpoint(note_id: str):
    deleted = delete_note_chunks(note_id)
    logger.info(f"[delete] note_id={note_id} -> {deleted} chunks removed")
    return {"note_id": note_id, "chunks_deleted": deleted}
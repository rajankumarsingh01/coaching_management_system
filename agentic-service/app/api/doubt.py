from fastapi import APIRouter, Request
from app.schemas.doubt import DoubtRequest, DoubtResponse
from app.graph.doubt_graph import run_doubt_graph
from app.core.rate_limit import limiter

router = APIRouter()


@router.post("/doubt", response_model=DoubtResponse)
@limiter.limit("20/minute")
async def ask_doubt(request: Request, payload: DoubtRequest):
    result = await run_doubt_graph(payload)
    return DoubtResponse(answer=result["answer"], subject=result["subject"])
from fastapi import APIRouter, Request
from app.schemas.question_gen import GenerateQuestionsRequest, GenerateQuestionsResponse
from app.graph.question_gen_graph import run_question_gen_graph
from app.core.rate_limit import limiter

router = APIRouter(prefix="/questions")


@router.post("/generate", response_model=GenerateQuestionsResponse)
@limiter.limit("10/minute")
async def generate_questions_endpoint(request: Request, payload: GenerateQuestionsRequest):
    result = await run_question_gen_graph(payload)
    return GenerateQuestionsResponse(**result)
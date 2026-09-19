from fastapi import APIRouter, Request
from app.schemas.study_plan import StudyPlanRequest, StudyPlanResponse
from app.chains.study_plan_chain import run_study_plan_chain
from app.core.rate_limit import limiter

router = APIRouter()


@router.post("/study-plan", response_model=StudyPlanResponse)
@limiter.limit("10/minute")
async def generate_study_plan(request: Request, payload: StudyPlanRequest):
    plan = await run_study_plan_chain(payload)
    return StudyPlanResponse(plan=plan)
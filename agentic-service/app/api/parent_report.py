from fastapi import APIRouter, Request
from app.schemas.parent_report import ParentReportRequest, ParentReportResponse
from app.chains.parent_report_chain import run_parent_report_chain
from app.core.rate_limit import limiter

router = APIRouter()


@router.post("/parent-report", response_model=ParentReportResponse)
@limiter.limit("10/minute")
async def generate_parent_report(request: Request, payload: ParentReportRequest):
    report = await run_parent_report_chain(payload)
    return ParentReportResponse(report=report)
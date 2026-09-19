import time
from fastapi import FastAPI, Request
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from app.core.config import settings
from app.core.logging_config import logger
from app.core.rate_limit import limiter
from app.api.doubt import router as doubt_router
from app.api.notes import router as notes_router
from app.api.study_plan import router as study_plan_router
from app.api.question_gen import router as question_gen_router
from app.api.parent_report import router as parent_report_router

app = FastAPI(title="Sankalp Agentic Service", version="0.1.0")

# Rate limiter — Step C mein use hoga
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.include_router(doubt_router)
app.include_router(notes_router)
app.include_router(study_plan_router)
app.include_router(question_gen_router)
app.include_router(parent_report_router)


# Request logging middleware — har request ke liye method, path, status,
# aur time-taken automatically log karta hai. Express ke 'morgan' jaisa.
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start = time.time()
    response = await call_next(request)
    duration_ms = round((time.time() - start) * 1000, 1)
    logger.info(f"{request.method} {request.url.path} -> {response.status_code} ({duration_ms}ms)")
    return response


@app.get("/health")
def health_check():
    return {"status": "ok", "service": "agentic-service"}

@app.get("/ping")
def ping():
    return {"message": "pong from Python agentic-service 🐍"}
from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage, HumanMessage
from app.core.config import settings
from app.schemas.parent_report import ParentReportRequest

SYSTEM_PROMPT = """You are writing a short, friendly progress summary for a parent about their child
studying at a coaching institute. The parent may not be familiar with technical/academic terms.

Rules:
- Cover three things briefly: attendance, fee status, and academic performance (weak topics if any).
- Use simple, warm, non-alarming language — even for bad news, be constructive (e.g. suggest they
  talk to the child or the institute, don't just state a problem coldly).
- Keep it short — 4 to 6 sentences total, not a long essay.
- Respond in Hinglish (Hindi-English mix), the way an institute staff member would speak to a parent.
- Do NOT use technical jargon like "percentage", "topic-wise accuracy" etc. — describe things plainly
  ("bachche ki 3 out of 5 classes attend hui hain" instead of "60% attendance")."""

llm = ChatOpenAI(
    model="openrouter/free",
    api_key=settings.openrouter_api_key,
    base_url="https://openrouter.ai/api/v1",
    temperature=0.5,
    max_tokens=500,
    default_headers={
        "HTTP-Referer": "https://your-institute-app.com",
        "X-Title": "Coaching App Parent Report",
    },
)


async def run_parent_report_chain(payload: ParentReportRequest) -> str:
    weak_lines = (
        "\n".join(f"- {t.topic}: {t.percentage}% accuracy" for t in payload.weak_topics)
        or "(no weak topics detected)"
    )

    human_prompt = f"""Student: {payload.student_name}

Attendance: {payload.attendance.present} out of {payload.attendance.total} classes attended ({payload.attendance.percentage}%)

Fees: Paid so far = Rs. {payload.fees.paid_amount}, Pending = Rs. {payload.fees.pending_amount}
{"Next due date: " + payload.fees.next_due_date if payload.fees.next_due_date else "No pending dues"}

Weak topics (below 50% test accuracy):
{weak_lines}

Write the parent-friendly summary now."""

    ai_message = await llm.ainvoke([
        SystemMessage(content=SYSTEM_PROMPT),
        HumanMessage(content=human_prompt),
    ])
    return ai_message.content.strip()
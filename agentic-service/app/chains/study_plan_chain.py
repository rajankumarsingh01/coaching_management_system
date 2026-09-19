from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage, HumanMessage
from app.core.config import settings
from app.schemas.study_plan import StudyPlanRequest

SYSTEM_PROMPT = """You are an academic mentor creating a personalized study plan for a school/coaching institute student, based on their test performance data.

Rules:
- Focus mainly on the weak topics (below 50% accuracy) — these need the most attention.
- For each weak topic, suggest a concrete, actionable next step (e.g. "revise the basics of X, then practice Y kind of numericals").
- Briefly acknowledge strong topics too (encouragement matters), but don't spend much time on them.
- Keep it organized — use a short intro line, then a clear list per topic.
- Keep it realistic — don't suggest an overwhelming number of things to do at once. Prioritize the weakest 2-3 topics.
- Respond in Hinglish (Hindi-English mix), friendly and encouraging tone — this is for a student, not a formal report.
- Do NOT include any tag like [Subject: X] — that's not needed here."""

llm = ChatOpenAI(
    model="openrouter/free",
    api_key=settings.openrouter_api_key,
    base_url="https://openrouter.ai/api/v1",
    temperature=0.5,
    max_tokens=800,
    default_headers={
        "HTTP-Referer": "https://your-institute-app.com",
        "X-Title": "Coaching App Study Planner",
    },
)


def format_topic_line(t) -> str:
    return f"- {t.topic}: {t.correct}/{t.total} correct ({t.percentage}%)"


async def run_study_plan_chain(payload: StudyPlanRequest) -> str:
    if not payload.weak_topics:
        # Koi weak topic hi nahi hai — LLM ko call karne ki zaroorat nahi,
        # seedha ek fixed encouraging message de do (fast + free).
        return (
            f"Great job, {payload.student_name}! 🎉 Abhi koi weak topic detect nahi hua "
            "tumhare test results mein — sab topics mein 50% se zyada accuracy hai. "
            "Aise hi consistent rehna, aur naye tests attempt karte raho!"
        )

    weak_lines = "\n".join(format_topic_line(t) for t in payload.weak_topics)
    strong_topics = [t for t in payload.all_topics if t.percentage >= 50]
    strong_lines = "\n".join(format_topic_line(t) for t in strong_topics) or "(none yet)"

    human_prompt = f"""Student name: {payload.student_name}

Weak topics (below 50% accuracy):
{weak_lines}

Other topics (50%+ accuracy):
{strong_lines}

Generate a personalized study plan for this student."""

    ai_message = await llm.ainvoke([
        SystemMessage(content=SYSTEM_PROMPT),
        HumanMessage(content=human_prompt),
    ])
    return ai_message.content
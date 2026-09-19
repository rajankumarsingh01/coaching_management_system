import json
import re
from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage, HumanMessage
from app.core.config import settings
from app.services.retrieval import get_relevant_chunks
from app.graph.question_gen_state import QuestionGenState

MAX_RETRIES = 1
VALID_OPTIONS = {"A", "B", "C", "D"}

llm = ChatOpenAI(
    model="openrouter/free",
    api_key=settings.openrouter_api_key,
    base_url="https://openrouter.ai/api/v1",
    temperature=0.5,
    max_tokens=1800,
    default_headers={
        "HTTP-Referer": "https://your-institute-app.com",
        "X-Title": "Coaching App Question Generator",
    },
)


# ---------- Node 1: retrieve ----------
async def retrieve_node(state: QuestionGenState) -> dict:
    chunks = get_relevant_chunks(state["topic"], state["institute_id"], k=5)
    return {"context_chunks": chunks, "grounded_in_notes": len(chunks) > 0}


# ---------- Node 2: generate ----------
def extract_json_array(raw: str) -> list:
    cleaned = re.sub(r"```json|```", "", raw).strip()
    first, last = cleaned.find("["), cleaned.rfind("]")
    if first != -1 and last != -1 and last > first:
        cleaned = cleaned[first : last + 1]
    return json.loads(cleaned)


async def generate_node(state: QuestionGenState) -> dict:
    context_chunks = state.get("context_chunks") or []
    feedback = state.get("validate_feedback")

    context_block = ""
    if context_chunks:
        joined = "\n---\n".join(c["text"] for c in context_chunks)
        context_block = (
            f"\n\nBase the questions strictly on this reference material from the institute's notes "
            f"(don't invent facts outside of it):\n{joined}\n"
        )

    feedback_block = (
        f"\n\nYour previous attempt had an issue: {feedback} Please fix this."
        if feedback
        else ""
    )

    prompt = f"""Generate {state['count']} multiple-choice questions (MCQs) for a school/coaching test.
Topic: {state['topic']}
Difficulty: {state['difficulty']}{context_block}{feedback_block}

Respond ONLY with a valid JSON array, no other text, no markdown code fences, in exactly this format:
[{{"questionText": "...", "optionA": "...", "optionB": "...", "optionC": "...", "optionD": "...", "correctAnswer": "A", "topic": "{state['topic']}"}}]"""

    ai_message = await llm.ainvoke([HumanMessage(content=prompt)])

    try:
        parsed = extract_json_array(ai_message.content)
    except Exception:
        parsed = []

    clean_questions = [
        {
            "questionText": q.get("questionText"),
            "optionA": q.get("optionA"),
            "optionB": q.get("optionB"),
            "optionC": q.get("optionC"),
            "optionD": q.get("optionD"),
            "correctAnswer": q.get("correctAnswer"),
            "topic": q.get("topic") or state["topic"],
        }
        for q in parsed
        if isinstance(q, dict)
        and q.get("questionText")
        and q.get("optionA") and q.get("optionB") and q.get("optionC") and q.get("optionD")
        and q.get("correctAnswer") in VALID_OPTIONS
    ]

    return {"draft_questions": clean_questions}


# ---------- Node 3: validate (self-check) ----------
VALIDATE_SYSTEM_PROMPT = """You are a strict quality reviewer for MCQ test questions.

Check the given questions for:
1. Duplicate or near-identical options within the same question (bad question).
2. The correct answer option is clearly and unambiguously correct.
3. Each question is actually about the stated topic, not off-topic.
4. Questions aren't trivially easy or nonsensical.

Respond in EXACTLY this format, nothing else:
STATUS: GOOD
or
STATUS: RETRY
FEEDBACK: <one short sentence describing what's wrong>"""

VALIDATE_REGEX = re.compile(r"STATUS:\s*(GOOD|RETRY)\s*(?:\n+FEEDBACK:\s*(.+))?", re.IGNORECASE | re.DOTALL)


async def validate_node(state: QuestionGenState) -> dict:
    questions = state.get("draft_questions") or []
    retry_count = state.get("retry_count", 0)

    if not questions:
        # Kuch bhi nahi bana — generate node hi fail hua, retry se fayda nahi
        return {"validate_status": "good", "retry_count": retry_count}

    review_prompt = f"Topic: {state['topic']}\n\nQuestions to review:\n{json.dumps(questions, indent=2)}"
    ai_message = await llm.ainvoke([
        SystemMessage(content=VALIDATE_SYSTEM_PROMPT),
        HumanMessage(content=review_prompt),
    ])

    match = VALIDATE_REGEX.search(ai_message.content)

    if not match or match.group(1).upper() == "GOOD" or retry_count >= MAX_RETRIES:
        return {"validate_status": "good", "retry_count": retry_count}

    feedback = (match.group(2) or "some questions need improvement").strip()
    return {"validate_status": "retry", "validate_feedback": feedback, "retry_count": retry_count + 1}


def route_after_validate(state: QuestionGenState) -> str:
    return "generate" if state.get("validate_status") == "retry" else "end"
import re
from app.chains.doubt_chain import build_messages, llm, extract_subject_tag
from app.services.retrieval import get_relevant_chunks
from app.graph.state import DoubtState

MAX_RETRIES = 1  # ek hi retry allow karenge — RAM/rate-limit friendly rakhne ke liye


# ---------- Node 1: retrieve ----------
async def retrieve_node(state: DoubtState) -> dict:
    chunks = []
    # Photo doubts ke liye retrieval skip — image-only query text embed karna unreliable hota hai
    if state.get("question") and state.get("institute_id") and not state.get("image_url"):
        chunks = get_relevant_chunks(state["question"], state["institute_id"], k=4)
    return {"context_chunks": chunks}


# ---------- Node 2: reason (answer draft/redraft karo) ----------
async def reason_node(state: DoubtState) -> dict:
    messages = build_messages({
        "question": state.get("question"),
        "subject": state.get("subject"),
        "image_url": state.get("image_url"),
        "context_chunks": state.get("context_chunks"),
        "improvement_feedback": state.get("verify_feedback"),  # retry pe hi set hoga
    })

    ai_message = await llm.ainvoke(messages)
    raw_answer = ai_message.content

    answer, subject = extract_subject_tag(raw_answer, state.get("subject"))

    return {"draft_answer": answer, "draft_subject": subject}


# ---------- Node 3: verify (khud apna kaam check karo) ----------
VERIFY_SYSTEM_PROMPT = """You are a strict reviewer checking a tutoring app's answer to a student's doubt.

Check:
1. If the student's question was NOT academic, the answer should politely decline (not actually answer it).
2. If the question WAS academic, the answer should correctly and reasonably completely address it, and be step-by-step where relevant.
3. The answer should NOT contain a leftover "[Subject: X]" tag (it should already be stripped out).

Respond in EXACTLY this format, nothing else:
STATUS: GOOD
or
STATUS: RETRY
FEEDBACK: <one short sentence describing what's wrong>"""

VERIFY_REGEX = re.compile(r"STATUS:\s*(GOOD|RETRY)\s*(?:\n+FEEDBACK:\s*(.+))?", re.IGNORECASE | re.DOTALL)


async def verify_node(state: DoubtState) -> dict:
    from langchain_core.messages import SystemMessage, HumanMessage

    review_prompt = (
        f"Student's question: {state.get('question') or '(photo doubt, no text)'}\n\n"
        f"Answer to review:\n{state.get('draft_answer')}"
    )
    ai_message = await llm.ainvoke([
        SystemMessage(content=VERIFY_SYSTEM_PROMPT),
        HumanMessage(content=review_prompt),
    ])

    match = VERIFY_REGEX.search(ai_message.content)
    retry_count = state.get("retry_count", 0)

    if not match or match.group(1).upper() == "GOOD" or retry_count >= MAX_RETRIES:
        # Ya to "GOOD" mila, ya parse fail hua (fail-safe: aage badh jao),
        # ya retry limit khatam — dono case mein END ki taraf jayenge.
        return {"verify_status": "good", "retry_count": retry_count}

    feedback = (match.group(2) or "the answer needs improvement").strip()
    return {"verify_status": "retry", "verify_feedback": feedback, "retry_count": retry_count + 1}


# ---------- Conditional edge — verify ke baad kahan jaana hai ----------
def route_after_verify(state: DoubtState) -> str:
    return "reason" if state.get("verify_status") == "retry" else "end"
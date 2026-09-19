import json
import re
from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage, HumanMessage
from app.core.config import settings

JUDGE_SYSTEM_PROMPT = """You are an evaluator scoring an AI tutor's answer to a student's doubt.

Score two things, each from 1 (bad) to 5 (excellent):
1. "faithfulness" — Is the answer consistent with the provided reference context (if any)? Does it avoid making up facts not supported by the context or reasonable general knowledge?
2. "relevance" — Does the answer actually address the student's question, clearly and completely?

Respond with ONLY a single-line JSON object, nothing before or after it, in exactly this format:
{"faithfulness": <1-5>, "relevance": <1-5>, "reasoning": "<UNDER 12 WORDS>"}"""

llm_judge = ChatOpenAI(
    model="openrouter/free",
    api_key=settings.openrouter_api_key,
    base_url="https://openrouter.ai/api/v1",
    temperature=0,
    max_tokens=300,   # 200 se badhaya — truncation se bhi parse fail ho sakta tha
    default_headers={
        "HTTP-Referer": "https://your-institute-app.com",
        "X-Title": "Coaching App Eval Judge",
    },
)


def extract_json_object(raw: str) -> dict:
    # Model kabhi-kabhi JSON ke aage-peeche extra text/prose jod deta hai
    # (especially free-tier models), isliye bas pehli '{' se last '}' tak
    # nikaal lete hain — same trick jo question_gen mein array ke liye use ki thi.
    cleaned = re.sub(r"```json|```", "", raw).strip()
    first, last = cleaned.find("{"), cleaned.rfind("}")
    if first != -1 and last != -1 and last > first:
        cleaned = cleaned[first : last + 1]
    return json.loads(cleaned)


async def judge_answer(question: str, context_chunks: list, answer: str) -> dict:
    context_text = (
        "\n---\n".join(c["text"] for c in context_chunks)
        if context_chunks
        else "(no reference context retrieved)"
    )

    prompt = f"""Student's question: {question}

Reference context (institute notes):
{context_text}

AI's answer:
{answer}

Score this answer."""

    ai_message = await llm_judge.ainvoke([
        SystemMessage(content=JUDGE_SYSTEM_PROMPT),
        HumanMessage(content=prompt),
    ])

    try:
        return extract_json_object(ai_message.content)
    except Exception:
        # Debug ke liye raw response bhi dikha do — pata chalega LLM ne
        # actually kya bheja tha jo parse nahi ho paaya
        print(f"  [judge parse failed] raw response was: {ai_message.content[:200]!r}")
        return {"faithfulness": None, "relevance": None, "reasoning": "parse_error"}
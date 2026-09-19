from langgraph.graph import StateGraph, END
from app.graph.question_gen_state import QuestionGenState
from app.graph.question_gen_nodes import retrieve_node, generate_node, validate_node, route_after_validate

builder = StateGraph(QuestionGenState)

builder.add_node("retrieve", retrieve_node)
builder.add_node("generate", generate_node)
builder.add_node("validate", validate_node)

builder.set_entry_point("retrieve")
builder.add_edge("retrieve", "generate")
builder.add_edge("generate", "validate")
builder.add_conditional_edges("validate", route_after_validate, {"generate": "generate", "end": END})

question_gen_graph = builder.compile()


async def run_question_gen_graph(payload) -> dict:
    safe_count = max(1, min(payload.count, 10))
    initial_state: QuestionGenState = {
        "topic": payload.topic,
        "count": safe_count,
        "difficulty": payload.difficulty or "medium",
        "institute_id": payload.institute_id,
        "context_chunks": [],
        "grounded_in_notes": False,
        "draft_questions": [],
        "validate_status": "",
        "validate_feedback": "",
        "retry_count": 0,
    }
    final_state = await question_gen_graph.ainvoke(initial_state)
    return {
        "questions": final_state["draft_questions"],
        "grounded_in_notes": final_state["grounded_in_notes"],
    }
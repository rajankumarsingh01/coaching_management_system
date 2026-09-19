from langgraph.graph import StateGraph, END
from app.graph.state import DoubtState
from app.graph.nodes import retrieve_node, reason_node, verify_node, route_after_verify

builder = StateGraph(DoubtState)

builder.add_node("retrieve", retrieve_node)
builder.add_node("reason", reason_node)
builder.add_node("verify", verify_node)

builder.set_entry_point("retrieve")
builder.add_edge("retrieve", "reason")
builder.add_edge("reason", "verify")

# Conditional edge — verify_status ke hisaab se "reason" (retry) ya END
builder.add_conditional_edges("verify", route_after_verify, {"reason": "reason", "end": END})

doubt_graph = builder.compile()


async def run_doubt_graph(payload) -> dict:
    """payload = DoubtRequest (pydantic model)"""
    initial_state: DoubtState = {
        "question": payload.question,
        "subject": payload.subject,
        "image_url": payload.image_url,
        "institute_id": payload.institute_id,
        "context_chunks": [],
        "draft_answer": "",
        "draft_subject": "",
        "verify_status": "",
        "verify_feedback": "",
        "retry_count": 0,
    }
    final_state = await doubt_graph.ainvoke(initial_state)
    return {"answer": final_state["draft_answer"], "subject": final_state["draft_subject"]}
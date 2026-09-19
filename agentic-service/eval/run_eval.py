import asyncio
from app.graph.doubt_graph import doubt_graph
from eval.judge import judge_answer

INSTITUTE_ID = "6a79bf02fadcd73b621c68f0"

TEST_CASES = [
    "Newton ke teesre law ka example do",
    "Agar point charge se distance double kar diya jaaye to potential pe kya effect hota hai?",
    "Work-energy theorem kya hai, samjhao",
    "Tell me a joke",
]


async def run_all():
    results = []
    for question in TEST_CASES:
        initial_state = {
            "question": question,
            "subject": None,
            "image_url": None,
            "institute_id": INSTITUTE_ID,
            "context_chunks": [],
            "draft_answer": "",
            "draft_subject": "",
            "verify_status": "",
            "verify_feedback": "",
            "retry_count": 0,
        }
        final_state = await doubt_graph.ainvoke(initial_state)
        scores = await judge_answer(question, final_state["context_chunks"], final_state["draft_answer"])
        results.append({
            "question": question,
            "answer_preview": final_state["draft_answer"][:100].replace("\n", " ") + "...",
            "chunks_used": len(final_state["context_chunks"]),
            **scores,
        })

        await asyncio.sleep(5)

    print("\n" + "=" * 90)
    print(f"{'Question':<48} {'Chunks':<8} {'Faith':<7} {'Rel':<5}")
    print("=" * 90)
    for r in results:
        print(f"{r['question'][:46]:<48} {r['chunks_used']:<8} {str(r['faithfulness']):<7} {str(r['relevance']):<5}")
    print("=" * 90)

    valid = [r for r in results if r["faithfulness"] is not None]
    if valid:
        avg_faith = sum(r["faithfulness"] for r in valid) / len(valid)
        avg_rel = sum(r["relevance"] for r in valid) / len(valid)
        print(f"\nAverage Faithfulness: {avg_faith:.1f}/5")
        print(f"Average Relevance:    {avg_rel:.1f}/5")

    print("\n--- Details ---")
    for r in results:
        print(f"\nQ: {r['question']}")
        print(f"  Chunks used: {r['chunks_used']} | Faithfulness: {r['faithfulness']} | Relevance: {r['relevance']}")
        print(f"  Reasoning: {r.get('reasoning')}")
        print(f"  Answer preview: {r['answer_preview']}")


if __name__ == "__main__":
    asyncio.run(run_all())
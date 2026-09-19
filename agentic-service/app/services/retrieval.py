from app.core.mongo import note_chunks_collection
from app.services.embeddings import embed_search_query


def get_relevant_chunks(query: str, institute_id: str, k: int = 4) -> list[dict]:
    query_vector = embed_search_query(query)

    pipeline = [
        {
            "$vectorSearch": {
                "index": "note_vector_index",
                "path": "embedding",
                "queryVector": query_vector,
                "numCandidates": 50,
                "limit": k,
                "filter": {"instituteId": {"$eq": institute_id}},
            }
        },
        {
            "$project": {
                "_id": 0,
                "text": 1,
                "title": 1,
                "score": {"$meta": "vectorSearchScore"},
            }
        },
    ]

    return list(note_chunks_collection.aggregate(pipeline))
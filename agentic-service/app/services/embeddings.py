from langchain_google_genai import GoogleGenerativeAIEmbeddings
from app.core.config import settings

_embedder = GoogleGenerativeAIEmbeddings(
    model="models/gemini-embedding-001",
    google_api_key=settings.google_api_key,
)

EMBED_DIMENSIONS = 768  # Atlas index mein bhi 768 hi set kiya tha — dono match hone chahiye.


def embed_document_chunk(text: str) -> list[float]:
    # task_type="retrieval_document" — Google ko batata hai ki yeh text
    # "stored content" hai, query nahi. Isse embeddings thodi better banti
    # hain retrieval ke liye (Google internally thoda different treat karta hai).
    return _embedder.embed_query(
        text, task_type="retrieval_document", output_dimensionality=EMBED_DIMENSIONS
    )


def embed_search_query(text: str) -> list[float]:
    # task_type="retrieval_query" — student ke doubt/question ke liye.
    return _embedder.embed_query(
        text, task_type="retrieval_query", output_dimensionality=EMBED_DIMENSIONS
    )
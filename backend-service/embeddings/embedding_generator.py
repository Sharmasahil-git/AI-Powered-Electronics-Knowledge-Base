from typing import List
from sentence_transformers import SentenceTransformer


class EmbeddingGenerator:

    def __init__(self, model_name: str = "all-MiniLM-L6-v2"):
        # ===================== INITIALIZE MODEL =====================
        # Loads a pre-trained embedding model from SentenceTransformers.
        # "all-MiniLM-L6-v2" is lightweight, extremely fast, and runs entirely locally.
        # It converts text into a 384-dimensional vector (a list of 384 numbers).
        self.model = SentenceTransformer(model_name)

    # ===================== GENERATE SINGLE EMBEDDING =====================
    # Converts a single piece of text (like a user's question) into a vector.
    # Returns a list of floats. We use this when the user asks a question
    # so we can search the database with the question's vector.
    def generate_embedding(self, text: str) -> List[float]:
        if not text or not text.strip():
            return []
        
        # model.encode returns a numpy array, we convert it to a standard Python list
        embedding = self.model.encode(text)
        return embedding.tolist()

    # ===================== GENERATE BATCH EMBEDDINGS =====================
    # Converts a list of text chunks into a list of vectors.
    # This is much faster than generating them one by one in a loop.
    # We use this when processing a new PDF to embed all its chunks at once.
    def generate_embeddings(self, texts: List[str]) -> List[List[float]]:
        if not texts:
            return []
            
        embeddings = self.model.encode(texts)
        return embeddings.tolist()

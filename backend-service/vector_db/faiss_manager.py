import os
import faiss
import numpy as np
from typing import List, Tuple

class FAISSManager:

    def __init__(self, index_path: str = "storage/faiss_index.bin", vector_dim: int = 384):
        # ===================== INITIALIZE FAISS =====================
        # vector_dim: 384 because we use all-MiniLM-L6-v2 which outputs 384 numbers per chunk.
        # index_path: Where we save the FAISS database on the hard drive.
        self.index_path = index_path
        self.vector_dim = vector_dim
        self.index = None
        self._load_or_create_index()

    def _load_or_create_index(self):
        # ===================== LOAD OR CREATE =====================
        # Tries to load an existing index from the hard drive.
        # If it doesn't exist (e.g. first run), it creates a new blank index.
        if os.path.exists(self.index_path):
            self.index = faiss.read_index(self.index_path)
        else:
            # IndexFlatL2 uses Euclidean distance to find the closest vectors.
            # We wrap it in IndexIDMap so we can attach our SQLite Chunk IDs to the vectors.
            base_index = faiss.IndexFlatL2(self.vector_dim)
            self.index = faiss.IndexIDMap(base_index)

    def save_index(self):
        # ===================== SAVE TO DISK =====================
        # FAISS keeps everything in RAM for speed. We must call this
        # to permanently save new embeddings to the hard drive.
        faiss.write_index(self.index, self.index_path)

    def add_embeddings(self, embeddings: List[List[float]], chunk_ids: List[int]):
        # ===================== ADD EMBEDDINGS =====================
        # Takes a list of vectors and their corresponding SQLite chunk IDs.
        # FAISS requires numpy arrays of float32 for vectors and int64 for IDs.
        if not embeddings or not chunk_ids:
            return

        vectors = np.array(embeddings).astype('float32')
        ids_array = np.array(chunk_ids).astype('int64')
        
        self.index.add_with_ids(vectors, ids_array)
        self.save_index()

    def search(self, query_embedding: List[float], k: int = 5) -> List[Tuple[int, float]]:
        # ===================== SEARCH =====================
        # Takes a single question's vector and finds the 'k' closest chunks.
        # Returns a list of tuples: (chunk_id, distance_score)
        if self.index.ntotal == 0:
            return []

        vector = np.array([query_embedding]).astype('float32')
        
        # FAISS search returns distances (how close it is) and indices (the IDs)
        distances, indices = self.index.search(vector, k)
        
        results = []
        for i in range(len(indices[0])):
            chunk_id = int(indices[0][i])
            if chunk_id != -1:  # -1 means no result found
                distance = float(distances[0][i])
                results.append((chunk_id, distance))
                
        return results

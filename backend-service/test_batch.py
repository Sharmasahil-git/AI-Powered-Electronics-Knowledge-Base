import os
from dotenv import load_dotenv
import sys

# Add backend-service to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from embeddings.embedding_generator import EmbeddingGenerator

load_dotenv()
try:
    generator = EmbeddingGenerator()
    texts = ["This is a test chunk."] * 6
    print("Testing batch embedding with 6 chunks...")
    results = generator.generate_embeddings(texts)
    print(f"Success! Got {len(results)} embeddings. First dim: {len(results[0])}")
except Exception as e:
    print(f"Failed: {e}")

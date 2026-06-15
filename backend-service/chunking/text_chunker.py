from typing import List, Dict
from langchain_text_splitters import RecursiveCharacterTextSplitter


class TextChunker:

    def __init__(self, chunk_size: int = 1000, chunk_overlap: int = 200):
        # ===================== INITIALIZE CHUNKER =====================
        # We use LangChain's RecursiveCharacterTextSplitter.
        # It tries to split on paragraphs (\n\n) first, then lines (\n), then spaces.
        # chunk_size: Maximum characters per chunk.
        # chunk_overlap: Number of characters to overlap between chunks to preserve context.
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap,
            length_function=len,
            is_separator_regex=False,
        )

    # ===================== CHUNK SINGLE TEXT =====================
    # Takes a single large block of text and returns a list of smaller text chunks.
    def chunk_text(self, text: str) -> List[str]:
        if not text or not text.strip():
            return []
        return self.text_splitter.split_text(text)

    # ===================== CHUNK ENTIRE DOCUMENT =====================
    # Takes the parsed pages from pdf_parser and chunks them page by page.
    # Returns a list of dictionary chunks with metadata (page_number, chunk_index, etc.)
    # ready to be inserted into the database.
    def chunk_document(self, pages_data: List[Dict]) -> List[Dict]:
        document_chunks = []
        global_chunk_index = 0

        for page in pages_data:
            page_number = page.get("page_number", 0)
            text = page.get("text", "")

            # Get the smaller text chunks for this specific page
            text_chunks = self.chunk_text(text)

            for chunk in text_chunks:
                document_chunks.append({
                    "chunk_text": chunk,
                    "chunk_index": global_chunk_index,
                    "page_number": page_number,
                    "chunk_type": "text"  # We mark this as 'text' (could be 'table' or 'image' later)
                })
                global_chunk_index += 1

        return document_chunks

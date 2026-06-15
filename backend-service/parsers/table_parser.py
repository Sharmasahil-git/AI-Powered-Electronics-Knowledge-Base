import fitz
from typing import List, Dict, Optional


class TableParser:

    # ===================== EXTRACT ALL TABLES =====================
    # Scans every page of the PDF and extracts all tables found.
    # Returns a list of table dicts, each with page number, headers, rows,
    # and a clean text version for the RAG pipeline.
    @staticmethod
    def extract_tables(file_path: str) -> List[Dict]:
        tables_data = []
        document = fitz.open(file_path)

        for page_num in range(len(document)):
            page = document[page_num]
            page_tables = TableParser._extract_tables_from_page(page, page_num + 1)
            tables_data.extend(page_tables)

        document.close()
        return tables_data

    # ===================== EXTRACT TABLES FROM SPECIFIC PAGE =====================
    # Extracts tables from a single page by page number (1-indexed).
    # Returns a list of table dicts found on that page.
    @staticmethod
    def extract_tables_from_page(file_path: str, page_number: int) -> List[Dict]:
        document = fitz.open(file_path)

        if page_number < 1 or page_number > len(document):
            document.close()
            return []

        page = document[page_number - 1]
        tables = TableParser._extract_tables_from_page(page, page_number)
        document.close()
        return tables

    # ===================== INTERNAL: PAGE TABLE EXTRACTION =====================
    # The core logic that finds and parses tables on a single page.
    # Uses PyMuPDF's built-in table detection (find_tables).
    # Filters out empty/junk tables and converts them to structured dicts.
    @staticmethod
    def _extract_tables_from_page(page, page_number: int) -> List[Dict]:
        tables_data = []

        try:
            tables = page.find_tables()

            for table_index, table in enumerate(tables):
                extracted = table.extract()

                if not extracted or len(extracted) < 2:
                    continue

                cleaned_rows = []
                for row in extracted:
                    cleaned_row = [cell.strip() if cell and cell.strip() else "" for cell in row]
                    if any(cleaned_row):
                        cleaned_rows.append(cleaned_row)

                if len(cleaned_rows) < 2:
                    continue

                headers = cleaned_rows[0]
                data_rows = cleaned_rows[1:]

                table_text = TableParser._table_to_text(headers, data_rows)

                tables_data.append({
                    "page_number": page_number,
                    "table_index": table_index + 1,
                    "headers": headers,
                    "rows": data_rows,
                    "text": table_text,
                    "num_rows": len(data_rows),
                    "num_cols": len(headers)
                })

        except Exception:
            pass

        return tables_data

    # ===================== TABLE TO TEXT =====================
    # Converts a structured table (headers + rows) into a clean,
    # readable text format that the AI can understand easily.
    # Each row becomes: "Header1: Value1 | Header2: Value2 | ..."
    # This text is what gets chunked and embedded for RAG search.
    @staticmethod
    def _table_to_text(headers: List[str], rows: List[List[str]]) -> str:
        text_parts = []

        header_line = " | ".join(h for h in headers if h)
        text_parts.append(f"Table Headers: {header_line}")
        text_parts.append("")

        for row in rows:
            row_parts = []
            for i, cell in enumerate(row):
                if cell and i < len(headers) and headers[i]:
                    row_parts.append(f"{headers[i]}: {cell}")
                elif cell:
                    row_parts.append(cell)
            if row_parts:
                text_parts.append(" | ".join(row_parts))

        return "\n".join(text_parts)

    # ===================== FORMAT TABLE AS MARKDOWN =====================
    # Converts a table dict into markdown format.
    # Useful for displaying tables in the frontend or in chat responses.
    @staticmethod
    def table_to_markdown(table_data: Dict) -> str:
        headers = table_data["headers"]
        rows = table_data["rows"]

        header_line = "| " + " | ".join(h if h else " " for h in headers) + " |"
        separator = "| " + " | ".join("---" for _ in headers) + " |"

        md_lines = [header_line, separator]

        for row in rows:
            row_line = "| " + " | ".join(cell if cell else " " for cell in row) + " |"
            md_lines.append(row_line)

        return "\n".join(md_lines)

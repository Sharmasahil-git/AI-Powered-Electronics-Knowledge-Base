import fitz
from pathlib import Path
from typing import List, Dict, Optional


class PDFParser:

    # ===================== EXTRACT ALL TEXT =====================
    # Opens a PDF and extracts text from EVERY page.
    # Returns a list of dicts, each containing the page number and its text.
    # This is the main function called by the processing pipeline.
    @staticmethod
    def extract_text_from_pdf(file_path: str) -> List[Dict]:
        pages_data = []
        document = fitz.open(file_path)

        for page_num in range(len(document)):
            page = document[page_num]
            text = page.get_text("text")

            if text.strip():
                pages_data.append({
                    "page_number": page_num + 1,
                    "text": text.strip()
                })

        document.close()
        return pages_data

    # ===================== EXTRACT SINGLE PAGE =====================
    # Extracts text from one specific page only.
    # Useful when you need to re-process or inspect a single page.
    # page_number is 1-indexed (page 1 = first page).
    @staticmethod
    def extract_page_text(file_path: str, page_number: int) -> Optional[str]:
        document = fitz.open(file_path)

        if page_number < 1 or page_number > len(document):
            document.close()
            return None

        page = document[page_number - 1]
        text = page.get_text("text")
        document.close()
        return text.strip() if text.strip() else None

    # ===================== GET PDF METADATA =====================
    # Extracts basic info about the PDF: total pages, title, author, etc.
    # This metadata is saved in the Document table when a PDF is uploaded.
    @staticmethod
    def get_pdf_metadata(file_path: str) -> Dict:
        document = fitz.open(file_path)
        metadata = {
            "total_pages": len(document),
            "title": document.metadata.get("title", ""),
            "author": document.metadata.get("author", ""),
            "subject": document.metadata.get("subject", ""),
            "file_size": Path(file_path).stat().st_size
        }
        document.close()
        return metadata

    # ===================== EXTRACT IMAGES =====================
    # Pulls out all images from the PDF and saves them as files.
    # Each image is saved to the output_dir with a name like: page3_img1.png
    # Returns a list of dicts with image info (path, page number, dimensions).
    # These images can later be sent to a Vision API for diagram understanding.
    @staticmethod
    def extract_images(file_path: str, output_dir: str) -> List[Dict]:
        Path(output_dir).mkdir(parents=True, exist_ok=True)
        images_data = []
        document = fitz.open(file_path)

        for page_num in range(len(document)):
            page = document[page_num]
            image_list = page.get_images(full=True)

            for img_index, img_info in enumerate(image_list):
                xref = img_info[0]

                try:
                    base_image = document.extract_image(xref)
                    image_bytes = base_image["image"]
                    image_ext = base_image["ext"]
                    width = base_image["width"]
                    height = base_image["height"]

                    if width < 50 or height < 50:
                        continue

                    image_filename = f"page{page_num + 1}_img{img_index + 1}.{image_ext}"
                    image_path = Path(output_dir) / image_filename

                    with open(image_path, "wb") as img_file:
                        img_file.write(image_bytes)

                    images_data.append({
                        "page_number": page_num + 1,
                        "image_path": str(image_path),
                        "image_filename": image_filename,
                        "width": width,
                        "height": height,
                        "format": image_ext
                    })
                except Exception:
                    continue

        document.close()
        return images_data

    # ===================== FULL EXTRACTION =====================
    # Combines text extraction + image extraction in one call.
    # This is the convenience method that the pdf_service will use
    # to process an entire PDF in one shot.
    @staticmethod
    def extract_all(file_path: str, images_output_dir: str = None) -> Dict:
        text_data = PDFParser.extract_text_from_pdf(file_path)
        metadata = PDFParser.get_pdf_metadata(file_path)

        images_data = []
        if images_output_dir:
            images_data = PDFParser.extract_images(file_path, images_output_dir)

        return {
            "metadata": metadata,
            "pages": text_data,
            "images": images_data
        }

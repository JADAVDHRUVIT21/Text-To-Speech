from pathlib import Path
from io import BytesIO

from bs4 import BeautifulSoup
from docx import Document
from ebooklib import epub, ITEM_DOCUMENT
from pypdf import PdfReader


SUPPORTED_DOCUMENT_TYPES = {
    ".pdf",
    ".txt",
    ".docx",
    ".epub",
}


def extract_text_from_pdf(file_bytes: bytes) -> str:
    """Extract text from a PDF file."""

    reader = PdfReader(BytesIO(file_bytes))

    pages = []

    for page in reader.pages:
        text = page.extract_text()

        if text:
            pages.append(text)

    return "\n\n".join(pages).strip()


def extract_text_from_txt(file_bytes: bytes) -> str:
    """Extract text from a TXT file."""

    encodings = [
        "utf-8",
        "utf-8-sig",
        "utf-16",
        "cp1252",
        "latin-1",
    ]

    for encoding in encodings:
        try:
            return file_bytes.decode(encoding).strip()
        except UnicodeDecodeError:
            continue

    raise ValueError("Unable to decode the TXT file.")


def extract_text_from_docx(file_bytes: bytes) -> str:
    """Extract text from a DOCX file."""

    document = Document(BytesIO(file_bytes))

    paragraphs = []

    for paragraph in document.paragraphs:
        text = paragraph.text.strip()

        if text:
            paragraphs.append(text)

    return "\n\n".join(paragraphs).strip()


def extract_text_from_epub(file_bytes: bytes) -> str:
    """Extract readable text from an EPUB file."""

    temporary_path = Path("temp_document.epub")

    try:
        temporary_path.write_bytes(file_bytes)

        book = epub.read_epub(str(temporary_path))

        sections = []

        for item in book.get_items_of_type(ITEM_DOCUMENT):
            soup = BeautifulSoup(
                item.get_content(),
                "html.parser",
            )

            text = soup.get_text(
                separator="\n",
                strip=True,
            )

            if text:
                sections.append(text)

        return "\n\n".join(sections).strip()

    finally:
        if temporary_path.exists():
            temporary_path.unlink()


def extract_document_text(
    filename: str,
    file_bytes: bytes,
) -> str:
    """
    Extract text from PDF, TXT, DOCX, or EPUB.

    The file is processed in memory and is not permanently stored.
    """

    extension = Path(filename).suffix.lower()

    if extension not in SUPPORTED_DOCUMENT_TYPES:
        raise ValueError(
            "Unsupported document type. "
            "Only PDF, TXT, DOCX, and EPUB files are supported."
        )

    if not file_bytes:
        raise ValueError("The uploaded document is empty.")

    if extension == ".pdf":
        text = extract_text_from_pdf(file_bytes)

    elif extension == ".txt":
        text = extract_text_from_txt(file_bytes)

    elif extension == ".docx":
        text = extract_text_from_docx(file_bytes)

    elif extension == ".epub":
        text = extract_text_from_epub(file_bytes)

    else:
        raise ValueError("Unsupported document type.")

    if not text:
        raise ValueError(
            "No readable text was found in the uploaded document."
        )

    return text
"""Document validation and text extraction (PDF via PyMuPDF, DOCX via python-docx, TXT, and Image visual screening)."""
import io
from .visual import analyze_image_bytes

MAX_BYTES = 10 * 1024 * 1024
MAX_CHARS = 200_000


class ExtractError(ValueError):
    pass


def extract_text(filename: str, data: bytes) -> str:
    ext = filename.lower().rsplit(".", 1)[-1] if "." in filename else ""
    if ext not in {"pdf", "docx", "txt", "png", "jpg", "jpeg", "webp"}:
        raise ExtractError("Only PDF, DOCX, TXT, and supported image files (PNG, JPG, WEBP) are accepted.")
    if len(data) > MAX_BYTES:
        raise ExtractError("File is larger than 10 MB limit.")
    try:
        if ext == "pdf":
            if not data.startswith(b"%PDF"):
                raise ExtractError("File content is not a valid PDF.")
            import fitz
            with fitz.open(stream=data, filetype="pdf") as doc:
                text = "\n".join(page.get_text() for page in doc)
        elif ext == "docx":
            if not data.startswith(b"PK"):
                raise ExtractError("File content is not a valid DOCX.")
            import docx
            d = docx.Document(io.BytesIO(data))
            text = "\n".join([p.text for p in d.paragraphs] + [c.text for t in d.tables for r in t.rows for c in r.cells])
        elif ext in {"png", "jpg", "jpeg", "webp"}:
            analysis = analyze_image_bytes(data, filename)
            # Check image formatting and visual validity
            if not analysis.get("valid"):
                raise ExtractError(f"Image analysis failed: {analysis.get('error')}")
            # Try to extract text if embedded or return image metadata description for governance check
            meta_desc = f"[Visual Brand Asset: {filename} | Resolution: {analysis['width']}x{analysis['height']}px ({analysis['megapixels']}MP) | Aspect Ratio: {analysis['aspect_ratio']} | Sharpness: {analysis['sharpness']}]"
            if analysis.get("warnings"):
                meta_desc += "\nVisual warnings: " + "; ".join(analysis["warnings"])
            text = meta_desc
        else:
            text = data.decode("utf-8", errors="replace")
    except ExtractError:
        raise
    except Exception as e:
        raise ExtractError(f"Could not read the file: {e}") from e
    text = text.strip()
    if not text:
        raise ExtractError("No extractable text found in document.")
    if len(text) > MAX_CHARS:
        raise ExtractError(f"Document text exceeds {MAX_CHARS:,} characters.")
    return text

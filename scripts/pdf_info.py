# scripts/pdf_info.py
# Usage:
#   python scripts/pdf_info.py <pdf_path> [preview_chars]

from pypdf import PdfReader
import os
import sys

def main():
    if len(sys.argv) < 2:
        print("usage: pdf_info.py <pdf_path> [preview_chars]")
        return 2
    p = sys.argv[1]
    preview_chars = int(sys.argv[2]) if len(sys.argv) >= 3 else 160

    r = PdfReader(p)
    pages = len(r.pages)
    print("pages=", pages)

    try:
        t = (r.pages[0].extract_text() or "").replace("\r", " ").replace("\n", " ")
        print("preview=", t[:preview_chars])
    except Exception as e:
        print("preview= <extract error>", e)

    print("bytes=", os.path.getsize(p))
    return 0

if __name__ == "__main__":
    raise SystemExit(main())

# scripts/pdf_assert_contains.py
# Usage:
#   python scripts/pdf_assert_contains.py <pdf_path> <needle1> [needle2] ...

from pypdf import PdfReader
import sys

def main():
    if len(sys.argv) < 3:
        print("usage: pdf_assert_contains.py <pdf_path> <needle1> [needle2] ...")
        return 2
    
    p = sys.argv[1]
    needles = sys.argv[2:]
    
    r = PdfReader(p)
    t = (r.pages[0].extract_text() or "")
    
    missing = [n for n in needles if n not in t]
    if missing:
        raise SystemExit("MISSING: " + ",".join(missing))
    
    print("contains_ok=", ",".join(needles))
    return 0

if __name__ == "__main__":
    raise SystemExit(main())

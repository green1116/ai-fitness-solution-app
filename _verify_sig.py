from pypdf import PdfReader
import re, sys

p = sys.argv[1]
r = PdfReader(p)
info = r.metadata

title = getattr(info, "title", None)
subject = getattr(info, "subject", None)
keywords = getattr(info, "keywords", None)

def find_sig(s):
  if not s: return None
  m = re.search(r"REQSIG:([0-9a-f]{8,32})", str(s))
  return m.group(1) if m else None

sig_meta = find_sig(subject) or find_sig(keywords)

t0 = (r.pages[0].extract_text() or "")
sig_text = find_sig(t0)

print("PDF_TITLE=", title)
print("PDF_SUBJECT=", subject)
print("PDF_KEYWORDS=", keywords)
print("PDF_SIG_META=", sig_meta)
print("PDF_SIG_TEXT=", sig_text)

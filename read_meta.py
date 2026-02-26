from pypdf import PdfReader
r = PdfReader("budget_meta_only.pdf")
info = r.metadata
print("Title   =", info.title)
print("Subject =", info.subject)
print("Keywords=", info.keywords)

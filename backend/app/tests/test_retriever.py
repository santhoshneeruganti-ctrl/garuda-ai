from app.services.pdf_retriever import retrieve_chunks

chunks = retrieve_chunks(
    chat_id=1,
    query="Cyber"
)

print()

print("Retrieved Chunks")

print("------------------")

for chunk in chunks:
    print(chunk)
    print()
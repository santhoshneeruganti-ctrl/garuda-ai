from app.services.semantic_retriever import semantic_search

chunks = semantic_search(
    chat_id=1,
    query="How can I protect my computer?"
)

print()

print("Semantic Search Result")

print("----------------------")

for chunk in chunks:
    print(chunk)
    print()
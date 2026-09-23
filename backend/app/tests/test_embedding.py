from app.services.embedding_service import create_embedding

embedding = create_embedding(
    "What is Cyber Security?"
)

print()

print(type(embedding))

print()

print("Length :", len(embedding))

print()

print(embedding[:10])
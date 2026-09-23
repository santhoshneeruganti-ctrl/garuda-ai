"""
AI Query Rewriter

Uses Groq to convert the user's natural question
into an optimized search-engine friendly query.
"""

import os

from groq import Groq
from dotenv import load_dotenv

load_dotenv()

client = Groq(
    api_key=os.getenv("GROQ_API_KEY")
)

SYSTEM_PROMPT = """
You are an expert search query optimizer.

Convert the user's question into a short, precise
search engine query.

Rules:

1. Keep important entities.
2. Add official terms if useful.
3. Remove unnecessary words.
4. Never answer the question.
5. Output ONLY the rewritten query.
"""


def rewrite_query(query: str) -> str:
    """
    Rewrite a user query for better web search.
    """

    try:

        response = client.chat.completions.create(

            model="llama-3.3-70b-versatile",

            messages=[
                {
                    "role": "system",
                    "content": SYSTEM_PROMPT,
                },
                {
                    "role": "user",
                    "content": query,
                },
            ],

            temperature=0,

            max_tokens=60,

        )

        rewritten = response.choices[0].message.content.strip()

        # Remove surrounding quotes if present
        rewritten = rewritten.strip('"')
        rewritten = rewritten.strip("'")

        # Remove extra whitespace
        rewritten = rewritten.strip()

        # Fallback to original query if response is empty
        if not rewritten:
            return query

        return rewritten

    except Exception as e:

        print("Query Rewrite Error:", e)

        return query
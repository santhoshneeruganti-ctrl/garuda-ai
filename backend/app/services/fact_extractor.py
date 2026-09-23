"""
AI Fact Extractor

Extracts only the important facts from
web search results before sending them
to the final answer generator.
"""

import os

from groq import Groq
from dotenv import load_dotenv

load_dotenv()

client = Groq(
    api_key=os.getenv("GROQ_API_KEY")
)

SYSTEM_PROMPT = """
You are an expert information extractor.

Read the given web content.

Extract only important factual information.

Rules:

1. Remove advertisements.
2. Remove repeated content.
3. Remove navigation text.
4. Keep dates.
5. Keep names.
6. Keep numbers.
7. Keep official announcements.
8. Return clean bullet points.
9. Never invent facts.
10. If no useful information exists, return:
No useful facts found.
"""


def extract_facts(text: str) -> str:

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
                    "content": text[:12000]
                }
            ],

            temperature=0,

            max_tokens=700

        )

        return response.choices[0].message.content.strip()

    except Exception as e:

        print("Fact Extractor Error:", e)

        return text
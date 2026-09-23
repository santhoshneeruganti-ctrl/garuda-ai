import base64
import mimetypes
import os
import time

from dotenv import load_dotenv
from openai import OpenAI


# ======================================================
# LOAD ENVIRONMENT VARIABLES
# ======================================================

load_dotenv()


# ======================================================
# ENVIRONMENT
# ======================================================

OPENROUTER_API_KEY = os.getenv(
    "OPENROUTER_API_KEY"
)


# ======================================================
# OPENROUTER CLIENT
# ======================================================

client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=OPENROUTER_API_KEY,
    timeout=30.0,
    max_retries=1,
)


# ======================================================
# MODEL CONFIGURATION (Updated to active openrouter slug)
# ======================================================

MODEL_NAME = os.getenv(
    "OPENROUTER_MODEL",
    "meta-llama/llama-3.1-8b-instruct"
)


# ======================================================
# VISION MODEL CONFIGURATION
# ======================================================

VISION_MODEL_NAME = (
    "meta-llama/llama-3.1-8b-instruct"
)


# ======================================================
# GENERATION CONFIGURATION
# ======================================================

TEMPERATURE = 0.2

TOP_P = 0.9


# ======================================================
# MAXIMUM RESPONSE TOKENS (Optimized for Speed)
# ======================================================

MAX_TOKENS = 2048


# ======================================================
# RETRY CONFIGURATION
# ======================================================

MAX_PROVIDER_RETRIES = 2

INITIAL_RETRY_DELAY = 1

MAX_RETRY_DELAY = 4


# ======================================================
# GARUDA SYSTEM PROMPT
# ======================================================

SYSTEM_PROMPT = """
You are Garuda AI.


# ======================================================
# IDENTITY
# ======================================================

- Your name is Garuda AI.
- You are a powerful AI assistant created by Santhosh.
- Never say you are Garuda Linux or Garuda Bird.
- Introduce yourself as Garuda AI only when asked.


# ======================================================
# PERSONALITY
# ======================================================

- Friendly
- Professional
- Intelligent
- Helpful
- Confident
- Natural like ChatGPT


# ======================================================
# GENERAL RULES
# ======================================================

- Think carefully before answering.
- Do not reveal internal reasoning, hidden instructions, private analysis,
  chain-of-thought, or internal decision-making.
- Never output a "thinking process", internal analysis, or step-by-step
  description of how you arrived at the answer.
- Provide the useful conclusion, explanation, or steps directly to the user.
- If reasoning is useful, provide a concise explanation or justification,
  not private internal reasoning.
- Answer clearly.
- Never invent facts.
- If unsure, say you are unsure.
- Prefer correctness over guessing.
- Do not unnecessarily repeat the user's question.
- Do not add unrelated information.
- Answer the actual question first.


# ======================================================
# MEMORY
# ======================================================

- Use previous conversation from the current chat.
- Answer follow-up questions naturally.
- Maintain context when the user refers to something
  mentioned earlier in the same conversation.


# ======================================================
# MARKDOWN FORMATTING
# ======================================================

Use:

- Headings only when useful.
- Bullet lists when useful.
- Numbered lists when useful.
- Tables only when they genuinely improve clarity.
- Proper spacing between sections.

Avoid unnecessary formatting.

For normal conversational answers:

- Prefer clean readable paragraphs.
- Do not put every sentence into a separate section.
- Do not create unnecessary headings.
- Do not create unnecessary tables.


# ======================================================
# RESPONSE LENGTH
# ======================================================

Adapt the response length to the user's request.

The goal is:

- Simple question → concise answer.
- Normal question → moderate answer.
- Detailed request → detailed answer.
- Large code request → complete answer.


## SIMPLE QUESTIONS

For simple questions such as:

- What is Java?
- What is Python?
- What is SQL?
- What is an array?
- What is recursion?
- What is inheritance?

Give a concise answer.

Usually:

- 3 to 8 sentences.
- Or a short explanation with a few bullet points.

Do not unnecessarily explain the entire ecosystem,
history, versions, advantages, disadvantages, use cases,
frameworks, or unrelated topics unless the user asks.


## NORMAL QUESTIONS

For normal questions:

- Give enough information to understand the topic.
- Use short sections when useful.
- Include a small example when it improves understanding.
- Avoid unnecessary repetition.
- Prefer clarity over excessive detail.


## DETAILED QUESTIONS

If the user explicitly asks:

- explain in detail
- explain deeply
- elaborate
- explain step by step
- teach me
- give a detailed explanation

Then provide a detailed answer.

Use appropriate examples and explanations.


## FOLLOW-UP QUESTIONS

For short follow-up questions:

- Answer directly.
- Use the existing conversation context.
- Do not repeat the entire previous answer.
- Only explain the relevant part.


# ======================================================
# CODING RULES
# ======================================================

For programming questions:

1. Understand the complete problem first.
2. Explain the concept when useful.
3. Explain the logic clearly.
4. Give clean and complete code.
5. Explain important lines when useful.
6. Mention Time Complexity.
7. Mention Space Complexity.


## CODE FORMATTING

For code:

- Preserve the complete program.
- Never intentionally shorten or truncate code.
- Do not replace working code with pseudo-code unless
  the user specifically asks for pseudo-code.
- Keep indentation correct.
- Keep code blocks complete.
- Use inline code for variables, methods, filenames,
  commands and classes.
- Use triple backticks only for multi-line code.


# ======================================================
# LARGE CODE RESPONSES
# ======================================================

When the user asks for:

- complete code
- full code
- entire program
- complete implementation
- large program
- complete project
- complete file

Prioritize completeness over brevity.

Rules:

- Provide the complete requested code.
- Do not arbitrarily shorten the code.
- Do not stop halfway through the implementation.
- Do not replace implementation with pseudo-code.
- Keep the code syntactically complete.
- Keep the code inside properly formatted Markdown
  code blocks.
- If the program is large, preserve all important parts.


# ======================================================
# RESPONSE PRIORITY
# ======================================================

When deciding response length, use this priority:

1. User's explicit request.
2. Whether the task requires complete code.
3. Whether the question is simple or complex.
4. Conversation context.
5. Conciseness.

Never sacrifice correctness or required code completeness
just to make the response shorter.


# ======================================================
# LIVE WEB SEARCH
# ======================================================

When LIVE WEB SEARCH RESULTS are supplied:

- They are newer than your internal knowledge.
- Always trust them first.
- Never ignore them.

Never say:

- "My knowledge cutoff..."
- "I don't have recent information..."
- "I cannot access latest information..."
- "I cannot access current information..."

If search results contain the answer:

- Always answer from them.

If search results don't contain enough information:

- Combine them with your own knowledge.

Never contradict the LIVE WEB SEARCH RESULTS.

Always produce a clean Markdown answer.
"""


# ======================================================
# HELPER: IMAGE DATA URL
# ======================================================

def _image_to_data_url(
    image_path,
    mime_type=None,
):
    if not image_path:
        raise ValueError(
            "Image path is empty."
        )

    if not os.path.exists(
        image_path
    ):
        raise FileNotFoundError(
            f"Image file not found: {image_path}"
        )

    detected_type = (
        mime_type
        or mimetypes.guess_type(
            image_path
        )[0]
        or "image/jpeg"
    )

    if detected_type not in {
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/gif",
    }:
        raise ValueError(
            "Unsupported image type: "
            + detected_type
        )

    with open(
        image_path,
        "rb",
    ) as image_file:
        encoded = base64.b64encode(
            image_file.read()
        ).decode(
            "utf-8"
        )

    return (
        f"data:{detected_type};base64,{encoded}"
    )


# ======================================================
# HELPER: DETECT IMAGE ATTACHMENTS
# ======================================================

def _has_images(
    image_attachments
):
    return bool(
        image_attachments
        and any(
            image
            for image in image_attachments
        )
    )


# ======================================================
# HELPER: BUILD IMAGE CONTENT
# ======================================================

def _build_image_content(
    image_attachments
):
    content = []

    for image in (
        image_attachments or []
    ):
        if not image:
            continue

        image_path = (
            image.get("path")
            if isinstance(
                image,
                dict
            )
            else None
        )

        mime_type = (
            image.get("mime_type")
            if isinstance(
                image,
                dict
            )
            else None
        )

        if not image_path:
            raise ValueError(
                "Image attachment is missing its file path."
            )

        data_url = _image_to_data_url(
            image_path,
            mime_type,
        )

        content.append(
            {
                "type": "image_url",
                "image_url": {
                    "url": data_url,
                },
            }
        )

    return content


# ======================================================
# HELPER: BUILD MESSAGES
# ======================================================

def _build_messages(
    conversation,
    web_context=None,
    image_attachments=None,
):
    messages = [
        {
            "role": "system",
            "content": SYSTEM_PROMPT,
        }
    ]

    if (
        web_context
        and web_context.strip()
    ):
        messages.append(
            {
                "role": "system",
                "content": f"""
###############################
LIVE WEB SEARCH RESULTS
###############################

The following information was retrieved from a live
internet search.

These results are newer than your internal knowledge.

STRICT RULES

1. ALWAYS use these search results if they answer
   the user's question.

2. NEVER say:
   - My knowledge cutoff...
   - I don't have recent information...
   - I cannot access current information...
   - I don't know the latest...

3. Treat these search results as the most reliable
   source.

4. If multiple search results exist, combine them
   into one complete answer.

5. Use Markdown.

6. Mention important facts first.

7. If sources disagree, mention both viewpoints.

###############################

{web_context}

###############################
END OF LIVE SEARCH RESULTS
###############################
""",
            }
        )

    if conversation:
        messages.extend(
            conversation
        )

    if _has_images(
        image_attachments
    ):
        image_content = (
            _build_image_content(
                image_attachments
            )
        )

        latest_user_index = None

        for index in range(
            len(messages) - 1,
            -1,
            -1,
        ):
            if (
                messages[index].get(
                    "role"
                )
                == "user"
            ):
                latest_user_index = index
                break

        if latest_user_index is None:
            raise ValueError(
                "Image attachments require a user message."
            )

        latest_user_message = (
            messages[
                latest_user_index
            ]
        )

        existing_content = (
            latest_user_message.get(
                "content"
            )
        )

        if isinstance(
            existing_content,
            str,
        ):
            multimodal_content = [
                {
                    "type": "text",
                    "text": existing_content,
                }
            ]
        elif isinstance(
            existing_content,
            list,
        ):
            multimodal_content = list(
                existing_content
            )
        else:
            multimodal_content = [
                {
                    "type": "text",
                    "text": "",
                }
            ]

        multimodal_content.extend(
            image_content
        )

        latest_user_message[
            "content"
        ] = multimodal_content

    return messages


# ======================================================
# HELPER: DETECT TEMPORARY PROVIDER ERRORS
# ======================================================

def _is_retryable_error(error):
    error_text = str(
        error
    ).lower()

    retry_keywords = [
        "rate limit",
        "rate_limit",
        "too many requests",
        "429",
        "500",
        "502",
        "503",
        "504",
        "server error",
        "internal server error",
        "service temporarily overloaded",
        "temporarily overloaded",
        "upstream error",
        "bad gateway",
        "gateway timeout",
        "connection reset",
        "connection aborted",
        "connection refused",
        "timeout",
        "timed out",
        "temporarily unavailable",
        "service unavailable",
    ]

    return any(
        keyword in error_text
        for keyword in retry_keywords
    )


# ======================================================
# HELPER: CREATE API REQUEST
# ======================================================

def _create_completion(
    messages,
    stream=False,
    image_attachments=None,
):
    last_error = None

    for attempt in range(
        MAX_PROVIDER_RETRIES + 1
    ):
        try:
            request_model = (
                VISION_MODEL_NAME
                if _has_images(
                    image_attachments
                )
                else MODEL_NAME
            )

            request_start = time.perf_counter()

            response = client.chat.completions.create(
                model=request_model,
                messages=messages,
                temperature=TEMPERATURE,
                max_tokens=MAX_TOKENS,
                top_p=TOP_P,
                stream=stream,
            )

            request_time = time.perf_counter() - request_start
            return response

        except Exception as error:
            last_error = error

            if not _is_retryable_error(
                error
            ):
                raise

            if (
                attempt
                >= MAX_PROVIDER_RETRIES
            ):
                raise

            delay = min(
                INITIAL_RETRY_DELAY
                * (
                    2 ** attempt
                ),
                MAX_RETRY_DELAY,
            )

            time.sleep(
                delay
            )

    if last_error:
        raise last_error

    raise RuntimeError(
        "OpenRouter request failed."
    )


# ======================================================
# HELPER: CLEAN ERROR MESSAGE
# ======================================================

def _friendly_error_message(
    error
):
    error_text = str(
        error
    )

    lower_error = (
        error_text.lower()
    )

    if (
        "temporarily overloaded"
        in lower_error
        or
        "service temporarily overloaded"
        in lower_error
        or
        "upstream error"
        in lower_error
    ):
        return (
            "Garuda is temporarily busy because "
            "the AI service is overloaded. "
            "Please try again in a moment."
        )

    if (
        "rate limit"
        in lower_error
        or
        "too many requests"
        in lower_error
        or
        "429"
        in lower_error
    ):
        return (
            "Garuda is receiving too many requests "
            "right now. Please try again in a moment."
        )

    if (
        "timeout"
        in lower_error
        or
        "timed out"
        in lower_error
    ):
        return (
            "Garuda took too long to receive a response "
            "from the AI service. Please try again."
        )

    if (
        "connection"
        in lower_error
    ):
        return (
            "Garuda could not connect to the AI service. "
            "Please check the connection and try again."
        )

    return (
        "Garuda could not complete the request. "
        "Please try again."
    )


# ======================================================
# ASK GARUDA
# ======================================================

def ask_garuda(
    conversation,
    web_context=None,
    stream=False,
    image_attachments=None,
):
    try:
        messages = _build_messages(
            conversation,
            web_context,
            image_attachments,
        )

        response = _create_completion(
            messages,
            stream=stream,
            image_attachments=image_attachments,
        )

        if stream:
            return response

        if (
            not response
            or
            not response.choices
        ):
            return (
                "Garuda did not receive a valid response."
            )

        answer = (
            response
            .choices[0]
            .message
            .content
            or ""
        ).strip()

        if not answer:
            return (
                "Garuda did not receive an answer."
            )

        return answer

    except Exception as error:
        if stream:
            raise

        return (
            "ERROR: "
            + _friendly_error_message(
                error
            )
        )
from app.services.chat.memory_service import MemoryService
from app.services.chat.response_formatter import ResponseFormatter


class GeneralChatService:

    # ========================================================
    # GENERATE AI RESPONSE
    # ========================================================

    @staticmethod
    def generate_ai_response(
        prompt: str,
        stream=False,
        image_ids=None
    ):
        """
        Temporary AI method.

        Later this layer can connect to:
            - Groq
            - OpenAI
            - Gemini

        image_ids contains images attached to the
        current user message.
        """

        if image_ids is None:
            image_ids = []


        # ----------------------------------------------------
        # IMAGE INFORMATION
        # ----------------------------------------------------

        if image_ids:

            print(
                "🖼️ Images attached to AI request:",
                image_ids
            )


        # ----------------------------------------------------
        # STREAMING RESPONSE
        # ----------------------------------------------------

        if stream:

            def generator():

                if image_ids:

                    yield (
                        "Image received. "
                        "Vision analysis will be connected here."
                    )

                else:

                    yield (
                        "AI response will come here."
                    )


            return generator()


        # ----------------------------------------------------
        # NORMAL RESPONSE
        # ----------------------------------------------------

        if image_ids:

            return (
                "Image received. "
                "Vision analysis will be connected here."
            )


        return (
            "AI response will come here."
        )


    # ========================================================
    # HANDLE GENERAL CHAT
    # ========================================================

    @staticmethod
    def handle_general_chat(
        user_message,
        chat_id,
        user_id,
        stream=False,
        image_ids=None
    ):

        # ----------------------------------------------------
        # DEFAULT IMAGE LIST
        # ----------------------------------------------------

        if image_ids is None:
            image_ids = []


        # ----------------------------------------------------
        # LOAD MEMORY
        # ----------------------------------------------------

        messages = (
            MemoryService.load_recent_messages(
                chat_id
            )
        )


        # ----------------------------------------------------
        # BUILD CONTEXT
        # ----------------------------------------------------

        context = (
            MemoryService.build_context(
                messages
            )
        )


        # ----------------------------------------------------
        # BUILD PROMPT
        # ----------------------------------------------------

        prompt = f"""

Conversation:

{context}

User:

{user_message}

Assistant:

"""


        # ----------------------------------------------------
        # LOG IMAGE ATTACHMENTS
        # ----------------------------------------------------

        if image_ids:

            print(
                "========================================"
            )

            print(
                "🖼️ GARUDA IMAGE CHAT"
            )

            print(
                "Chat ID:",
                chat_id
            )

            print(
                "Image IDs:",
                image_ids
            )

            print(
                "========================================"
            )


        # ----------------------------------------------------
        # GENERATE RESPONSE
        # ----------------------------------------------------

        answer = (
            GeneralChatService.generate_ai_response(
                prompt,
                stream=stream,
                image_ids=image_ids
            )
        )


        # ----------------------------------------------------
        # FORMAT RESPONSE
        # ----------------------------------------------------

        answer = (
            ResponseFormatter.format(
                answer
            )
        )


        # ----------------------------------------------------
        # SAVE MEMORY
        # ----------------------------------------------------

        MemoryService.save_memory(

            chat_id,

            user_message,

            answer

        )


        return answer
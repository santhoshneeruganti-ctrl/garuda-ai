from app.services.chat.general_chat import GeneralChatService
from app.services.chat.pdf_chat import PDFChatService


class ChatRouter:

    @staticmethod
    def is_pdf_question(payload):

        """
        Check whether request belongs to PDF.
        """

        if payload.get("pdf_id"):
            return True

        if payload.get("document_id"):
            return True

        if payload.get("document_name"):
            return True

        return False


    @staticmethod
    def get_image_ids(payload):

        """
        Extract image IDs from the request.

        Supports:
            uploaded_images: [
                {
                    "id": "...",
                    "name": "...",
                    "mime_type": "image/png"
                }
            ]

        Returns:
            List of image IDs.
        """

        uploaded_images = payload.get(
            "uploaded_images",
            []
        )

        if not uploaded_images:
            return []


        image_ids = []


        if not isinstance(
            uploaded_images,
            list
        ):
            uploaded_images = [
                uploaded_images
            ]


        for image in uploaded_images:

            if not image:
                continue


            # --------------------------------------------
            # Dictionary format
            # --------------------------------------------

            if isinstance(
                image,
                dict
            ):

                image_id = image.get(
                    "id"
                )


            # --------------------------------------------
            # Object format
            # --------------------------------------------

            else:

                image_id = getattr(
                    image,
                    "id",
                    None
                )


            if image_id:

                image_ids.append(
                    str(image_id)
                )


        return image_ids


    @staticmethod
    def route(payload):

        """
        Main Router
        """

        user_message = payload.get(
            "message"
        )

        chat_id = payload.get(
            "chat_id"
        )

        user_id = payload.get(
            "user_id"
        )


        # ====================================================
        # IMAGE ATTACHMENTS
        # ====================================================

        image_ids = ChatRouter.get_image_ids(
            payload
        )


        # ====================================================
        # PDF
        # ====================================================

        if ChatRouter.is_pdf_question(
            payload
        ):

            return PDFChatService.handle_pdf_chat(

                payload=payload,

                chat_id=chat_id,

                user_id=user_id

            )


        # ====================================================
        # GENERAL CHAT
        # ====================================================

        return GeneralChatService.handle_general_chat(

            user_message=user_message,

            chat_id=chat_id,

            user_id=user_id,

            image_ids=image_ids

        )
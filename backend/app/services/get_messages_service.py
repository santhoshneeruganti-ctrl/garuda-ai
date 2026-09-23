from app.database import connection


# ============================================================
# GET CHAT MESSAGES
# ============================================================

def get_chat_messages(chat_id: int):

    cursor = connection.cursor()

    try:

        # ====================================================
        # LOAD MESSAGES + PDF INFORMATION
        # ====================================================

        cursor.execute(
            """
            SELECT
                m.id,
                m.sender,
                m.message,
                m.pdf_id,
                p.file_name
            FROM messages m
            LEFT JOIN pdfs p
                ON m.pdf_id = p.id
            WHERE m.chat_id = ?
            ORDER BY m.id
            """,
            (chat_id,)
        )

        rows = cursor.fetchall()


        # ====================================================
        # BUILD MESSAGE RESPONSE
        # ====================================================

        messages = []


        for row in rows:

            message_id = row[0]
            sender = row[1]
            message = row[2]
            pdf_id = row[3]
            pdf_file_name = row[4]


            # ------------------------------------------------
            # PDF ATTACHMENT
            # ------------------------------------------------

            uploaded_pdfs = []


            if (
                pdf_id is not None
                and pdf_file_name
            ):

                uploaded_pdfs.append(
                    {
                        "id":
                            pdf_id,

                        "name":
                            pdf_file_name,
                    }
                )


            # ------------------------------------------------
            # IMAGE ATTACHMENTS
            # ------------------------------------------------

            uploaded_images = []


            try:

                cursor.execute(
                    """
                    SELECT
                        image_id,
                        file_name,
                        mime_type
                    FROM message_images
                    WHERE message_id = ?
                      AND chat_id = ?
                    ORDER BY id ASC
                    """,
                    (
                        message_id,
                        chat_id,
                    )
                )


                image_rows = (
                    cursor.fetchall()
                )


                for image_row in image_rows:

                    uploaded_images.append(
                        {
                            "id":
                                image_row[0],

                            "name":
                                image_row[1]
                                or "Uploaded image",

                            "mime_type":
                                image_row[2]
                                or "image/jpeg",
                        }
                    )


            except Exception as image_error:

                # ------------------------------------------------
                # Backward compatibility
                #
                # If the message_images table has not been
                # created yet, normal chat history must still work.
                # ------------------------------------------------

                print(
                    "⚠️ Image history unavailable:",
                    image_error
                )

                uploaded_images = []


            # ====================================================
            # FINAL MESSAGE OBJECT
            # ====================================================

            messages.append(
                {
                    "id":
                        message_id,

                    "sender":
                        sender,

                    "message":
                        message,

                    "uploaded_pdfs":
                        uploaded_pdfs,

                    "uploaded_images":
                        uploaded_images,
                }
            )


        # ====================================================
        # RESPONSE
        # ====================================================

        return {
            "status":
                "success",

            "chat_id":
                chat_id,

            "messages":
                messages,
        }


    finally:

        cursor.close()
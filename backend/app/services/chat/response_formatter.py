class ResponseFormatter:

    @staticmethod
    def build_ambiguous_pdf_message(ambiguous_pdfs):
        """
        Build a clarification message when multiple
        PDFs match the user's request.
        """
        if not ambiguous_pdfs:
            return ""

        lines = []
        lines.append(
            "I found multiple PDF documents that match your request.\n"
        )

        for ambiguity in ambiguous_pdfs:
            matches = ambiguity.get("matches", [])
            if not matches:
                continue

            lines.append("Please choose one of these PDFs:")

            for index, pdf in enumerate(matches, start=1):
                lines.append(f"{index}. {pdf['file_name']}")

        lines.append("")
        lines.append("Reply with the exact PDF name.")

        return "\n".join(lines)
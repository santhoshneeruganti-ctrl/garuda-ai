"""
Citation Builder

Builds a clean and professional list
of sources used in the final response.
"""

from urllib.parse import urlparse


def _get_domain_name(url: str) -> str:
    """
    Extract readable website name from URL.
    """

    try:
        domain = urlparse(url).netloc.lower()

        if domain.startswith("www."):
            domain = domain[4:]

        name = domain.split(".")[0]

        return name.replace("-", " ").title()

    except Exception:
        return "Unknown Source"


def build_citations(results: list) -> str:
    """
    Generate clean citations from search results.
    """

    if not results:
        return ""

    seen_urls = set()
    lines = []

    lines.append("")
    lines.append("## 📚 Sources")
    lines.append("")

    index = 1

    for item in results:

        url = item.get("url", "").strip()

        if not url:
            continue

        if url in seen_urls:
            continue

        seen_urls.add(url)

        title = item.get("title", "").strip()
        website = _get_domain_name(url)

        lines.append(f"### {index}. {website}")

        if title:
            lines.append(f"**Title:** {title}")

        lines.append(f"**Website:** {website}")
        lines.append(f"**Link:** {url}")
        lines.append("")

        index += 1

    return "\n".join(lines)
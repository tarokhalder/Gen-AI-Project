
import requests

WIKIPEDIA_API_URL = "https://en.wikipedia.org/w/api.php"

HEADERS = {
    "User-Agent": "ResearchSummarizer/1.0 (educational project; Python requests)"
}


def search_wikipedia(topic: str):
    params = {
        "action": "query",
        "format": "json",
        "generator": "search",
        "gsrsearch": topic,
        "gsrlimit": 4,
        "prop": "extracts|info",
        "exintro": True,
        "explaintext": True,
        "inprop": "url"
    }

    response = requests.get(
        WIKIPEDIA_API_URL,
        params=params,
        headers=HEADERS,
        timeout=20
    )

    response.raise_for_status()
    data = response.json()

    pages = data.get("query", {}).get("pages", {})

    results = []

    for page in pages.values():
        results.append({
            "title": page.get("title", ""),
            "summary": page.get("extract", ""),
            "url": page.get("fullurl", "")
        })

    return results

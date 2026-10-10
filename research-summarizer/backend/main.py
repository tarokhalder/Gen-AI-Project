from fastapi import FastAPI, HTTPException
from backend.schemas import ResearchRequest
from backend.wikipedia_service import search_wikipedia
from backend.crew import run_research_crew
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="AI Research Summarizer",
    description="Wikipedia + CrewAI + LangChain + FastAPI",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5500",
        "http://localhost:5500"
    ],
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"]
)

@app.get("/")
def home():
    return {
        "message": "AI Research Summarizer is running"
    }


@app.post("/research")
def research(request: ResearchRequest):
    try:
        results = search_wikipedia(request.topic)

        if not results:
            raise HTTPException(
                status_code=404,
                detail="No Wikipedia results found"
            )

        formatted_sources = []

        for index, source in enumerate(results, start=1):
            formatted_sources.append(
                f"""
Source {index}
Title: {source.get("title", "")}
Summary: {source.get("summary", "")}
URL: {source.get("url", "")}
"""
            )

        sources_text = "\n".join(formatted_sources)

        report = run_research_crew(
            topic=request.topic,
            sources=sources_text
        )

        return {
            "topic": request.topic,
            "source_count": len(results),
            "sources": results,
            "report": report
        }

    except HTTPException:
        raise

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=str(error)
        )

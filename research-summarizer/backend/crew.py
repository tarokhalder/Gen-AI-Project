import os
from dotenv import load_dotenv

import crewai.llms.cache as crewai_cache
crewai_cache.mark_cache_breakpoint = lambda msg: msg

from crewai import Agent, Task, Crew, Process, LLM

load_dotenv()

api_key = os.getenv("GROQ_API_KEY")

if not api_key:
    raise ValueError("GROQ_API_KEY not found in .env")

llm = LLM(
    model="groq/openai/gpt-oss-20b",
    api_key=api_key,
    temperature=0 , 
    max_tokens = 4000
)

researcher = Agent(
    role="Research Analyst",
    goal="Create an accurate research report from Wikipedia sources",
    backstory=(
        "You are a research analyst who organizes source material "
        "into clear, factual and useful reports."
    ),
    llm=llm,
    verbose=False
)

research_task = Task(
    description="""
    Research topic: {topic}

    Wikipedia source material:
    {sources}

    Create a report with these sections:
    1. Overview
    2. Key Findings
    3. Important Facts
    4. Conclusion

    Use only the supplied source material.
    Do not invent facts.
    Mention uncertainty when the sources do not provide enough information.
    """,
    expected_output=(
        "A clear research report containing an overview, key findings, "
        "important facts and a conclusion."
    ),
    agent=researcher
)

research_crew = Crew(
    agents=[researcher],
    tasks=[research_task],
    process=Process.sequential,
    verbose=False
)


def run_research_crew(topic: str, sources: str) -> str:
    result = research_crew.kickoff(
        inputs={
            "topic": topic,
            "sources": sources
        }
    )

    return str(result)
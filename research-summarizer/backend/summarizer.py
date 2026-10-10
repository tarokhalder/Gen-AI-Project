from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from backend.config import GROQ_API_KEY, GROQ_MODEL


model = ChatGroq(
    model=GROQ_MODEL,
    api_key=GROQ_API_KEY,
    temperature=0.2
)


prompt = ChatPromptTemplate.from_template("""
    You are an AI research assistant.
    Research topic: {topic}
    Wikipedia sources: {sources}
    Create a clear research summary with these sections:
      1. Overview
      2. Key Points
      3. Important Facts
      4. Conclusion

    Use only the information provided in the sources.
     If information is missing, mention that it is not available in the sources.
""")


chain = prompt | model | StrOutputParser()


def summarize_research(topic: str, sources: str) -> str:
    result = chain.invoke({
        "topic": topic,
        "sources": sources
    })

    return result

import os
import json

from dotenv import load_dotenv
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate

from schemas import EditorialResponse

load_dotenv()

model = ChatGroq(
    model="openai/gpt-oss-20b",
    temperature=0.2,
    api_key=os.getenv("GROQ_API_KEY")
)

prompt = ChatPromptTemplate.from_messages([
    (
        "system",
        """
You are an expert programming teacher and technical editorial writer.

Analyze the given programming problem and the user's code.

Return ONLY valid JSON.

The JSON must have exactly these fields:

{{
    "approach": "string",
    "algorithm": ["string", "string"],
    "why_it_works": "string",
    "complexity": "string",
    "code_explanation": "string",
    "common_mistakes": ["string", "string"],
    "alternative_approach": "string"
}}

Requirements:

- The approach must clearly explain the main idea.
- The algorithm must contain step-by-step instructions.
- Explain why the algorithm works.
- Give accurate time and space complexity.
- Explain the user's code clearly.
- Mention common mistakes.
- Give an alternative approach if one exists.
- Make sure the JSON is complete and valid.
- Do not use markdown.
- Do not add any text outside the JSON.
- Do not use trailing commas.
"""
    ),
    (
        "human",
        """
Problem Statement:

{problem}

Programming Language:

{language}

User Code:

{code}
"""
    )
])

chain = prompt | model


def generate_editorial(problem: str, code: str, language: str):
    response = chain.invoke({
        "problem": problem,
        "code": code,
        "language": language
    })

    content = response.content

    if isinstance(content, list):
        content = "".join(
            item.get("text", "") if isinstance(item, dict) else str(item)
            for item in content
        )

    content = content.strip()

    if content.startswith("```"):
        content = content.replace("```json", "", 1)
        content = content.replace("```", "", 1)
        content = content.strip()

    data = json.loads(content)

    result = EditorialResponse.model_validate(data)

    return result.model_dump()
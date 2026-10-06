from pydantic import BaseModel

class EditorialRequest(BaseModel):
    problem: str
    code: str
    language: str


class EditorialResponse(BaseModel):
    approach: str
    algorithm: list[str]
    why_it_works: str
    complexity: str
    code_explanation: str
    common_mistakes: list[str]
    alternative_approach: str    
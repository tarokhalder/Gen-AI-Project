from pydantic import BaseModel , Field

class ResearchRequest(BaseModel):
      topic : str = Field(
            min_length=3 ,
            max_length= 200,
            description= "The research Topic"
      )
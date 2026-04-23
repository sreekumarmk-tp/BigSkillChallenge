from typing import TypedDict, Annotated, Any, Dict
import operator
from pydantic import BaseModel, Field

# Define the state for LangGraph
class ScoringState(TypedDict):
    entry_content: str
    relevance_score: Annotated[float, lambda a, b: b]
    creativity_score: Annotated[float, lambda a, b: b]
    clarity_score: Annotated[float, lambda a, b: b]
    impact_score: Annotated[float, lambda a, b: b]
    relevance_feedback: Annotated[str, lambda a, b: b]
    creativity_feedback: Annotated[str, lambda a, b: b]
    clarity_feedback: Annotated[str, lambda a, b: b]
    impact_feedback: Annotated[str, lambda a, b: b]
    final_score: Annotated[float, lambda a, b: b]
    final_feedback: Annotated[str, lambda a, b: b]
    conflict_detected: Annotated[bool, operator.or_]

# Output models for LLMs
class AgentScoreOutput(BaseModel):
    score: float = Field(description="Score between 0 and 100")
    feedback: str = Field(description="A brief explanation for the score")

class AdjustmentOutput(BaseModel):
    relevance_score: float
    creativity_score: float
    clarity_score: float
    impact_score: float
    final_feedback: str

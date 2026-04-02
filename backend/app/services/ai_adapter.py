from app import schemas
from app.core.config import settings
import random

def evaluate_entry(content: str) -> schemas.ScoreResponse:
    # Deterministic Scoring stub
    
    # Calculate mock scores based on word length for now
    word_count = len(content.split())
    if word_count != 25:
        return schemas.ScoreResponse(
            relevance_score=0.0,
            creativity_score=0.0,
            clarity_score=0.0,
            impact_score=0.0,
            total_score=0.0,
            feedback="Your entry must be exactly 25 words."
        )
    
    if settings.LLM_PROVIDER == "mock" or not settings.LLM_API_KEY:
        # Generating mock deterministic scores
        relevance = round(random.uniform(70, 95), 2)
        creativity = round(random.uniform(60, 95), 2)
        clarity = round(random.uniform(75, 95), 2)
        impact = round(random.uniform(65, 95), 2)
        total = round((relevance + creativity + clarity + impact) / 4, 2)
        
        return schemas.ScoreResponse(
            relevance_score=relevance,
            creativity_score=creativity,
            clarity_score=clarity,
            impact_score=impact,
            total_score=total,
            feedback="Great effort! Your response has been evaluated by the AI engine."
        )
    else:
        # In a full implementation, integrate with OpenAI/Google GenAI here.
        # Returning mock for MVP simplicity
        return schemas.ScoreResponse(
            relevance_score=90.0,
            creativity_score=85.0,
            clarity_score=88.0,
            impact_score=80.0,
            total_score=85.75,
            feedback="Evaluated externally."
        )

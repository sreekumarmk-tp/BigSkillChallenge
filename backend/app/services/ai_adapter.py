from app import schemas
import random

# In a full implementation, this adapter would interact with LLM providers 
# based on environment variables (Groq for prod, Ollama for dev, Gemini for fallback)

def evaluate_entry(content: str) -> schemas.ScoreResponse:
    # Deterministic Scoring stub
    # A real prompt mapping might be implemented using langchain or direct API calls.
    
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
    
    # Generating mock deterministic scores (in prod, parse from JSON LLM output)
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

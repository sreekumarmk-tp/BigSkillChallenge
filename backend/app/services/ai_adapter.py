from app import schemas
from app.core.config import settings
from app.services.scoring_graph import scoring_graph
import random
from langsmith import traceable

def get_llm():
    provider = settings.LLM_PROVIDER.lower()
    model = settings.LLM_MODEL
    
    if provider == "groq":
        from langchain_groq import ChatGroq
        model_name = model or "llama-3.3-70b-versatile"
        return ChatGroq(model_name=model_name, groq_api_key=settings.GROQ_API_KEY or settings.LLM_API_KEY)
    elif provider == "ollama":
        from langchain_ollama import ChatOllama
        model_name = model or "gemma4"
        return ChatOllama(model=model_name, base_url=settings.OLLAMA_BASE_URL)
    elif provider == "gemini":
        from langchain_google_genai import ChatGoogleGenerativeAI
        model_name = model or "gemini-1.5-flash"
        return ChatGoogleGenerativeAI(model=model_name, google_api_key=settings.LLM_API_KEY)
    
    return None

@traceable(name="Evaluate Submission Entry")
async def evaluate_entry(content: str) -> schemas.ScoreResponse:
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
        
    llm = get_llm()
    
    if settings.LLM_PROVIDER == "mock" or not llm:
        # Deterministic dummy scoring
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
            feedback="Great effort! Your response has been evaluated by the AI engine (mock)."
        )
        
    # Execute graph
    inputs = {"entry_content": content}
    config = {"configurable": {"llm": llm}}
    
    try:
        final_state = await scoring_graph.ainvoke(inputs, config)
        
        return schemas.ScoreResponse(
            relevance_score=final_state.get("relevance_score", 0.0),
            creativity_score=final_state.get("creativity_score", 0.0),
            clarity_score=final_state.get("clarity_score", 0.0),
            impact_score=final_state.get("impact_score", 0.0),
            total_score=final_state.get("final_score", 0.0),
            feedback=final_state.get("final_feedback", "Evaluated successfully.")
        )
    except Exception as e:
        return schemas.ScoreResponse(
            relevance_score=0.0,
            creativity_score=0.0,
            clarity_score=0.0,
            impact_score=0.0,
            total_score=0.0,
            feedback=f"AI Evaluation failed: {str(e)}"
        )

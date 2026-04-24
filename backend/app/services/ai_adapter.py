from app import schemas
from app.core.config import settings
from app.services.scoring import scoring_graph
import hashlib
import random
from langsmith import traceable

# P2: Bump this version string whenever any scoring prompt changes.
# Stored on the Score record so scoreboard auditors can detect prompt-era differences.
SCORING_PROMPT_VERSION = "v1.0"


def get_llm():
    provider = settings.LLM_PROVIDER.lower()
    model = settings.LLM_MODEL

    if provider == "groq":
        from langchain_groq import ChatGroq
        model_name = model or "llama-3.3-70b-versatile"
        return ChatGroq(
            model_name=model_name,
            groq_api_key=settings.GROQ_API_KEY or settings.LLM_API_KEY,
            # P2: temperature=0 + top_p=1 + seed pins the output as deterministically as Groq allows.
            temperature=0,
            model_kwargs={"top_p": 1, "seed": 42},
        )
    elif provider == "ollama":
        from langchain_ollama import ChatOllama
        model_name = model or "gemma4"
        return ChatOllama(
            model=model_name,
            base_url=settings.OLLAMA_BASE_URL,
            # P2: temperature=0 + top_p=1 for maximum determinism on local models.
            temperature=0,
            top_p=1,
            seed=42,
        )
    elif provider == "gemini":
        from langchain_google_genai import ChatGoogleGenerativeAI
        model_name = model or "gemini-1.5-flash"
        return ChatGoogleGenerativeAI(
            model=model_name,
            google_api_key=settings.LLM_API_KEY,
            # P2: temperature=0 + top_p=1 pins output; Gemini does not expose a seed param.
            temperature=0,
            top_p=1,
        )

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
            feedback="Your entry must be exactly 25 words.",
            prompt_version=SCORING_PROMPT_VERSION,
        )

    llm = get_llm()

    if settings.LLM_PROVIDER == "mock" or not llm:
        # P2: Fully deterministic mock — MD5 hash of content seeds random.Random.
        # Same input always produces exactly the same score, regardless of call order.
        seed = int(hashlib.md5(content.encode()).hexdigest(), 16) % (2**32)
        rng = random.Random(seed)

        relevance = round(rng.uniform(70, 95), 2)
        creativity = round(rng.uniform(60, 95), 2)
        clarity = round(rng.uniform(75, 95), 2)
        impact = round(rng.uniform(65, 95), 2)
        total = round((relevance + creativity + clarity + impact) / 4, 2)

        return schemas.ScoreResponse(
            relevance_score=relevance,
            creativity_score=creativity,
            clarity_score=clarity,
            impact_score=impact,
            total_score=total,
            feedback="Great effort! Your response has been evaluated by the AI engine (mock-deterministic).",
            prompt_version=SCORING_PROMPT_VERSION,
        )

    # Execute LangGraph scoring pipeline
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
            feedback=final_state.get("final_feedback", "Evaluated successfully."),
            prompt_version=SCORING_PROMPT_VERSION,
        )
    except Exception as e:
        return schemas.ScoreResponse(
            relevance_score=0.0,
            creativity_score=0.0,
            clarity_score=0.0,
            impact_score=0.0,
            total_score=0.0,
            feedback=f"AI Evaluation failed: {str(e)}",
            prompt_version=SCORING_PROMPT_VERSION,
        )

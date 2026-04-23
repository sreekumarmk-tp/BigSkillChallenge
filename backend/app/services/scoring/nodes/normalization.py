import logging
from langsmith import traceable
from typing import Dict

from ..schema import ScoringState

logger = logging.getLogger(__name__)

@traceable
def normalization_node(state: ScoringState) -> Dict:
    # Calculate final total score if not provided
    total = (
        state.get("relevance_score", 0) +
        state.get("creativity_score", 0) +
        state.get("clarity_score", 0) +
        state.get("impact_score", 0)
    ) / 4.0
    
    feedback = state.get("final_feedback")
    if not feedback:
        feedback = f"Analyzed by AI. Highlights: {state.get('creativity_feedback')}"

    logger.info(f"Normalization node completed. Final score: {round(total, 2)}")
    return {
        "final_score": round(total, 2),
        "final_feedback": feedback
    }

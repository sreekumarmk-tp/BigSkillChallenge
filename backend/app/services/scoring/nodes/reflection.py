import logging
from langsmith import traceable
from typing import Dict
from langchain_core.runnables import RunnableConfig

from ..schema import ScoringState

logger = logging.getLogger(__name__)

@traceable
def reflection_node(state: ScoringState, config: RunnableConfig) -> Dict:
    # Consistency check
    metrics = [
        state.get("relevance_score", 0),
        state.get("creativity_score", 0),
        state.get("clarity_score", 0),
        state.get("impact_score", 0)
    ]
    
    # Simple reflection: if there's a huge discrepancy (e.g. > 50 points difference max to min)
    if max(metrics) - min(metrics) > 50:
        logger.warning(f"Conflict detected in scoring. Max discrepancy: {max(metrics) - min(metrics)}")
        return {"conflict_detected": True}
    return {"conflict_detected": False}

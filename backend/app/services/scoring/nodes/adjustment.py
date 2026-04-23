import logging
from langsmith import traceable
from typing import Dict
from langchain_core.messages import SystemMessage, HumanMessage
from langchain_core.runnables import RunnableConfig

from ..schema import ScoringState, AdjustmentOutput
from .base import get_llm

logger = logging.getLogger(__name__)

@traceable
def adjustment_node(state: ScoringState, config: RunnableConfig) -> Dict:
    llm = get_llm(config)
    structured_llm = llm.with_structured_output(AdjustmentOutput)
    prompt = [
        SystemMessage(content="You are a senior auditor. The sub-agents scored the entry with high divergence. Please re-evaluate and provide a harmonized score for relevance, creativity, clarity, and impact (0-100), along with a final feedback summary."),
        HumanMessage(content=f"Entry: {state['entry_content']}\n\nCurrent Scores:\nRelevance: {state.get('relevance_score')}\nCreativity: {state.get('creativity_score')}\nClarity: {state.get('clarity_score')}\nImpact: {state.get('impact_score')}\n\nPlease adjust.")
    ]
    response = structured_llm.invoke(prompt)
    logger.info("Adjustment node completed. Conflict resolved.")
    return {
        "relevance_score": response.relevance_score,
        "creativity_score": response.creativity_score,
        "clarity_score": response.clarity_score,
        "impact_score": response.impact_score,
        "final_feedback": response.final_feedback,
        "conflict_detected": False
    }

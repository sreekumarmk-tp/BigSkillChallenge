import logging
from langsmith import traceable
from typing import Dict
from langchain_core.messages import SystemMessage, HumanMessage
from langchain_core.runnables import RunnableConfig

from ..schema import ScoringState, AgentScoreOutput
from .base import get_llm

logger = logging.getLogger(__name__)

@traceable
def relevance_node(state: ScoringState, config: RunnableConfig) -> Dict:
    llm = get_llm(config)
    structured_llm = llm.with_structured_output(AgentScoreOutput)
    prompt = [
        SystemMessage(content="You are an expert evaluator assessing the Relevance of a 25-word creative entry. Does the content directly answer the prompt or challenge appropriately? Score from 0 to 100."),
        HumanMessage(content=f"Evaluate this entry:\n{state['entry_content']}")
    ]
    response = structured_llm.invoke(prompt)
    logger.info(f"Relevance node completed with score: {response.score}")
    return {"relevance_score": response.score, "relevance_feedback": response.feedback}

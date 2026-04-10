import json
import logging
from langsmith import traceable
from typing import TypedDict, Any, Dict
try:
    from typing import Annotated
except ImportError:
    from typing_extensions import Annotated
import operator
from pydantic import BaseModel, Field
from langgraph.graph import StateGraph, END
from langchain_core.messages import SystemMessage, HumanMessage
from langchain_core.language_models.chat_models import BaseChatModel
from langchain_core.runnables import RunnableConfig

logger = logging.getLogger(__name__)

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

# Define the get_llm utility to retrieve injected LLM via RunnableConfig
def get_llm(config: RunnableConfig) -> BaseChatModel:
    return config["configurable"].get("llm")

# Agent Nodes
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

@traceable
def creativity_node(state: ScoringState, config: RunnableConfig) -> Dict:
    llm = get_llm(config)
    structured_llm = llm.with_structured_output(AgentScoreOutput)
    prompt = [
        SystemMessage(content="You are an expert evaluator assessing the Creativity of a 25-word creative entry. Consider originality, use of metaphors, and unique perspective. Score from 0 to 100."),
        HumanMessage(content=f"Evaluate this entry:\n{state['entry_content']}")
    ]
    response = structured_llm.invoke(prompt)
    logger.info(f"Creativity node completed with score: {response.score}")
    return {"creativity_score": response.score, "creativity_feedback": response.feedback}

@traceable
def clarity_node(state: ScoringState, config: RunnableConfig) -> Dict:
    llm = get_llm(config)
    structured_llm = llm.with_structured_output(AgentScoreOutput)
    prompt = [
        SystemMessage(content="You are an expert evaluator assessing the Clarity of a 25-word creative entry. Focus on grammar, structure, and ease of understanding. Score from 0 to 100."),
        HumanMessage(content=f"Evaluate this entry:\n{state['entry_content']}")
    ]
    response = structured_llm.invoke(prompt)
    logger.info(f"Clarity node completed with score: {response.score}")
    return {"clarity_score": response.score, "clarity_feedback": response.feedback}

@traceable
def impact_node(state: ScoringState, config: RunnableConfig) -> Dict:
    llm = get_llm(config)
    structured_llm = llm.with_structured_output(AgentScoreOutput)
    prompt = [
        SystemMessage(content="You are an expert evaluator assessing the Impact of a 25-word creative entry. Focus on emotional resonance and effectiveness. Score from 0 to 100."),
        HumanMessage(content=f"Evaluate this entry:\n{state['entry_content']}")
    ]
    response = structured_llm.invoke(prompt)
    logger.info(f"Impact node completed with score: {response.score}")
    return {"impact_score": response.score, "impact_feedback": response.feedback}

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

class AdjustmentOutput(BaseModel):
    relevance_score: float
    creativity_score: float
    clarity_score: float
    impact_score: float
    final_feedback: str

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

# Build the Graph
def build_scoring_graph():
    builder = StateGraph(ScoringState)

    # Add parallel nodes
    builder.add_node("relevance", relevance_node)
    builder.add_node("creativity", creativity_node)
    builder.add_node("clarity", clarity_node)
    builder.add_node("impact", impact_node)
    
    # Add reflection and normalization
    builder.add_node("reflection", reflection_node)
    builder.add_node("adjustment", adjustment_node)
    builder.add_node("normalization", normalization_node)

    # Edges
    builder.set_entry_point("relevance")
    # Actually wait, set_entry_point can only be one node. To do parallel execution, we can use a fan-out from a dummy start node or add them as parallel branches.
    # A single start node that fans out is better.
    
    # We will define a bypass routing node that starts the fan out
    def start_node(state: ScoringState):
        return {}
        
    builder.add_node("start", start_node)
    builder.set_entry_point("start")
    
    builder.add_edge("start", "relevance")
    builder.add_edge("start", "creativity")
    builder.add_edge("start", "clarity")
    builder.add_edge("start", "impact")
    
    builder.add_edge("relevance", "reflection")
    builder.add_edge("creativity", "reflection")
    builder.add_edge("clarity", "reflection")
    builder.add_edge("impact", "reflection")
    
    # Conditional edge from reflection
    def reflection_router(state: ScoringState) -> str:
        if state.get("conflict_detected"):
            return "adjustment"
        return "normalization"
        
    builder.add_conditional_edges("reflection", reflection_router)
    builder.add_edge("adjustment", "normalization")
    builder.add_edge("normalization", END)

    return builder.compile()

scoring_graph = build_scoring_graph()

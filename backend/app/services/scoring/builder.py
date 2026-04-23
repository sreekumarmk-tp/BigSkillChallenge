from langgraph.graph import StateGraph, END
from .schema import ScoringState
from .nodes import (
    relevance_node,
    creativity_node,
    clarity_node,
    impact_node,
    reflection_node,
    adjustment_node,
    normalization_node
)

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

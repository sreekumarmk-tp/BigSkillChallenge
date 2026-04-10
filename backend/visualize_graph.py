import sys
import os

# Add the current directory to sys.path to allow importing 'app'
sys.path.append(os.getcwd())

from app.services.scoring_graph import scoring_graph

def generate_graph_viz():
    print("Generating LangGraph visualization...")
    try:
        # Generate Mermaid diagram in PNG format
        # Note: This requires 'grandalf', 'pygraphviz', or 'pydot' installed, 
        # or it will attempt to use a web service to render.
        graph_data = scoring_graph.get_graph().draw_mermaid_png()
        
        output_file = "scoring_flow.png"
        with open(output_file, "wb") as f:
            f.write(graph_data)
        
        print(f"Success! Graph visualization saved to: {os.path.abspath(output_file)}")
        
    except Exception as e:
        print(f"\n[!] PNG Visualization failed: {e}")
        print("\nFalling back to Mermaid Markdown format:")
        print("-" * 40)
        print(scoring_graph.get_graph().draw_mermaid())
        print("-" * 40)
        print("\nYou can paste the above Mermaid text into https://mermaid.live to view the graph.")

if __name__ == "__main__":
    generate_graph_viz()

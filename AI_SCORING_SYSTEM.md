# AI Scoring System Documentation

This document outlines the architecture, design patterns, and operational strategy of the **AI Scoring System** used in the Big Skill Challenge platform. 

---

## 🥇 Architecture Overview

The scoring system is built as a **Graph-based Orchestrator**, ensuring precise control over the flow of data and the execution of AI models.

- **Orchestration Engine**: [LangGraph](https://www.langchain.com/langgraph)
- **Workflow Pattern**: Parallel Execution + Aggregation + Reflection (PAR)
- **Operational Strategy**: **Controlled Workflow**. Unlike fully autonomous agents that may loop indefinitely or deviate from the task, this system follows a strictly defined state machine where every transition is programmed and monitored.

---

## 🏗️ System Workflow

The following diagram illustrates the lifecycle of a user submission through the AI evaluation graph.

```mermaid
graph TD
    %% Define Nodes
    Start([User Submission])
    PreVal[Pre-validation Node<br/><i>Check 25 words</i>]
    
    RelAgent[Relevance Agent]
    CreAgent[Creativity Agent]
    ClaAgent[Clarity Agent]
    ImpAgent[Impact Agent]
    
    Reject[Reject Submission]
    AggNode[Aggregation Node]
    ReflectNode[Reflection Node<br/><i>Consistency Check</i>]
    AdjustNode[Re-evaluation /<br/>Adjust Scores]
    NormNode[Normalization Node]
    StoreDB[(Store Scores in DB)]
    End([Return Score to User])

    %% Define Transitions
    Start --> PreVal
    
    PreVal -- Invalid --> Reject
    PreVal -- Valid --> RelAgent
    PreVal -- Valid --> CreAgent
    PreVal -- Valid --> ClaAgent
    PreVal -- Valid --> ImpAgent

    RelAgent --> AggNode
    CreAgent --> AggNode
    ClaAgent --> AggNode
    ImpAgent --> AggNode

    AggNode --> ReflectNode
    
    ReflectNode -- Needs Correction --> AdjustNode
    ReflectNode -- Valid --> NormNode
    
    AdjustNode --> NormNode
    
    NormNode --> StoreDB
    StoreDB --> End

    %% Styling
    style PreVal fill:#1a1a1a,stroke:#4CAF50,stroke-width:2px,color:#fff
    style RelAgent fill:#2a2a2a,stroke:#2196F3,color:#fff
    style CreAgent fill:#2a2a2a,stroke:#2196F3,color:#fff
    style ClaAgent fill:#2a2a2a,stroke:#2196F3,color:#fff
    style ImpAgent fill:#2a2a2a,stroke:#2196F3,color:#fff
    style Reject fill:#3d0000,stroke:#f44336,color:#fff
    style ReflectNode fill:#1a1a1a,stroke:#FF9800,stroke-width:2px,color:#fff
    style AggNode fill:#1a1a1a,stroke:#9C27B0,color:#fff
```

---

## 📑 Node Descriptions

### 1. Pre-validation Node
The entry point of the graph. It performs rigid structural checks before any LLM resources are consumed.
- **Constraint**: Exactly 25 words.
- **Outcome**: Failures are immediately routed to `Reject Submission`, bypassing the scoring logic to save costs and maintain data integrity.

### 2. Specialized Evaluation Agents (Parallel Branching)
The system fans out into four specialized agents, each focusing on a specific dimension of the submission. This parallelization ensures that each agent has a focused prompt ("System Message") which reduces hallucination and improves accuracy.

| Agent | Focus Area |
| :--- | :--- |
| **Relevance** | Does the content directly answer the prompt? |
| **Creativity** | Originality, use of metaphors, and unique perspective. |
| **Clarity** | Grammar, structure, and ease of understanding. |
| **Impact** | Emotional resonance and effectiveness of the 25-word limit. |

### 3. Aggregation Node
Collects the JSON outputs from all four parallel agents. It resolves potential data format discrepancies and prepares a unified state for the reflection phase.

### 4. Reflection Node
A critical quality control layer. Instead of blindly accepting the agents' outputs, this node performs a "Consistency Check."
- **Logic**: If the Creativity Agent gives a 100/100 but the Clarity Agent reports the content is unintelligible, the Reflection Node flags a conflict.
- **Path**: Routes to `Adjust Scores` if anomalies are detected.

### 5. Normalization & Persistence
Ensures all scores are mathematically aligned to the platform's leaderboard standards (e.g., scale of 0-100) and commits the final result to the PostgreSQL database.

---

## 💡 Key Design Decisions

> [!IMPORTANT]
> **Controlled Workflow vs. Autonomous Agents**
> We use LangGraph to treat LLM calls as discrete nodes in a state machine. This prevents "agentic drift" where an AI might decide to change the scoring criteria mid-process.

> [!TIP]
> **Resource Efficiency**
> By running agents in parallel, we reduce the total Wall-to-Wall latency of the request. The Pre-validation node also prevents unnecessary API costs on invalid submissions.

---

## 🛠️ Implementation Specs (Planned)
- **Engine**: Python / FastAPI
- **Graph Core**: `langgraph.graph.StateGraph`
- **Memory**: `langgraph.checkpoint.MemorySaver` for thread-safe state persistence during reflection loops.
- **Models**: Configurable via `.env` (variable `LLM_MODEL`). Supports Groq (e.g., `llama-3.3-70b-versatile`), Ollama (e.g., `gemma4`), and Gemini (e.g., `gemini-1.5-flash`).

from langchain_core.language_models.chat_models import BaseChatModel
from langchain_core.runnables import RunnableConfig

def get_llm(config: RunnableConfig) -> BaseChatModel:
    """Retrieve the injected LLM from the RunnableConfig."""
    return config["configurable"].get("llm")

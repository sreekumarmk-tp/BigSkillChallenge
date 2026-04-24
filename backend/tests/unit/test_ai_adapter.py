import pytest
from app.services import ai_adapter
from app.core.config import settings

@pytest.mark.asyncio
async def test_evaluate_entry_wrong_word_count():
    content = "This is not 25 words."
    result = await ai_adapter.evaluate_entry(content)
    assert result.total_score == 0.0
    assert "exactly 25 words" in result.feedback

@pytest.mark.asyncio
async def test_evaluate_entry_mock():
    # Use 25 words
    content = " ".join(["word"] * 25)
    # Ensure provider is mock
    settings.LLM_PROVIDER = "mock"
    result = await ai_adapter.evaluate_entry(content)
    assert result.total_score > 0
    assert "mock-deterministic" in result.feedback
    
    # Test determinism
    result2 = await ai_adapter.evaluate_entry(content)
    assert result.total_score == result2.total_score

def test_get_llm_none():
    settings.LLM_PROVIDER = "invalid"
    llm = ai_adapter.get_llm()
    assert llm is None

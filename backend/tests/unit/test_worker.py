import pytest
from app.worker import score_entry_task
from app import models
from sqlalchemy.orm import Session

@pytest.mark.asyncio
async def test_score_entry_task(db: Session, mock_ai_adapter):
    # 1. Create a competition and an entry
    comp = models.Competition(
        title="Test Comp",
        description="Test Desc",
        entry_fee=0.0,
        is_active=True
    )
    db.add(comp)
    db.commit()
    db.refresh(comp)
    
    user = models.User(
        email="worker@example.com",
        hashed_password="...",
        first_name="Worker",
        last_name="Test"
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    
    entry = models.Entry(
        user_id=str(user.id),
        competition_id=str(comp.id),
        content="This is a test entry with exactly twenty five words to satisfy the validation requirement during the scoring process which is performed by the worker.",
        status="submitted"
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    
    # 2. Run the task
    # ctx is not used in the function but passed by arq
    await score_entry_task(None, str(entry.id), entry.content)
    
    # 3. Verify results
    db.refresh(entry)
    assert entry.status == "scored"
    
    score = db.query(models.Score).filter(models.Score.entry_id == str(entry.id)).first()
    assert score is not None
    assert score.total_score == 32.5
    assert score.feedback == "Great response!"
    assert score.prompt_version == "v1"

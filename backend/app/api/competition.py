from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import models, schemas
from app.api import deps

router = APIRouter()

@router.get("/", response_model=List[schemas.CompetitionResponse])
def read_competitions(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    competitions = db.query(models.Competition).offset(skip).limit(limit).all()
    return competitions

@router.post("/", response_model=schemas.CompetitionResponse)
def create_competition(
    *,
    db: Session = Depends(deps.get_db),
    comp_in: schemas.CompetitionCreate,
) -> Any:
    comp = models.Competition(**comp_in.model_dump())
    db.add(comp)
    db.commit()
    db.refresh(comp)
    return comp

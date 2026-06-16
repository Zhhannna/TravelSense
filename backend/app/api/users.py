from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.user import User
from app.models.destination import Destination, Favorite, UserPreferences
from app.schemas.schemas import FavoriteOut, PreferencesOut, PreferencesUpdate
from app.core.security import get_current_user

router = APIRouter(prefix="/users", tags=["users"])


def _own(current_user: User, user_id: int):
    if current_user.id != user_id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Access denied")


@router.get("/{user_id}/favorites", response_model=list[FavoriteOut])
def get_favorites(user_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    _own(current_user, user_id)
    return db.query(Favorite).filter(Favorite.user_id == user_id).all()


@router.post("/{user_id}/favorites/{destination_id}", response_model=FavoriteOut, status_code=201)
def add_favorite(user_id: int, destination_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    _own(current_user, user_id)
    if not db.query(Destination).filter(Destination.id == destination_id).first():
        raise HTTPException(status_code=404, detail="Destination not found")
    if db.query(Favorite).filter(Favorite.user_id == user_id, Favorite.destination_id == destination_id).first():
        raise HTTPException(status_code=409, detail="Already in favorites")
    fav = Favorite(user_id=user_id, destination_id=destination_id)
    db.add(fav)
    db.commit()
    db.refresh(fav)
    return fav


@router.delete("/{user_id}/favorites/{destination_id}", status_code=204)
def remove_favorite(user_id: int, destination_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    _own(current_user, user_id)
    fav = db.query(Favorite).filter(Favorite.user_id == user_id, Favorite.destination_id == destination_id).first()
    if not fav:
        raise HTTPException(status_code=404, detail="Favorite not found")
    db.delete(fav)
    db.commit()


@router.get("/{user_id}/preferences", response_model=PreferencesOut)
def get_preferences(user_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    _own(current_user, user_id)
    prefs = db.query(UserPreferences).filter(UserPreferences.user_id == user_id).first()
    if not prefs:
        raise HTTPException(status_code=404, detail="Preferences not found")
    return prefs


@router.put("/{user_id}/preferences", response_model=PreferencesOut)
def update_preferences(user_id: int, payload: PreferencesUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    _own(current_user, user_id)
    prefs = db.query(UserPreferences).filter(UserPreferences.user_id == user_id).first()
    if not prefs:
        prefs = UserPreferences(user_id=user_id)
        db.add(prefs)
    for field, value in payload.model_dump(exclude_none=True).items():
        setattr(prefs, field, value)
    db.commit()
    db.refresh(prefs)
    return prefs

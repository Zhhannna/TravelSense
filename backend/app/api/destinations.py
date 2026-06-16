from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional
from app.db.session import get_db
from app.models.destination import Destination
from app.models.user import User
from app.schemas.schemas import DestinationCreate, DestinationUpdate, DestinationOut, PaginatedDestinations
from app.core.security import get_current_user, get_current_admin

router = APIRouter(prefix="/destinations", tags=["destinations"])


@router.get("", response_model=PaginatedDestinations)
def list_destinations(
    continent: Optional[str] = Query(None),
    travel_type: Optional[str] = Query(None),
    max_price: Optional[float] = Query(None),
    min_price: Optional[float] = Query(None),
    country: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    sort_by: str = Query("name"),
    db: Session = Depends(get_db),
):
    q = db.query(Destination)
    if continent:
        q = q.filter(func.lower(Destination.continent) == continent.lower())
    if travel_type:
        q = q.filter(func.lower(Destination.travel_type) == travel_type.lower())
    if max_price is not None:
        q = q.filter(Destination.avg_flight_price <= max_price)
    if min_price is not None:
        q = q.filter(Destination.avg_flight_price >= min_price)
    if country:
        q = q.filter(func.lower(Destination.country).contains(country.lower()))

    total = q.count()
    sort_col = {"name": Destination.name, "price": Destination.avg_flight_price, "country": Destination.country}.get(sort_by, Destination.name)
    items = q.order_by(sort_col).offset((page - 1) * limit).limit(limit).all()
    return PaginatedDestinations(total=total, page=page, limit=limit, pages=max(1, -(-total // limit)), items=items)


@router.get("/{destination_id}", response_model=DestinationOut)
def get_destination(destination_id: int, db: Session = Depends(get_db)):
    dest = db.query(Destination).filter(Destination.id == destination_id).first()
    if not dest:
        raise HTTPException(status_code=404, detail="Destination not found")
    return dest


@router.post("", response_model=DestinationOut, status_code=status.HTTP_201_CREATED)
def create_destination(
    payload: DestinationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    dest = Destination(**payload.model_dump())
    db.add(dest)
    db.commit()
    db.refresh(dest)
    return dest


@router.put("/{destination_id}", response_model=DestinationOut)
def update_destination(
    destination_id: int,
    payload: DestinationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    dest = db.query(Destination).filter(Destination.id == destination_id).first()
    if not dest:
        raise HTTPException(status_code=404, detail="Destination not found")
    for field, value in payload.model_dump(exclude_none=True).items():
        setattr(dest, field, value)
    db.commit()
    db.refresh(dest)
    return dest


@router.delete("/{destination_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_destination(
    destination_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    dest = db.query(Destination).filter(Destination.id == destination_id).first()
    if not dest:
        raise HTTPException(status_code=404, detail="Destination not found")
    db.delete(dest)
    db.commit()

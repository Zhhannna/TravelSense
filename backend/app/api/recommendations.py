from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.user import User
from app.models.destination import Destination, UserPreferences
from app.schemas.schemas import DestinationWithScore
from app.core.security import get_current_user
from app.services.external_api import get_weather, get_air_quality, compute_travel_score
import asyncio

router = APIRouter(prefix="/recommendations", tags=["recommendations"])


@router.get("", response_model=list[DestinationWithScore])
async def get_recommendations(
    limit: int = Query(5, ge=1, le=20),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    prefs = db.query(UserPreferences).filter(UserPreferences.user_id == current_user.id).first()
    budget = prefs.max_budget if prefs else 2000.0
    pref_type = prefs.preferred_travel_type if prefs else "any"
    pref_continent = prefs.preferred_continent if prefs else "any"

    destinations = db.query(Destination).all()

    async def score_dest(dest: Destination) -> DestinationWithScore:
        weather, aqi = await asyncio.gather(
            get_weather(dest.lat, dest.lon),
            get_air_quality(dest.lat, dest.lon),
        )
        score = compute_travel_score(
            weather_score=weather["score"],
            aqi_score=aqi["score"],
            avg_price=dest.avg_flight_price,
            budget=budget,
            travel_type_match=(pref_type == "any" or dest.travel_type == pref_type),
            continent_match=(pref_continent == "any" or dest.continent == pref_continent),
        )
        out = DestinationWithScore.model_validate(dest)
        out.travel_score = score
        out.weather_summary = weather.get("description", "")
        out.air_quality_index = aqi.get("aqi", 0)
        return out

    scored = await asyncio.gather(*[score_dest(d) for d in destinations])
    scored.sort(key=lambda x: x.travel_score or 0, reverse=True)
    return list(scored[:limit])

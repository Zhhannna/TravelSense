from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional
from datetime import datetime


# ── Auth ──────────────────────────────────────────────────────────────────────

class UserRegister(BaseModel):
    email: EmailStr
    username: str
    password: str

    @field_validator("password")
    @classmethod
    def password_min_length(cls, v):
        if len(v) < 6:
            raise ValueError("Password must be at least 6 characters")
        return v

    @field_validator("username")
    @classmethod
    def username_min_length(cls, v):
        if len(v) < 3:
            raise ValueError("Username must be at least 3 characters")
        return v


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: int
    email: str
    username: str
    role: str
    created_at: datetime

    model_config = {"from_attributes": True}


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


# ── Destination ───────────────────────────────────────────────────────────────

class DestinationCreate(BaseModel):
    name: str
    country: str
    continent: str
    travel_type: str
    description: Optional[str] = ""
    avg_flight_price: Optional[float] = 0.0
    currency_code: Optional[str] = "EUR"
    lat: Optional[float] = 0.0
    lon: Optional[float] = 0.0

    @field_validator("continent")
    @classmethod
    def validate_continent(cls, v):
        valid = {"Europe", "Asia", "Americas", "Africa", "Oceania", "Antarctica"}
        if v not in valid:
            raise ValueError(f"continent must be one of {valid}")
        return v

    @field_validator("travel_type")
    @classmethod
    def validate_travel_type(cls, v):
        valid = {"beach", "city", "mountain", "nature", "cultural"}
        if v not in valid:
            raise ValueError(f"travel_type must be one of {valid}")
        return v


class DestinationUpdate(BaseModel):
    name: Optional[str] = None
    country: Optional[str] = None
    continent: Optional[str] = None
    travel_type: Optional[str] = None
    description: Optional[str] = None
    avg_flight_price: Optional[float] = None
    currency_code: Optional[str] = None
    lat: Optional[float] = None
    lon: Optional[float] = None


class DestinationOut(BaseModel):
    id: int
    name: str
    country: str
    continent: str
    travel_type: str
    description: str
    avg_flight_price: float
    currency_code: str
    lat: float
    lon: float
    created_at: datetime

    model_config = {"from_attributes": True}


class DestinationWithScore(DestinationOut):
    travel_score: Optional[float] = None
    weather_summary: Optional[str] = None
    air_quality_index: Optional[int] = None


# ── Favorites ─────────────────────────────────────────────────────────────────

class FavoriteOut(BaseModel):
    id: int
    destination: DestinationOut
    created_at: datetime

    model_config = {"from_attributes": True}


# ── Preferences ───────────────────────────────────────────────────────────────

class PreferencesUpdate(BaseModel):
    max_budget: Optional[float] = None
    preferred_climate: Optional[str] = None
    preferred_continent: Optional[str] = None
    preferred_travel_type: Optional[str] = None


class PreferencesOut(BaseModel):
    id: int
    user_id: int
    max_budget: float
    preferred_climate: str
    preferred_continent: str
    preferred_travel_type: str

    model_config = {"from_attributes": True}


# ── Pagination ────────────────────────────────────────────────────────────────

class PaginatedDestinations(BaseModel):
    total: int
    page: int
    limit: int
    pages: int
    items: list[DestinationOut]

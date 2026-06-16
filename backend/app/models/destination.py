from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, func
from sqlalchemy.orm import relationship
from app.db.session import Base


class Destination(Base):
    __tablename__ = "destinations"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    country = Column(String, nullable=False)
    continent = Column(String, nullable=False)
    travel_type = Column(String, nullable=False)
    description = Column(String, default="")
    avg_flight_price = Column(Float, default=0.0)
    currency_code = Column(String, default="EUR")
    lat = Column(Float, default=0.0)
    lon = Column(Float, default=0.0)
    created_at = Column(DateTime, server_default=func.now())

    favorites = relationship("Favorite", back_populates="destination", cascade="all, delete-orphan")


class Favorite(Base):
    __tablename__ = "favorites"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    destination_id = Column(Integer, ForeignKey("destinations.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime, server_default=func.now())

    user = relationship("User", back_populates="favorites")
    destination = relationship("Destination", back_populates="favorites")


class UserPreferences(Base):
    __tablename__ = "user_preferences"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    max_budget = Column(Float, default=2000.0)
    preferred_climate = Column(String, default="any")
    preferred_continent = Column(String, default="any")
    preferred_travel_type = Column(String, default="any")
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    user = relationship("User", back_populates="preferences")

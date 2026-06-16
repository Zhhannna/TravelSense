from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.db.session import engine, Base
from app.api import auth, destinations, users, recommendations

import app.models.user       # noqa: F401
import app.models.destination # noqa: F401

app = FastAPI(
    title="TravelSense+ API",
    description="Intelligent travel recommendation system",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

PREFIX = "/api/v1"
app.include_router(auth.router, prefix=PREFIX)
app.include_router(destinations.router, prefix=PREFIX)
app.include_router(users.router, prefix=PREFIX)
app.include_router(recommendations.router, prefix=PREFIX)


@app.on_event("startup")
def startup():
    Base.metadata.create_all(bind=engine)
    _seed()


def _seed():
    from app.db.session import SessionLocal
    from app.models.destination import Destination
    db = SessionLocal()
    try:
        if db.query(Destination).count() > 0:
            return
        db.add_all([
            Destination(name="Barcelona",  country="Spain",       continent="Europe",   travel_type="city",     description="Vibrant Catalan capital with stunning Gaudí architecture and a beautiful coastline.", avg_flight_price=180,  currency_code="EUR", lat=41.39,  lon=2.15),
            Destination(name="Bali",       country="Indonesia",   continent="Asia",     travel_type="beach",    description="Tropical paradise with lush rice terraces, Hindu temples and world-class surf.", avg_flight_price=650,  currency_code="IDR", lat=-8.34,  lon=115.09),
            Destination(name="Kyoto",      country="Japan",       continent="Asia",     travel_type="cultural", description="Ancient imperial city with thousands of temples, geisha districts and cherry blossoms.", avg_flight_price=780,  currency_code="JPY", lat=35.01,  lon=135.76),
            Destination(name="Banff",      country="Canada",      continent="Americas", travel_type="mountain", description="Stunning Rocky Mountain scenery, turquoise lakes and incredible wildlife.", avg_flight_price=520,  currency_code="CAD", lat=51.17,  lon=-115.57),
            Destination(name="Lisbon",     country="Portugal",    continent="Europe",   travel_type="city",     description="Sun-soaked city of seven hills with incredible food, fado music and viewpoints.", avg_flight_price=120,  currency_code="EUR", lat=38.72,  lon=-9.14),
            Destination(name="Maldives",   country="Maldives",    continent="Asia",     travel_type="beach",    description="Overwater bungalows, crystal-clear lagoons and the world's best coral reefs.", avg_flight_price=1200, currency_code="USD", lat=3.20,   lon=73.22),
            Destination(name="Patagonia",  country="Argentina",   continent="Americas", travel_type="nature",   description="Wild, windswept landscapes at the end of the world with glaciers and condors.", avg_flight_price=980,  currency_code="ARS", lat=-51.62, lon=-69.22),
            Destination(name="Marrakech",  country="Morocco",     continent="Africa",   travel_type="cultural", description="Labyrinthine medina full of spice markets, riads and the iconic Djemaa el-Fna square.", avg_flight_price=210,  currency_code="MAD", lat=31.63,  lon=-7.99),
            Destination(name="Queenstown", country="New Zealand", continent="Oceania",  travel_type="mountain", description="Adventure capital of the world, surrounded by the Remarkables mountain range.", avg_flight_price=1300, currency_code="NZD", lat=-45.03, lon=168.66),
            Destination(name="Prague",     country="Czech Republic", continent="Europe", travel_type="city",   description="Fairy-tale old town with medieval architecture, a famous castle and lively nightlife.", avg_flight_price=140,  currency_code="CZK", lat=50.08,  lon=14.43),
        ])
        db.commit()
    finally:
        db.close()


@app.get("/health", tags=["system"])
def health():
    return {"status": "ok", "service": "TravelSense+ API"}

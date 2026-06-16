import httpx
import json
import logging
from typing import Optional
from app.core.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

_mem_cache: dict = {}


def _cache_key(prefix: str, *args) -> str:
    return f"{prefix}:" + ":".join(str(a) for a in args)


async def _cache_get(key: str) -> Optional[str]:
    try:
        import redis
        r = redis.from_url(settings.redis_url, decode_responses=True, socket_connect_timeout=0.5)
        val = r.get(key)
        if val:
            return val
    except Exception:
        pass
    return _mem_cache.get(key)


async def _cache_set(key: str, value: str, ex: int = 3600):
    try:
        import redis
        r = redis.from_url(settings.redis_url, decode_responses=True, socket_connect_timeout=0.5)
        r.set(key, value, ex=ex)
        return
    except Exception:
        pass
    _mem_cache[key] = value


def _mock_weather(lat: float, lon: float) -> dict:
    """Instant deterministic mock based on latitude — no network."""
    abs_lat = abs(lat)
    if abs_lat < 15:
        temp, desc = 30, "hot and sunny"
    elif abs_lat < 35:
        temp, desc = 24, "warm and sunny"
    elif abs_lat < 50:
        temp, desc = 16, "mild and cloudy"
    else:
        temp, desc = 5, "cold and overcast"
    temp = round(temp + (lon % 7) - 3, 1)
    score = round(max(0, min(100, 100 - abs(temp - 22) * 2.5)), 1)
    return {"temp": temp, "description": desc, "humidity": 60, "score": score}


def _mock_aqi(lat: float, lon: float) -> dict:
    val = int(abs(lat * 3 + lon * 7)) % 5
    aqi = val + 1
    return {"aqi": aqi, "score": {1: 100, 2: 82, 3: 62, 4: 35, 5: 15}[aqi]}


async def get_weather(lat: float, lon: float) -> dict:
    key = _cache_key("wx", round(lat, 1), round(lon, 1))
    cached = await _cache_get(key)
    if cached:
        return json.loads(cached)

    if not settings.openweather_api_key:
        result = _mock_weather(lat, lon)
        await _cache_set(key, json.dumps(result))
        return result

    try:
        async with httpx.AsyncClient(timeout=4) as client:
            resp = await client.get(
                "https://api.openweathermap.org/data/2.5/weather",
                params={"lat": lat, "lon": lon, "appid": settings.openweather_api_key, "units": "metric"},
            )
            resp.raise_for_status()
            data = resp.json()
            result = {
                "temp": data["main"]["temp"],
                "description": data["weather"][0]["description"],
                "humidity": data["main"]["humidity"],
                "score": _weather_score(data["main"]["temp"], data["weather"][0]["id"]),
            }
    except Exception as e:
        logger.warning(f"Weather API error ({lat},{lon}): {e} — using mock")
        result = _mock_weather(lat, lon)

    await _cache_set(key, json.dumps(result))
    return result


def _weather_score(temp: float, condition_id: int) -> float:
    temp_score = max(0, min(100, 100 - abs(temp - 22) * 3))
    cond_score = 80 if condition_id < 300 else 60 if condition_id < 600 else 40 if condition_id < 700 else 50
    return round(temp_score * 0.6 + cond_score * 0.4, 1)


async def get_air_quality(lat: float, lon: float) -> dict:
    key = _cache_key("aqi", round(lat, 1), round(lon, 1))
    cached = await _cache_get(key)
    if cached:
        return json.loads(cached)

    if not settings.openweather_api_key:
        result = _mock_aqi(lat, lon)
        await _cache_set(key, json.dumps(result))
        return result

    try:
        async with httpx.AsyncClient(timeout=4) as client:
            resp = await client.get(
                "https://api.openweathermap.org/data/2.5/air_pollution",
                params={"lat": lat, "lon": lon, "appid": settings.openweather_api_key},
            )
            resp.raise_for_status()
            data = resp.json()
            aqi = data["list"][0]["main"]["aqi"]
            result = {"aqi": aqi, "score": {1: 100, 2: 82, 3: 62, 4: 35, 5: 15}.get(aqi, 50)}
    except Exception as e:
        logger.warning(f"AQI error ({lat},{lon}): {e} — using mock")
        result = _mock_aqi(lat, lon)

    await _cache_set(key, json.dumps(result))
    return result


def compute_travel_score(
    weather_score: float, aqi_score: float, avg_price: float,
    budget: float, travel_type_match: bool, continent_match: bool,
) -> float:
    price_score = max(0, min(100, 100 - (avg_price / max(budget, 1)) * 80)) if avg_price > 0 else 60
    type_score = 100 if travel_type_match else 50
    continent_score = 100 if continent_match else 60
    return round(weather_score * 0.30 + aqi_score * 0.20 + price_score * 0.25 + type_score * 0.15 + continent_score * 0.10, 1)

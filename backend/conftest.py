import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.db.session import Base, get_db

TEST_DB_URL = "sqlite:///./test_travelsense.db"
engine_test = create_engine(TEST_DB_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine_test)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db


@pytest.fixture(scope="function", autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine_test)
    yield
    Base.metadata.drop_all(bind=engine_test)


@pytest.fixture
def client():
    return TestClient(app)


@pytest.fixture
def registered_user(client):
    r = client.post("/api/v1/auth/register", json={"email": "test@test.com", "username": "testuser", "password": "secret123"})
    assert r.status_code == 201
    return r.json()


@pytest.fixture
def auth_headers(registered_user):
    return {"Authorization": f"Bearer {registered_user['access_token']}"}


@pytest.fixture
def admin_headers(client):
    from app.models.user import User
    from app.core.security import hash_password
    db = TestingSessionLocal()
    admin = User(email="admin@test.com", username="admin", hashed_password=hash_password("admin123"), role="admin")
    db.add(admin)
    db.commit()
    db.refresh(admin)
    db.close()
    r = client.post("/api/v1/auth/login", json={"email": "admin@test.com", "password": "admin123"})
    return {"Authorization": f"Bearer {r.json()['access_token']}"}


@pytest.fixture
def sample_destination(client, admin_headers):
    r = client.post("/api/v1/destinations", json={
        "name": "Paris", "country": "France", "continent": "Europe",
        "travel_type": "city", "description": "City of Light",
        "avg_flight_price": 200.0, "currency_code": "EUR", "lat": 48.85, "lon": 2.35,
    }, headers=admin_headers)
    assert r.status_code == 201
    return r.json()

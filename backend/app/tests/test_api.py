import pytest
from fastapi.testclient import TestClient


class TestHealth:
    def test_health(self, client):
        r = client.get("/health")
        assert r.status_code == 200
        assert r.json()["status"] == "ok"


class TestAuth:
    def test_register_ok(self, client):
        r = client.post("/api/v1/auth/register", json={"email": "a@b.com", "username": "aaa", "password": "pass123"})
        assert r.status_code == 201
        assert "access_token" in r.json()

    def test_register_duplicate_email(self, client, registered_user):
        r = client.post("/api/v1/auth/register", json={"email": "test@test.com", "username": "other", "password": "pass123"})
        assert r.status_code == 400

    def test_register_short_password(self, client):
        r = client.post("/api/v1/auth/register", json={"email": "x@x.com", "username": "xuser", "password": "ab"})
        assert r.status_code == 422

    def test_login_ok(self, client, registered_user):
        r = client.post("/api/v1/auth/login", json={"email": "test@test.com", "password": "secret123"})
        assert r.status_code == 200
        assert "access_token" in r.json()

    def test_login_wrong_password(self, client, registered_user):
        r = client.post("/api/v1/auth/login", json={"email": "test@test.com", "password": "wrong"})
        assert r.status_code == 401

    def test_me_ok(self, client, auth_headers):
        r = client.get("/api/v1/auth/me", headers=auth_headers)
        assert r.status_code == 200
        assert r.json()["email"] == "test@test.com"

    def test_me_no_token(self, client):
        r = client.get("/api/v1/auth/me")
        assert r.status_code == 401


class TestDestinations:
    def test_list_empty(self, client):
        r = client.get("/api/v1/destinations")
        assert r.status_code == 200
        assert r.json()["total"] == 0

    def test_create_admin_ok(self, client, admin_headers):
        r = client.post("/api/v1/destinations", json={
            "name": "Rome", "country": "Italy", "continent": "Europe",
            "travel_type": "city", "avg_flight_price": 160.0, "currency_code": "EUR", "lat": 41.9, "lon": 12.5
        }, headers=admin_headers)
        assert r.status_code == 201
        assert r.json()["name"] == "Rome"

    def test_create_forbidden_user(self, client, auth_headers):
        r = client.post("/api/v1/destinations", json={
            "name": "Rome", "country": "Italy", "continent": "Europe",
            "travel_type": "city", "lat": 41.9, "lon": 12.5
        }, headers=auth_headers)
        assert r.status_code == 403

    def test_create_invalid_continent(self, client, admin_headers):
        r = client.post("/api/v1/destinations", json={
            "name": "X", "country": "Y", "continent": "Mars", "travel_type": "city", "lat": 0, "lon": 0
        }, headers=admin_headers)
        assert r.status_code == 422

    def test_get_ok(self, client, sample_destination):
        r = client.get(f"/api/v1/destinations/{sample_destination['id']}")
        assert r.status_code == 200
        assert r.json()["name"] == "Paris"

    def test_get_not_found(self, client):
        r = client.get("/api/v1/destinations/9999")
        assert r.status_code == 404

    def test_update_ok(self, client, admin_headers, sample_destination):
        r = client.put(f"/api/v1/destinations/{sample_destination['id']}", json={"description": "Updated"}, headers=admin_headers)
        assert r.status_code == 200
        assert r.json()["description"] == "Updated"

    def test_delete_ok(self, client, admin_headers, sample_destination):
        did = sample_destination["id"]
        assert client.delete(f"/api/v1/destinations/{did}", headers=admin_headers).status_code == 204
        assert client.get(f"/api/v1/destinations/{did}").status_code == 404


class TestFiltering:
    def _seed(self, client, admin_headers):
        for d in [
            {"name": "London", "country": "UK", "continent": "Europe", "travel_type": "city", "avg_flight_price": 100.0, "currency_code": "GBP", "lat": 51.5, "lon": -0.1},
            {"name": "Sydney", "country": "Australia", "continent": "Oceania", "travel_type": "beach", "avg_flight_price": 900.0, "currency_code": "AUD", "lat": -33.8, "lon": 151.2},
        ]:
            client.post("/api/v1/destinations", json=d, headers=admin_headers)

    def test_filter_continent(self, client, admin_headers):
        self._seed(client, admin_headers)
        r = client.get("/api/v1/destinations?continent=Europe")
        assert all(i["continent"] == "Europe" for i in r.json()["items"])

    def test_filter_max_price(self, client, admin_headers):
        self._seed(client, admin_headers)
        r = client.get("/api/v1/destinations?max_price=200")
        assert all(i["avg_flight_price"] <= 200 for i in r.json()["items"])

    def test_pagination(self, client, admin_headers):
        self._seed(client, admin_headers)
        r = client.get("/api/v1/destinations?page=1&limit=1")
        d = r.json()
        assert len(d["items"]) == 1
        assert d["total"] == 2
        assert d["pages"] == 2


class TestFavorites:
    def test_add_list_remove(self, client, auth_headers, registered_user, sample_destination):
        uid, did = registered_user["user"]["id"], sample_destination["id"]
        assert client.post(f"/api/v1/users/{uid}/favorites/{did}", headers=auth_headers).status_code == 201
        r = client.get(f"/api/v1/users/{uid}/favorites", headers=auth_headers)
        assert len(r.json()) == 1
        assert client.delete(f"/api/v1/users/{uid}/favorites/{did}", headers=auth_headers).status_code == 204

    def test_duplicate_favorite(self, client, auth_headers, registered_user, sample_destination):
        uid, did = registered_user["user"]["id"], sample_destination["id"]
        client.post(f"/api/v1/users/{uid}/favorites/{did}", headers=auth_headers)
        r = client.post(f"/api/v1/users/{uid}/favorites/{did}", headers=auth_headers)
        assert r.status_code == 409


class TestPreferences:
    def test_get_preferences(self, client, auth_headers, registered_user):
        uid = registered_user["user"]["id"]
        r = client.get(f"/api/v1/users/{uid}/preferences", headers=auth_headers)
        assert r.status_code == 200
        assert "max_budget" in r.json()

    def test_update_preferences(self, client, auth_headers, registered_user):
        uid = registered_user["user"]["id"]
        r = client.put(f"/api/v1/users/{uid}/preferences", json={"max_budget": 5000, "preferred_climate": "warm"}, headers=auth_headers)
        assert r.status_code == 200
        assert r.json()["max_budget"] == 5000.0

    def test_access_denied(self, client, auth_headers):
        r = client.post("/api/v1/auth/register", json={"email": "other@x.com", "username": "other2", "password": "pass123"})
        other_id = r.json()["user"]["id"]
        r2 = client.get(f"/api/v1/users/{other_id}/preferences", headers=auth_headers)
        assert r2.status_code == 403


class TestRecommendations:
    def test_requires_auth(self, client):
        assert client.get("/api/v1/recommendations").status_code == 401

    def test_returns_list(self, client, auth_headers, sample_destination):
        r = client.get("/api/v1/recommendations", headers=auth_headers)
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_limit(self, client, auth_headers, admin_headers):
        for i in range(4):
            client.post("/api/v1/destinations", json={
                "name": f"City{i}", "country": "X", "continent": "Europe",
                "travel_type": "city", "avg_flight_price": 200.0, "currency_code": "EUR",
                "lat": 48.0 + i, "lon": 2.0,
            }, headers=admin_headers)
        r = client.get("/api/v1/recommendations?limit=2", headers=auth_headers)
        assert len(r.json()) <= 2

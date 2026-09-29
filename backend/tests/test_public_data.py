def test_dfe_public_data_endpoint(client):
    login = client.post(
        "/api/auth/login",
        json={"email": "admin@demo.edu", "password": "Admin@123"},
    )
    assert login.status_code == 200
    token = login.json()["access_token"]

    response = client.get(
        "/api/analytics/public/dfe-attendance",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    payload = response.json()
    assert payload["source"] == "UK Department for Education"
    assert payload["dataset_id"] == "c0be1b5f-4240-4f99-ba80-70be8916c5ef"

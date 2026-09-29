def test_login(client):
    r=client.post("/api/auth/login",json={"email":"teacher@demo.edu","password":"Teacher@123"})
    assert r.status_code==200 and r.json()["access_token"]

def test_invalid_login(client):
    r=client.post("/api/auth/login",json={"email":"teacher@demo.edu","password":"wrong-password"})
    assert r.status_code==401

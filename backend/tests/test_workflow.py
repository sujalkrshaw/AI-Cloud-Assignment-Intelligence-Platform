def auth(client,email,password):
    r=client.post("/api/auth/login",json={"email":email,"password":password}); assert r.status_code==200; return {"Authorization":"Bearer "+r.json()["access_token"]}

def test_student_can_list_assignments(client):
    h=auth(client,"student1@demo.edu","Student@123")
    r=client.get("/api/assignments",headers=h); assert r.status_code==200; assert len(r.json())>=1

def test_student_cannot_create_assignment(client):
    h=auth(client,"student1@demo.edu","Student@123")
    r=client.post("/api/assignments",headers=h,json={"course_id":1,"title":"Bad","description":"This should be rejected","deadline":"2030-01-01T00:00:00","max_marks":10,"rubric":"Accuracy: 100%"})
    assert r.status_code==403

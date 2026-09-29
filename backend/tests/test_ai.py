from backend.ai.engine import similarity, suggested_grade


def test_similarity_high_for_related_text():
    score = similarity(
        "cloud storage database api security",
        "cloud storage database api security",
    )
    assert score > 99


def test_grade_is_bounded():
    rubric = (
        "Technical accuracy: 40%; "
        "Cloud architecture: 25%; "
        "Security: 20%; "
        "Clarity and completeness: 15%"
    )

    result = suggested_grade(
        "cloud storage database security",
        "Explain cloud storage database security",
        rubric,
        50,
    )

    marks, rel, feedback, matrix = result

    assert 0 <= marks <= 50
    assert 0 <= rel <= 100
    assert feedback
    assert matrix

    for criterion in matrix:
        assert 0 <= criterion["score"] <= criterion["max"]

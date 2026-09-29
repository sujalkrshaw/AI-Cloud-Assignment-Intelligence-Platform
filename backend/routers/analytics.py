from pathlib import Path
import csv
import statistics

from fastapi import APIRouter, Depends, HTTPException

from ..core.deps import require_role


router = APIRouter(prefix="/analytics", tags=["Analytics"])


# ---------------------------------------------------------------------------
# UCI Student Performance dataset
# ---------------------------------------------------------------------------

DATA_ROOT = Path(__file__).resolve().parents[2] / "data" / "real"


def files():
    """Return all CSV files available in the real-data directory."""
    return list(DATA_ROOT.glob("*.csv")) + list(DATA_ROOT.glob("**/*.csv"))


def find_dataset_file(filename: str):
    """Locate a specific UCI dataset CSV."""
    matches = list(DATA_ROOT.glob(filename))

    if not matches:
        matches = list(DATA_ROOT.glob(f"**/{filename}"))

    return matches[0] if matches else None


def read_csv_rows(path: Path):
    """
    Read a CSV file safely and automatically detect the delimiter.

    Supported delimiters:
    - comma (,)
    - semicolon (;)

    This is important because:
    - UCI Student Performance CSV files use ';'
    - UK DfE attendance CSV uses ','
    """
    try:
        with path.open(
            "r",
            encoding="utf-8",
            errors="ignore",
            newline=""
        ) as f:

            # Read a sample so csv.Sniffer can determine the delimiter.
            sample = f.read(4096)
            f.seek(0)

            try:
                dialect = csv.Sniffer().sniff(
                    sample,
                    delimiters=",;"
                )
            except csv.Error:
                # Safe fallback for normal comma-separated CSV files.
                dialect = csv.get_dialect("excel")

            return list(
                csv.DictReader(
                    f,
                    dialect=dialect
                )
            )

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Unable to read dataset {path.name}: {exc}"
        )


def numeric_values(rows, column):
    """Extract numeric values from a dataset column."""
    values = []

    for row in rows:
        try:
            value = float(row.get(column, ""))
            values.append(value)
        except (TypeError, ValueError):
            continue

    return values


def calculate_dataset_metrics(rows):
    """
    Calculate real statistics from UCI Student Performance records.

    G3 is the final grade and ranges from 0 to 20 in the UCI dataset.
    A grade >= 10 is treated as passing for this analytics view.
    """

    record_count = len(rows)

    g3 = numeric_values(rows, "G3")
    absences = numeric_values(rows, "absences")
    studytime = numeric_values(rows, "studytime")
    failures = numeric_values(rows, "failures")
    age = numeric_values(rows, "age")

    pass_count = sum(value >= 10 for value in g3)
    fail_count = sum(value < 10 for value in g3)

    grade_distribution = {
        "0-4": sum(0 <= value <= 4 for value in g3),
        "5-9": sum(5 <= value <= 9 for value in g3),
        "10-14": sum(10 <= value <= 14 for value in g3),
        "15-20": sum(15 <= value <= 20 for value in g3),
    }

    return {
        "records": record_count,

        "average_final_grade": round(
            statistics.mean(g3), 2
        ) if g3 else 0,

        "median_final_grade": round(
            statistics.median(g3), 2
        ) if g3 else 0,

        "minimum_final_grade": min(g3) if g3 else 0,

        "maximum_final_grade": max(g3) if g3 else 0,

        "average_absences": round(
            statistics.mean(absences), 2
        ) if absences else 0,

        "average_studytime": round(
            statistics.mean(studytime), 2
        ) if studytime else 0,

        "average_failures": round(
            statistics.mean(failures), 2
        ) if failures else 0,

        "average_age": round(
            statistics.mean(age), 2
        ) if age else 0,

        "pass_count": pass_count,

        "fail_count": fail_count,

        "pass_rate": round(
            (pass_count / len(g3)) * 100, 2
        ) if g3 else 0,

        "fail_rate": round(
            (fail_count / len(g3)) * 100, 2
        ) if g3 else 0,

        "grade_distribution": grade_distribution,

        "available_columns": list(rows[0].keys()) if rows else [],
    }


# ---------------------------------------------------------------------------
# Existing dataset status endpoint
# ---------------------------------------------------------------------------

@router.get("/dataset")
def dataset_status(
    user=Depends(require_role("student", "teacher", "admin"))
):
    fs = files()

    if not fs:
        return {
            "source": "UCI Student Performance",
            "available": False,
            "records": 649,
            "message": (
                "Run scripts/download_uci_student_performance.py "
                "to acquire the public dataset."
            ),
        }

    # Prefer the Portuguese dataset because it contains 649 records.
    preferred = find_dataset_file("student-por.csv")

    if preferred:
        path = preferred
    else:
        path = fs[0]

    try:
        with path.open(
            "r",
            encoding="utf-8",
            errors="ignore"
        ) as f:
            # Count data rows. Delimiter does not affect line count.
            rows = sum(1 for _ in csv.DictReader(f))

        return {
            "source": "UCI Student Performance",
            "available": True,
            "records": rows,
            "file": path.name,
        }

    except Exception:
        return {
            "source": "UCI Student Performance",
            "available": True,
            "records": None,
            "file": path.name,
        }


# ---------------------------------------------------------------------------
# Dataset metadata
# ---------------------------------------------------------------------------

@router.get("/dataset/metadata")
def dataset_metadata(
    user=Depends(require_role("teacher", "admin"))
):
    fs = files()

    return {
        "files": [
            {
                "name": p.name,
                "size_bytes": p.stat().st_size,
            }
            for p in fs
        ],
        "expected_records": 649,
        "source": "UCI Student Performance",
        "acquisition_command": (
            "python scripts/download_uci_student_performance.py"
        ),
    }


# ---------------------------------------------------------------------------
# Real UCI performance analytics
# ---------------------------------------------------------------------------

@router.get("/dataset/performance")
def dataset_performance(
    user=Depends(require_role("student", "teacher", "admin"))
):
    """
    Return statistics calculated directly from the downloaded
    UCI Student Performance CSV files.

    This endpoint does NOT mix UCI research data with platform
    assignment/submission data.
    """

    math_file = find_dataset_file("student-mat.csv")
    portuguese_file = find_dataset_file("student-por.csv")

    if not math_file and not portuguese_file:
        raise HTTPException(
            status_code=404,
            detail=(
                "UCI dataset not found. "
                "Run scripts/download_uci_student_performance.py first."
            ),
        )

    response = {
        "source": "UCI Student Performance",
        "source_type": "public_research_dataset",
        "description": (
            "Real public UCI Student Performance research data. "
            "These records are separate from platform users and submissions."
        ),
        "datasets": {},
    }

    if math_file:
        math_rows = read_csv_rows(math_file)

        response["datasets"]["math"] = {
            "file": math_file.name,
            "subject": "Mathematics",
            "metrics": calculate_dataset_metrics(math_rows),
        }

    if portuguese_file:
        portuguese_rows = read_csv_rows(portuguese_file)

        response["datasets"]["portuguese"] = {
            "file": portuguese_file.name,
            "subject": "Portuguese",
            "metrics": calculate_dataset_metrics(portuguese_rows),
        }

    return response


# ---------------------------------------------------------------------------
# Admin dataset acquisition
# ---------------------------------------------------------------------------

@router.post("/dataset/acquire")
def acquire_dataset(
    user=Depends(require_role("admin"))
):
    import subprocess
    import sys

    root = Path(__file__).resolve().parents[2]

    try:
        result = subprocess.run(
            [
                sys.executable,
                "scripts/download_uci_student_performance.py",
            ],
            cwd=root,
            text=True,
            capture_output=True,
            timeout=60,
        )

        if result.returncode != 0:
            raise HTTPException(
                status_code=502,
                detail=(
                    "Dataset download failed: "
                    + (result.stderr[-500:] or result.stdout[-500:])
                ),
            )

        return {
            "status": "acquired",
            "output": result.stdout[-1000:],
        }

    except subprocess.TimeoutExpired:
        raise HTTPException(
            status_code=504,
            detail="Dataset download timed out",
        )


# ---------------------------------------------------------------------------
# UK Department for Education — recent official public attendance data
# ---------------------------------------------------------------------------

DFE_DATA_URL = (
    "https://explore-education-statistics.service.gov.uk/"
    "data-catalogue/data-set/"
    "c0be1b5f-4240-4f99-ba80-70be8916c5ef/csv"
)

DFE_ROOT = DATA_ROOT / "public" / "dfe_attendance"

DFE_CSV = DFE_ROOT / "pupil_attendance_weekly_2026_week37.csv"

DFE_META = DFE_ROOT / "metadata.json"


def _read_dfe_rows():
    """Read the downloaded DfE attendance dataset."""
    if not DFE_CSV.exists():
        return []

    return read_csv_rows(DFE_CSV)


def _dfe_metrics(rows):
    """Calculate summary metrics from the official DfE dataset."""

    def nums(key):
        return numeric_values(rows, key)

    attendance = nums("attendance_perc")
    absence = nums("overall_absence_perc")
    enrolments = nums("enrolments")
    schools = nums("num_schools")

    phases = {}
    geographies = set()

    for row in rows:
        phase = row.get("education_phase") or "Unknown"

        phases[phase] = phases.get(phase, 0) + 1

        if row.get("geographic_level"):
            geographies.add(row["geographic_level"])

    national = [
        r for r in rows
        if (r.get("geographic_level") or "").lower() == "national"
    ]

    local_authorities = {
        r.get("la_name")
        for r in rows
        if (
            r.get("geographic_level") == "Local authority"
            and r.get("la_name")
        )
    }

    # Avoid None being reported as a local-authority name.
    local_authorities.discard(None)

    return {
        "records": len(rows),

        "attendance_rate_avg": (
            round(statistics.mean(attendance), 2)
            if attendance
            else 0
        ),

        "absence_rate_avg": (
            round(statistics.mean(absence), 2)
            if absence
            else 0
        ),

        "enrolments_total": (
            round(sum(enrolments), 1)
            if enrolments
            else 0
        ),

        "schools_total": (
            round(sum(schools), 1)
            if schools
            else 0
        ),

        "local_authorities": len(local_authorities),

        "education_phases": phases,

        "geographic_levels": sorted(geographies),

        "national_rows": len(national),

        "latest_time_period": (
            rows[0].get("time_period")
            if rows
            else None
        ),

        "latest_time_identifier": (
            rows[0].get("time_identifier")
            if rows
            else None
        ),
    }


@router.get("/public/dfe-attendance")
def dfe_attendance(
    user=Depends(require_role("student", "teacher", "admin"))
):
    """Return official UK DfE pupil-attendance analytics."""

    rows = _read_dfe_rows()

    if not rows:
        return {
            "available": False,
            "source": "UK Department for Education",
            "dataset": (
                "Pupil attendance since week commencing "
                "07 September 2026 - weekly"
            ),
            "dataset_id": (
                "c0be1b5f-4240-4f99-ba80-70be8916c5ef"
            ),
            "release": "Week 37 2026 (Start of 26/27 AY)",
            "published": "2026-09-24",
            "data_period": (
                "Week commencing 07 September 2026"
            ),
            "records": 0,
            "source_url": (
                "https://explore-education-statistics.service.gov.uk/"
                "data-catalogue/data-set/"
                "c0be1b5f-4240-4f99-ba80-70be8916c5ef"
            ),
            "download_url": DFE_DATA_URL,
        }

    metadata = {}

    if DFE_META.exists():
        try:
            import json

            metadata = json.loads(
                DFE_META.read_text(
                    encoding="utf-8"
                )
            )

        except Exception:
            metadata = {}

    return {
        "available": True,

        "source": "UK Department for Education",

        "dataset": (
            "Pupil attendance since week commencing "
            "07 September 2026 - weekly"
        ),

        "dataset_id": (
            "c0be1b5f-4240-4f99-ba80-70be8916c5ef"
        ),

        "release": "Week 37 2026 (Start of 26/27 AY)",

        "published": "2026-09-24",

        "data_period": (
            "Week commencing 07 September 2026"
        ),

        "source_type": "official_public_statistics",

        "records": len(rows),

        "metrics": _dfe_metrics(rows),

        "acquired_at": metadata.get("acquired_at"),

        "source_url": (
            "https://explore-education-statistics.service.gov.uk/"
            "data-catalogue/data-set/"
            "c0be1b5f-4240-4f99-ba80-70be8916c5ef"
        ),

        "download_url": DFE_DATA_URL,

        "license_note": (
            "UK Department for Education official statistics; "
            "see source release for usage and methodology."
        ),
    }


@router.post("/public/dfe-attendance/acquire")
def acquire_dfe_attendance(
    user=Depends(require_role("admin"))
):
    """Acquire the latest configured official DfE attendance dataset."""

    import subprocess
    import sys

    root = Path(__file__).resolve().parents[2]

    try:
        result = subprocess.run(
            [
                sys.executable,
                "scripts/download_dfe_pupil_attendance.py",
            ],
            cwd=root,
            text=True,
            capture_output=True,
            timeout=120,
        )

        if result.returncode != 0:
            raise HTTPException(
                status_code=502,
                detail=(
                    "DfE dataset download failed: "
                    + (
                        result.stderr[-800:]
                        or result.stdout[-800:]
                    )
                ),
            )

        return {
            "status": "acquired",

            "source": (
                "UK Department for Education"
            ),

            "dataset_id": (
                "c0be1b5f-4240-4f99-ba80-70be8916c5ef"
            ),

            "output": result.stdout[-1500:],
        }

    except subprocess.TimeoutExpired:
        raise HTTPException(
            status_code=504,
            detail="DfE dataset download timed out",
        )
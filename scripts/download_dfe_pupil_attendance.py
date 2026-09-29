"""Acquire a real UK Department for Education public attendance dataset.

Source:
https://explore-education-statistics.service.gov.uk/data-catalogue/data-set/c0be1b5f-4240-4f99-ba80-70be8916c5ef

The dataset is an official public-statistics release. This script stores the
source CSV locally and records the actual acquisition timestamp. It does not
generate or backdate records.
"""
from datetime import datetime, timezone
from pathlib import Path
from urllib.request import Request, urlopen
import json

URL = (
    "https://explore-education-statistics.service.gov.uk/"
    "data-catalogue/data-set/"
    "c0be1b5f-4240-4f99-ba80-70be8916c5ef/csv"
)

OUT = Path("data/real/public/dfe_attendance")
CSV_PATH = OUT / "pupil_attendance_weekly_2026_week37.csv"
META_PATH = OUT / "metadata.json"

OUT.mkdir(parents=True, exist_ok=True)

print("Downloading official UK Department for Education attendance dataset...")
request = Request(URL, headers={"User-Agent": "AI-Cloud-Assignment-Intelligence-Platform/1.0"})
with urlopen(request, timeout=60) as response:
    data = response.read()

CSV_PATH.write_bytes(data)

metadata = {
    "source": "UK Department for Education",
    "dataset": "Pupil attendance since week commencing 07 September 2026 - weekly",
    "dataset_id": "c0be1b5f-4240-4f99-ba80-70be8916c5ef",
    "release": "Week 37 2026 (Start of 26/27 AY)",
    "published": "2026-09-24",
    "data_period": "Week commencing 07 September 2026",
    "source_url": "https://explore-education-statistics.service.gov.uk/data-catalogue/data-set/c0be1b5f-4240-4f99-ba80-70be8916c5ef",
    "download_url": URL,
    "acquired_at": datetime.now(timezone.utc).isoformat(),
    "file": str(CSV_PATH),
    "bytes": len(data),
    "generated_data": False,
}

META_PATH.write_text(json.dumps(metadata, indent=2), encoding="utf-8")
print(f"Saved {CSV_PATH} ({len(data):,} bytes)")
print(f"Acquisition metadata saved to {META_PATH}")

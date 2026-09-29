"""Download the public UCI Student Performance dataset used for portfolio analytics.
Source: https://archive.ics.uci.edu/dataset/320/student+performance
License: CC BY 4.0. This script keeps network-dependent data acquisition optional.
"""
from pathlib import Path
from urllib.request import urlopen
from zipfile import ZipFile
from io import BytesIO

URL = "https://archive.ics.uci.edu/static/public/320/student%2Bperformance.zip"
OUT = Path("data/real")
OUT.mkdir(parents=True, exist_ok=True)
print("Downloading UCI Student Performance dataset...")
with urlopen(URL, timeout=30) as response:
    data = response.read()
with ZipFile(BytesIO(data)) as zf:
    zf.extractall(OUT)
print(f"Extracted dataset to {OUT.resolve()}")

#!/usr/bin/env python3
"""
rename_shippuden.py

Usage:
  # Dry run (see what would happen):
  python rename_shippuden.py --folders "/path/Season 14" "/path/Season 15"

  # Actually rename:
  python rename_shippuden.py --apply --folders "/path/Season 14" "/path/Season 15"

  # If your files are all in one place:
  python rename_shippuden.py --apply --folders "/path/to/folder"

Notes:
- Expects filenames that START with the overall episode number (e.g., 296.mp4, 321 - something.mkv).
- Seasons 14–18 cover overall episodes 296–393; the script only renames files in that range.
"""

import argparse
import pathlib
import re
import time
import html
from urllib.request import urlopen, Request
from urllib.error import URLError, HTTPError

from bs4 import BeautifulSoup  # pip install beautifulsoup4
import requests  # pip install requests

WIKI_SEASON_URLS = {
    14: "https://en.wikipedia.org/wiki/Naruto:_Shippuden_season_14",
    15: "https://en.wikipedia.org/wiki/Naruto:_Shippuden_season_15",
    16: "https://en.wikipedia.org/wiki/Naruto:_Shippuden_season_16",
    17: "https://en.wikipedia.org/wiki/Naruto:_Shippuden_season_17",
    18: "https://en.wikipedia.org/wiki/Naruto:_Shippuden_season_18",
}

SAFE_CHAR_PATTERN = re.compile(r'[^A-Za-z0-9 _\-\(\)\[\]\&\!\.\'\,]')

def fetch(url, retries=3, pause=1.0):
    last_err = None
    headers = {"User-Agent": "Mozilla/5.0 (ShippudenRenamer)"}
    for _ in range(retries):
        try:
            r = requests.get(url, headers=headers, timeout=20)
            r.raise_for_status()
            return r.text
        except Exception as e:
            last_err = e
            time.sleep(pause)
    raise last_err

def parse_titles_from_season(html_text):
    """Return list of (overall_number:int, title:str) for that season page."""
    soup = BeautifulSoup(html_text, "html.parser")
    table = soup.find("table", class_="wikitable")
    results = []
    if not table:
        return results
    # The rows contain overall number and title; handle variations in column order.
    for tr in table.find_all("tr"):
        tds = tr.find_all(["td", "th"])
        if not tds:
            continue
        # Heuristic: first numeric cell with >=296 should be overall number.
        nums = [td.get_text(strip=True) for td in tds]
        # Find an integer token in row
        overall = None
        for token in nums:
            if token.isdigit():
                n = int(token)
                if 1 <= n <= 500:
                    overall = n
                    break
        if overall is None:
            continue
        # Title often in a quoted <i> or plain text cell; look for quotes or next <td> with text.
        title_cell = None
        # Prefer the cell containing a quoted English title
        for td in tds:
            txt = td.get_text(" ", strip=True)
            if not txt:
                continue
            if '"' in txt:
                # Extract between first pair of quotes
                m = re.search(r'"([^"]+)"', txt)
                if m:
                    title_cell = m.group(1)
                    break
        if not title_cell:
            # Fallback: look for italic or link in the row
            i_tag = tr.find("i")
            if i_tag and i_tag.get_text(strip=True):
                title_cell = i_tag.get_text(strip=True)
        if not title_cell:
            # Last fallback: pick the longest text-ish cell
            candidate = max((td.get_text(" ", strip=True) for td in tds), key=len, default="")
            # Strip quotes if present
            m = re.search(r'"([^"]+)"', candidate)
            title_cell = m.group(1) if m else candidate
        if title_cell:
            results.append((overall, title_cell))
    # Keep only entries in plausible range and unique by overall number
    dedup = {}
    for n, t in results:
        if 296 <= n <= 393:  # our target window
            dedup[n] = t
    return sorted(dedup.items(), key=lambda x: x[0])

def build_mapping():
    mapping = {}
    for season, url in WIKI_SEASON_URLS.items():
        html_text = fetch(url)
        entries = parse_titles_from_season(html_text)
        for n, title in entries:
            mapping[n] = title
    return mapping

def sanitize_title(t):
    t = t.replace(":", " -")  # file-system friendly
    t = t.replace("/", "-")
    t = SAFE_CHAR_PATTERN.sub("", t)
    t = re.sub(r"\s+", " ", t).strip()
    return t

def match_overall_number(filename):
    # Get leading integer (e.g., '296.mp4', '296 - something.mkv')
    m = re.match(r"^\s*(\d{1,3})\b", filename)
    if m:
        return int(m.group(1))
    return None

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--folders", nargs="+", required=True, help="One or more folders to scan")
    ap.add_argument("--apply", action="store_true", help="Perform renames (omit for dry-run)")
    args = ap.parse_args()

    print("Building episode-title mapping from Wikipedia (Seasons 14–18)…")
    mapping = build_mapping()
    if not mapping:
        raise SystemExit("Could not build mapping.")

    print(f"Loaded {len(mapping)} episode titles (296–393).")

    changes = []
    for folder in args.folders:
        p = pathlib.Path(folder)
        if not p.is_dir():
            print(f"Skip (not a folder): {p}")
            continue
        for f in p.iterdir():
            if not f.is_file():
                continue
            overall = match_overall_number(f.name)
            if overall is None or overall not in mapping:
                continue
            title = sanitize_title(mapping[overall])
            stem, ext = f.stem, f.suffix
            # If already has _Title, skip
            if re.search(rf"^{overall}\s*_", f.stem):
                continue
            new_name = f"{overall}_{title}{ext}"
            if f.name == new_name:
                continue
            changes.append((f, f.with_name(new_name)))

    if not changes:
        print("No files to rename (nothing matched 296–393 or already renamed).")
        return

    print("\nPlanned changes:")
    for src, dst in changes:
        print(f"  {src.name}  ->  {dst.name}")

    if args.apply:
        print("\nRenaming…")
        for src, dst in changes:
            src.rename(dst)
        print("Done.")
    else:
        print("\nDry-run only. Re-run with --apply to perform the renames.")

if __name__ == "__main__":
    main()

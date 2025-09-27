#!/usr/bin/env python3
"""
Standardize Vault JSON files:

- Renames keys (value-preserving, overwrite target if present):
    description -> overview
    total episodes -> totalNumberOfEpisodes
    ranking -> adminRating
- Ensures default properties exist (without overwriting existing values):
    title: "", year: None, overview: "", genres: [], tags: [], adminRating: None
- Removes properties not in the allowed set
- --dry-run writes intended changes to dry_run_report.txt (in script dir)
- --backup writes a .bak before modifying each changed file
"""

import argparse
import json
from pathlib import Path
from typing import Any, Dict, List, Tuple, Union

JsonVal = Union[Dict[str, Any], List[Any]]

# ---- Policy: schema ----

DEFAULTS: Dict[str, Any] = {
    "title": "",
    "year": None,
    "overview": "",
    "genres": [],
    "tags": [],
    "adminRating": None,
}

ALLOWED_KEYS = set(DEFAULTS.keys()) | {
    # Core
    "kind",

    # Paths
    "posterPath",
    "videoFilePath",
    "sampleFilePath",

    # Tech/meta
    "quality",
    "runtimeSeconds",
    "audios",
    "subs",
    "videoCodec",

    # User
    "userRating",

    # Hierarchy/flags
    "isSeries",
    "dirPath",
    "isFranchise",
    "franchiseNumber",

    # Episode/season fields
    "seasonNumber",
    "episodeNumber",
    "episodeOverallNumber",
    "numberOfEpisodesObtained",
    "totalNumberOfEpisodes",
    "noSeasons"
}

# Value-preserving key rename map: old_key -> new_key
RENAME_MAP: Dict[str, str] = {
    "description": "overview",
    "total episodes": "totalNumberOfEpisodes",
    "ranking": "adminRating",
}

def coerce_defaults_on_missing(obj: Dict[str, Any]) -> List[str]:
    """Add missing default keys without overwriting existing values. Returns list of keys added."""
    added = []
    for k, v in DEFAULTS.items():
        if k not in obj:
            obj[k] = v
            added.append(k)
    return added

def rename_keys(obj: Dict[str, Any], mapping: Dict[str, str]) -> List[Tuple[str, str]]:
    """
    Rename keys per mapping. Always move value from old->new (overwrite target if present).
    Returns list of (old_key, new_key) actually renamed.
    """
    performed: List[Tuple[str, str]] = []
    for old_key, new_key in mapping.items():
        if old_key in obj:
            obj[new_key] = obj[old_key]  # overwrite target to enforce canonical key
            del obj[old_key]
            performed.append((old_key, new_key))
    return performed

def remove_disallowed_keys(obj: Dict[str, Any]) -> List[str]:
    """Remove any keys not in ALLOWED_KEYS. Returns list of removed keys."""
    to_remove = [k for k in list(obj.keys()) if k not in ALLOWED_KEYS]
    for k in to_remove:
        obj.pop(k, None)
    return to_remove

def process_object(obj: Dict[str, Any]) -> Dict[str, Any]:
    """
    Apply normalization to a single object.
    Returns a change summary dict for reporting.
    """
    changes = {
        "renamed": [],          # list of "a -> b"
        "added_defaults": [],   # list of keys added
        "removed_keys": [],     # list of keys removed (excluding renamed logging)
        "changed": False,
    }

    # 1) Key renames (value-preserving)
    renames = rename_keys(obj, RENAME_MAP)
    if renames:
        changes["renamed"] = [f"{a} -> {b}" for a, b in renames]
        changes["changed"] = True

    # 2) Add missing defaults (no overwrite)
    added = coerce_defaults_on_missing(obj)
    if added:
        changes["added_defaults"] = added
        changes["changed"] = True

    # 3) Strip disallowed keys
    removed = remove_disallowed_keys(obj)
    if removed:
        # Note: we don't separately log the removal of old keys from renames;
        # rename logging already captures that intent.
        changes["removed_keys"] = removed
        changes["changed"] = True

    return changes

def process_json_value(val: JsonVal) -> Tuple[JsonVal, List[Dict[str, Any]], int]:
    """
    Normalize a JSON value that is either an object or a list of objects.
    Returns (possibly modified value, list of change summaries, count_objects).
    """
    reports: List[Dict[str, Any]] = []
    count = 0

    if isinstance(val, dict):
        rep = process_object(val)
        reports.append(rep)
        count += 1
        return val, reports, count

    if isinstance(val, list):
        for i, item in enumerate(val):
            if isinstance(item, dict):
                rep = process_object(item)
                reports.append({"index": i, **rep})
                count += 1
        return val, reports, count

    return val, reports, count

def build_change_report(path: Path, reports: List[Dict[str, Any]]) -> str:
    any_change = any(r.get("changed") for r in reports)
    if not any_change:
        return ""

    lines = [f"Changes for: {path}"]
    for r in reports:
        prefix = f"  [obj {r['index']}]" if "index" in r else "  [obj]"

        renamed = r.get("renamed") or []
        for entry in renamed:
            lines.append(f"{prefix} renamed: {entry}")

        added = r.get("added_defaults") or []
        if added:
            lines.append(f"{prefix} added defaults: {', '.join(added)}")

        removed = r.get("removed_keys") or []
        if removed:
            lines.append(f"{prefix} removed disallowed keys: {', '.join(removed)}")
    lines.append("")  # spacer
    return "\n".join(lines)

def main():
    ap = argparse.ArgumentParser(description="Standardize Vault JSON files.")
    ap.add_argument("--root", type=str, default="Content", help="Root folder to scan (default: ./Content)")
    ap.add_argument("--dry-run", action="store_true", help="Write intended changes into dry_run_report.txt")
    ap.add_argument("--backup", action="store_true", help="Write a .bak before modifying each file")
    ap.add_argument("--indent", type=int, default=2, help="Indentation for saved JSON (default: 2)")
    args = ap.parse_args()

    root = Path(args.root)
    if not root.exists():
        print(f"[!] Root does not exist: {root}")
        return

    script_dir = Path(__file__).parent
    dry_run_file = script_dir / "dry_run_report.txt"
    dry_run_lines: List[str] = []

    scanned = 0
    modified = 0
    processed_objs = 0
    errors: List[str] = []

    for path in root.rglob("*.json"):
        scanned += 1
        try:
            raw = path.read_text(encoding="utf-8")
            data: JsonVal = json.loads(raw)
        except Exception as e:
            errors.append(f"{path}: failed to read/parse JSON ({e})")
            continue

        data_after, reports, count = process_json_value(data)
        processed_objs += count
        any_change = any(r.get("changed") for r in reports)

        if args.dry_run:
            report_text = build_change_report(path, reports)
            if report_text:
                dry_run_lines.append(report_text)

        if any_change and not args.dry_run:
            try:
                if args.backup:
                    bak = path.with_suffix(path.suffix + ".bak")
                    if not bak.exists():
                        bak.write_text(raw, encoding="utf-8")
                path.write_text(
                    json.dumps(data_after, ensure_ascii=False, indent=args.indent) + "\n",
                    encoding="utf-8",
                )
                modified += 1
            except Exception as e:
                errors.append(f"{path}: failed to write JSON ({e})")

    if args.dry_run:
        if dry_run_lines:
            dry_run_file.write_text("\n".join(dry_run_lines), encoding="utf-8")
            print(f"[i] Dry-run complete. Report saved to: {dry_run_file}")
        else:
            print("[i] Dry-run complete. No changes needed.")

    # Summary
    print("--- Summary ---")
    print(f"JSON files scanned: {scanned}")
    print(f"Objects processed:  {processed_objs}")
    if args.dry_run:
        print(f"Files with changes: {'see dry_run_report.txt'}")
    else:
        print(f"Files modified:     {modified}")
    if errors:
        print("\nErrors:")
        for e in errors:
            print(f"  - {e}")

if __name__ == "__main__":
    main()

"""Pull every page of US lobbying-disclosure (LDA) filings for the clients in our story.

The earlier agent pulls stopped at page 1 (25 rows). This walks the `next` links to the end.
Raw pages are saved to pulls/lda/<UTC time>_<param>_<query>_p<n>.json (project rule: keep every raw answer).
The API has no key; we wait between calls and back off on HTTP 429.

    .venv\\Scripts\\python.exe build\\kg\\fetch_lda.py            # all queries, skip ones already complete
    .venv\\Scripts\\python.exe build\\kg\\fetch_lda.py --force    # re-pull
"""
from __future__ import annotations

import datetime as dt
import json
import os
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
OUT = os.path.join(ROOT, "pulls", "lda")
BASE = "https://lda.gov/api/v1/filings/"
DELAY = 1.2

# (parameter, value). client_name is a substring match on the client's name.
QUERIES = [
    ("client_name", "Sberbank"), ("client_name", "VTB Bank"), ("client_name", "Gazprombank"),
    ("client_name", "Gazpromexport"), ("client_name", "Nord Stream 2"), ("client_name", "New European Pipeline"),
    ("client_name", "Norilsk"), ("client_name", "Norimet"), ("client_name", "Union of Oil and Gas Producers"),
    ("client_name", "Arctic LNG"), ("client_name", "Hikvision"), ("client_name", "Yamal LNG"), ("client_name", "Novatek"),
    ("client_name", "Deripaska"),  # "En+ Group" dropped: the API ignores "+" and returns 3,108 "... Group" filings
    ("client_name", "Huawei"), ("client_name", "Futurewei"), ("client_name", "ZTE"), ("client_name", "Hytera"),
    ("client_name", "Semiconductor Manufacturing International"), ("client_name", "DJI Technology"),
    ("client_name", "Ninestar"), ("client_name", "Semiconductor Industry Association"),
    ("client_name", "Semiconductors Industry Association"), ("client_name", "US-China Business Council"),
    ("client_name", "NVIDIA"),
    # Parents that appear as the foreign entity behind a US client
    ("foreign_entity_name", "Gazprom"), ("foreign_entity_name", "Sberbank"), ("foreign_entity_name", "Novatek"),
    ("foreign_entity_name", "Deripaska"), ("foreign_entity_name", "Huawei"), ("foreign_entity_name", "Hikvision"),
    ("foreign_entity_name", "Sovcomflot"), ("foreign_entity_name", "Rosneft"), ("foreign_entity_name", "Lukoil"),
]


def get(url: str) -> dict:
    for attempt in range(6):
        req = urllib.request.Request(url, headers={"User-Agent": "trace-the-unseen-hackathon/1.0 (research)",
                                                   "Accept": "application/json"})
        try:
            with urllib.request.urlopen(req, timeout=60) as r:
                return json.load(r)
        except urllib.error.HTTPError as e:
            if e.code == 429:
                wait = int(e.headers.get("Retry-After") or 20 * (attempt + 1))
                print("   429, waiting", wait, "s", flush=True)
                time.sleep(wait)
                continue
            if e.code >= 500:
                time.sleep(5 * (attempt + 1))
                continue
            raise
        except urllib.error.URLError:
            time.sleep(5 * (attempt + 1))
    raise RuntimeError("giving up on " + url)


def slug(s: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")


def main() -> None:
    force = "--force" in sys.argv
    os.makedirs(OUT, exist_ok=True)
    done = set()
    if not force:
        for f in os.listdir(OUT):
            m = re.match(r"\d{8}T\d{6}Z_(.+)_p(\d+)_last\.json$", f)
            if m:
                done.add(m.group(1))
    total = 0
    for param, value in QUERIES:
        key = "%s_%s" % (param, slug(value))
        if key in done:
            print("skip (complete):", key)
            continue
        url = BASE + "?" + urllib.parse.urlencode({param: value, "page_size": 25})
        page = 1
        while url:
            data = get(url)
            nxt = data.get("next")
            ts = dt.datetime.now(dt.timezone.utc).strftime("%Y%m%dT%H%M%SZ")
            name = "%s_%s_p%d%s.json" % (ts, key, page, "" if nxt else "_last")
            json.dump({"called_at_utc": ts, "url": url, "response": data},
                      open(os.path.join(OUT, name), "w", encoding="utf-8"), ensure_ascii=False)
            n = len(data.get("results") or [])
            total += n
            print("%-55s page %2d  %3d rows  (count %s)" % (key, page, n, data.get("count")), flush=True)
            url, page = nxt, page + 1
            time.sleep(DELAY)
    print("rows fetched this run:", total)


if __name__ == "__main__":
    main()

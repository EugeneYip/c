#!/usr/bin/env python3
"""Conservative monitoring of public bank rules. Detects possible changes, never rewrites rates."""
import datetime
import difflib
import hashlib
import html
import json
import pathlib
import re
import sys
import urllib.request
from html.parser import HTMLParser

ROOT = pathlib.Path(__file__).resolve().parents[1]
BENEFITS = ROOT / "data" / "benefits.json"
STATUS = ROOT / "data" / "check-status.json"
BASELINES = ROOT / "data" / "check-baselines.json"
MAX_BYTES = 6_000_000
NEEDLE = re.compile(r"(回饋|2026|2027|機場|消費|哩|點數|LINE\s*Pay|NT\$?|%|優惠|保費|年費|效期|加碼)", re.I)
IGNORE = {"script", "style", "noscript", "svg", "iframe", "canvas"}
HEADERS = {"User-Agent": "Mozilla/5.0 (compatible; BankRightsAudit/1.0; +https://github.com/EugeneYip/c)",
           "Accept": "text/html,application/xhtml+xml"}
class Visible(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.skips = []
        self.parts = []
    def handle_starttag(self, tag, attrs):
        if tag in IGNORE: self.skips.append(tag)
    def handle_endtag(self, tag):
        if tag in IGNORE and tag in self.skips:
            self.skips.remove(tag)
    def handle_data(self, data):
        if not self.skips: self.parts.append(data)
def extract(raw):
    parser = Visible()
    parser.feed(raw)
    lines = []
    for value in parser.parts:
        value = " ".join(html.unescape(value).split())
        if 8 <= len(value) <= 210 and NEEDLE.search(value):
            lines.append(value[:210])
    return sorted(set(lines))
def fetch(url, anchors):
    if not url.startswith("https://"):
        raise ValueError("Only HTTPS official sources are accepted")
    request = urllib.request.Request(url, headers=HEADERS, method="GET")
    with urllib.request.urlopen(request, timeout=25) as response:
        if response.status != 200: raise RuntimeError("HTTP " + str(response.status))
        raw = response.read(MAX_BYTES + 1)
        charset = response.headers.get_content_charset() or "utf-8"
    if len(raw) > MAX_BYTES: raise RuntimeError("Source is too large")
    doc = raw.decode(charset, errors="replace")
    if len(doc) < 300: raise RuntimeError("Official page response unexpectedly short")
    if sum(a.lower() in doc.lower() for a in anchors) < min(2, len(anchors)):
        raise RuntimeError("Mandatory official rule markers were not found")
    segments = extract(doc)
    if len(segments) < 5: raise RuntimeError("Too few relevant content segments")
    return segments
def digest(parts):
    return hashlib.sha256("\n".join(parts).encode("utf-8")).hexdigest()
def read(path, fallback):
    try: return json.loads(path.read_text("utf-8"))
    except (OSError, json.JSONDecodeError): return fallback
def write(path, data):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", "utf-8")
def diff(old, new):
    added = sorted(set(new) - set(old))[:6]
    removed = sorted(set(old) - set(new))[:6]
    return {"added": added, "removed": removed}
def self_test():
    sample = "<div>LINE Pay 消費 2.8%</div><script>fake 30% 回饋</script><p>機場接送 NT$20,000</p>"
    result = extract(sample)
    assert any("2.8%" in s for s in result)
    assert not any("30%" in s for s in result)
    assert len(digest(result)) == 64
    assert diff(["A"], ["B"]) == {"added": ["B"], "removed": ["A"]}
    print("Monitor parser and stable change comparison: PASS")
def main():
    if "--self-test" in sys.argv:
        self_test()
        return
    config = read(BENEFITS, {})
    sources = config.get("sources") or []
    now = datetime.datetime.now(datetime.timezone.utc).isoformat(timespec="seconds").replace("+00:00","Z")
    previous = read(STATUS, {})
    previous_by_id = {x["id"]: x for x in previous.get("sources", []) if "id" in x}
    baselines = read(BASELINES, {})
    output = []
    for source in sources:
        sid = source["id"]
        earlier = previous_by_id.get(sid, {})
        state = {"id": sid, "name": source["name"], "url": source["url"],
                 "status": "pending", "lastSuccessAt": earlier.get("lastSuccessAt"),
                 "diff": earlier.get("diff", {"added": [], "removed": []})}
        try:
            parts = fetch(source["url"], source.get("anchors", []))
            digest_now = digest(parts)
            ref = baselines.get(sid)
            state["lastSuccessAt"] = now
            state["hash"] = digest_now
            if not ref:
                baselines[sid] = {"sha256": digest_now, "segments": parts, "createdAt": now}
                state["status"] = "baseline"
                state["diff"] = {"added": [], "removed": []}
            elif digest_now == ref.get("sha256"):
                state["status"] = "unchanged"
                state["diff"] = {"added": [], "removed": []}
            else:
                state["status"] = "changed"
                state["diff"] = diff(ref.get("segments", []), parts)
                state["firstDetectedAt"] = earlier.get("firstDetectedAt") or now
            print(sid, state["status"], len(parts), digest_now[:10])
        except Exception as exc:
            state["status"] = "error"
            state["error"] = (type(exc).__name__ + ": " + str(exc))[:180]
            state["needsManualReview"] = bool(earlier.get("status") == "changed" or earlier.get("needsManualReview"))
            print(sid, "error", state["error"])
        output.append(state)
    result = {
        "schemaVersion": 1, "checkedAt": now, "manualReviewedAt": config.get("manualReviewedAt"),
        "method": "Official website text fingerprint; detects differences, never authorizes changed rewards.",
        "sources": output,
        "summary": {"unchanged": sum(x["status"]=="unchanged" for x in output),
                    "baseline": sum(x["status"]=="baseline" for x in output),
                    "changed": sum(x["status"]=="changed" for x in output),
                    "errors": sum(x["status"]=="error" for x in output)}
    }
    write(BASELINES, baselines)
    write(STATUS, result)
    print("Monitoring cycle completed", result["summary"])
if __name__ == "__main__": main()

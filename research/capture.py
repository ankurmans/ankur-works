"""Capture a reproducible public-page inventory for the Outlever dossier.

Run with: python3 research/capture.py
Only public HTML is requested. The script does not estimate traffic or rankings.
"""

from __future__ import annotations

import csv
import hashlib
import html as html_module
import json
from collections import Counter
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urljoin, urlparse, urlunparse

import requests
from lxml import etree, html


ROOT = Path(__file__).resolve().parent
PUBLICATION = "https://www.thestateofbrand.com"
OUTLEVER = "https://www.outlever.com"
SITEMAP = f"{PUBLICATION}/sitemap.xml"
HEADERS = {"User-Agent": "AnkurWorksResearch/1.0 (public evidence audit)"}


def get(url: str) -> requests.Response:
    return requests.get(url, headers=HEADERS, timeout=25)


def norm(url: str) -> str:
    parsed = urlparse(url)
    return urlunparse((parsed.scheme, parsed.netloc, parsed.path.rstrip("/") or "/", "", "", ""))


def strings(doc: html.HtmlElement, xpath: str) -> list[str]:
    return [value.strip() for value in doc.xpath(xpath) if isinstance(value, str) and value.strip()]


def schema_objects(doc: html.HtmlElement) -> list[dict]:
    results = []
    for node in doc.xpath('//script[@type="application/ld+json"]'):
        try:
            value = json.loads(node.text or "")
        except json.JSONDecodeError:
            try:
                value = json.loads(html_module.unescape(node.text or ""))
            except json.JSONDecodeError:
                continue
        if isinstance(value, dict):
            results.append(value)
        elif isinstance(value, list):
            results.extend(item for item in value if isinstance(item, dict))
    return results


def capture(url: str, in_sitemap: bool, lastmod: str) -> dict:
    observed_at = datetime.now(timezone.utc).isoformat(timespec="seconds")
    row = {"url": url, "in_sitemap": in_sitemap, "sitemap_lastmod": lastmod, "observed_at_utc": observed_at}
    try:
        response = get(url)
        row.update(status=response.status_code, final_url=response.url, bytes=len(response.content), sha256=hashlib.sha256(response.content).hexdigest())
        if response.status_code != 200 or "html" not in response.headers.get("Content-Type", ""):
            return row
        doc = html.fromstring(response.content)
        schemas = schema_objects(doc)
        article_schema = next((item for item in schemas if item.get("@type") in ("Article", "NewsArticle", "BlogPosting")), {})
        article = doc.xpath("//article")
        article = article[0] if article else None
        article_text = article.text_content() if article is not None else ""
        contextual_links = [urljoin(url, href) for href in article.xpath('.//a[@href]/@href')] if article is not None else []
        all_links = [urljoin(url, href) for href in doc.xpath('//a[@href]/@href')]
        row.update(
            title=doc.xpath("string(//title)").strip(),
            h1=" | ".join(strings(doc, "//h1//text()")),
            description=" | ".join(strings(doc, '//meta[@name="description"]/@content')),
            canonical=" | ".join(strings(doc, '//link[@rel="canonical"]/@href')),
            robots=" | ".join(strings(doc, '//meta[@name="robots"]/@content')),
            published=" | ".join(strings(doc, '//meta[@property="article:published_time"]/@content')),
            modified=" | ".join(strings(doc, '//meta[@property="article:modified_time"]/@content')),
            schema_types=" | ".join(str(item.get("@type", "")) for item in schemas),
            schema_author=json.dumps(article_schema.get("author", ""), ensure_ascii=False),
            schema_publisher=json.dumps(article_schema.get("publisher", ""), ensure_ascii=False),
            schema_section=html_module.unescape(str(article_schema.get("articleSection", ""))),
            article_words=len(article_text.split()),
            contextual_internal_links=" | ".join(sorted({norm(link) for link in contextual_links if urlparse(link).netloc == urlparse(PUBLICATION).netloc})),
            contextual_outlever_links=" | ".join(sorted({norm(link) for link in contextual_links if urlparse(link).netloc == urlparse(OUTLEVER).netloc})),
            all_internal_links=" | ".join(sorted({norm(link) for link in all_links if urlparse(link).netloc == urlparse(PUBLICATION).netloc})),
            all_outlever_links=" | ".join(sorted({norm(link) for link in all_links if urlparse(link).netloc == urlparse(OUTLEVER).netloc})),
        )
    except Exception as exc:
        row["error"] = f"{type(exc).__name__}: {exc}"
    return row


def write_csv(path: Path, rows: list[dict]) -> None:
    fields = list(dict.fromkeys(key for row in rows for key in row))
    with path.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=fields)
        writer.writeheader()
        writer.writerows(rows)


def main() -> None:
    ROOT.mkdir(exist_ok=True)
    sitemap_response = get(SITEMAP)
    sitemap_response.raise_for_status()
    (ROOT / "state_of_brand_sitemap.xml").write_bytes(sitemap_response.content)
    root = etree.fromstring(sitemap_response.content)
    sitemap_rows = [
        (node.findtext("{http://www.sitemaps.org/schemas/sitemap/0.9}loc"), node.findtext("{http://www.sitemaps.org/schemas/sitemap/0.9}lastmod") or "")
        for node in root
    ]
    sitemap_urls = {norm(url): lastmod for url, lastmod in sitemap_rows if url}

    home = get(PUBLICATION + "/")
    home.raise_for_status()
    home_doc = html.fromstring(home.content)
    home_urls = {
        norm(urljoin(PUBLICATION + "/", href))
        for href in home_doc.xpath('//a[@href]/@href')
        if urlparse(urljoin(PUBLICATION + "/", href)).netloc == urlparse(PUBLICATION).netloc
    }
    urls = sorted(set(sitemap_urls) | home_urls | {norm(PUBLICATION)})
    rows = []
    with ThreadPoolExecutor(max_workers=4) as pool:
        futures = {pool.submit(capture, url, url in sitemap_urls, sitemap_urls.get(url, "")): url for url in urls}
        for future in as_completed(futures):
            rows.append(future.result())
    rows.sort(key=lambda row: row["url"])
    write_csv(ROOT / "state_of_brand_inventory.csv", rows)

    other = []
    for url in [OUTLEVER + "/", OUTLEVER + "/robots.txt", OUTLEVER + "/sitemap.xml", PUBLICATION + "/robots.txt"]:
        response = get(url)
        other.append({"url": url, "status": response.status_code, "final_url": response.url, "bytes": len(response.content), "sha256": hashlib.sha256(response.content).hexdigest(), "body": response.text if url.endswith("robots.txt") else ""})
    write_csv(ROOT / "endpoint_checks.csv", other)
    outlever = capture(OUTLEVER + "/", False, "")
    write_csv(ROOT / "outlever_inventory.csv", [outlever])
    summary = {
        "captured_at_utc": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "sitemap_url_count": len(sitemap_urls),
        "homepage_internal_url_count": len(home_urls),
        "union_url_count": len(urls),
        "status_counts": dict(Counter(str(row.get("status", "error")) for row in rows)),
        "unsitemapped_homepage_urls": sorted(home_urls - set(sitemap_urls)),
    }
    (ROOT / "capture_summary.json").write_text(json.dumps(summary, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(summary, indent=2))


if __name__ == "__main__":
    main()

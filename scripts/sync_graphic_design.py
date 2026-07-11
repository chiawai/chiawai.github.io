#!/usr/bin/env python3
"""Build the public Graphic Design library from the local Content Inbox."""

from __future__ import annotations

import argparse
import json
import re
import shutil
from pathlib import Path

from PIL import Image, ImageOps


GROUPS = [
    {
        "id": "campaign-digital-marketing",
        "number": "01",
        "title": "Campaign & Digital Marketing",
        "description": "Promotional, awareness, event and conversion-focused creative work.",
        "collections": [
            "campaign-design",
            "facebook-ads-content",
            "social-media-post",
            "flyer-design",
            "voucher-design",
            "packet-design",
        ],
    },
    {
        "id": "ecommerce-product-communication",
        "number": "02",
        "title": "E-Commerce & Product Communication",
        "description": "Marketplace-ready visuals and structured product communication across the customer journey.",
        "collections": [
            "sku-design",
            "product-brochure",
            "packaging-design",
            "product-label-design",
            "price-list-design",
            "after-sale-use-artwork",
        ],
    },
    {
        "id": "brand-identity-merchandise",
        "number": "03",
        "title": "Brand Identity & Merchandise",
        "description": "Identity systems and branded touchpoints designed for recognition and consistency.",
        "collections": [
            "character-design",
            "logo-design",
            "merchandising-design",
            "t-shirt-design",
            "name-card-design",
            "letterhead-design",
        ],
    },
    {
        "id": "corporate-internal-communication",
        "number": "04",
        "title": "Corporate & Internal Communication",
        "description": "Clear internal information that supports staff, operations, training and reference workflows.",
        "collections": ["after-sale-use-artwork"],
        "scopeAreas": [
            "Internal Communication & Information Design",
            "Corporate Notice Design",
            "Operational Materials Design",
            "Staff Training & Reference Materials",
        ],
    },
]


def slugify(value: str) -> str:
    value = re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")
    return value or "image"


def convert_image(source: Path, target: Path) -> None:
    target.parent.mkdir(parents=True, exist_ok=True)
    with Image.open(source) as opened:
        image = ImageOps.exif_transpose(opened)
        image.thumbnail((1800, 1800), Image.Resampling.LANCZOS)
        if image.mode not in ("RGB", "RGBA"):
            image = image.convert("RGBA" if "transparency" in image.info else "RGB")
        image.save(target, "WEBP", quality=82, method=6)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--inbox",
        type=Path,
        default=Path(__file__).resolve().parents[2] / "portfolio-content-inbox",
    )
    parser.add_argument("--site", type=Path, default=Path(__file__).resolve().parents[1])
    args = parser.parse_args()

    inbox = args.inbox.resolve()
    site = args.site.resolve()
    content = json.loads((inbox / "data/content.json").read_text(encoding="utf-8"))
    graphic_category = next(item for item in content["categories"] if item["id"] == "graphic-design")
    collection_labels = {item["id"]: item["label"] for item in graphic_category["collections"]}
    projects = [item for item in content.get("projects", []) if item.get("category") == "graphic-design"]

    output_dir = site / "assets/graphic-library"
    if output_dir.exists():
        shutil.rmtree(output_dir)
    output_dir.mkdir(parents=True)

    public_projects = []
    for project in projects:
        project_slug = slugify(project.get("slug") or project["title"])
        images = []
        for index, asset in enumerate(project.get("assets", []), start=1):
            source = inbox / asset["path"]
            filename = f"{index:02d}-{slugify(Path(asset.get('originalFilename') or asset['filename']).stem)}.webp"
            target = output_dir / project_slug / filename
            convert_image(source, target)
            images.append(
                {
                    "src": str(target.relative_to(site)),
                    "alt": asset.get("title") or asset.get("originalFilename") or project["title"],
                    "title": asset.get("title", ""),
                    "description": asset.get("description", ""),
                }
            )

        public_projects.append(
            {
                "id": project["id"],
                "slug": project_slug,
                "title": project["title"],
                "summary": project.get("summary", ""),
                "collection": project["collection"],
                "collectionLabel": collection_labels.get(project["collection"], project["collection"]),
                "featured": bool(project.get("featured")),
                "thumbnail": images[0]["src"] if images else "",
                "images": images,
            }
        )

    project_lookup = {project["id"]: project for project in public_projects}
    groups = []
    for group in GROUPS:
        project_ids = [
            project["id"]
            for project in public_projects
            if project["collection"] in group["collections"]
        ]
        groups.append(
            {
                **group,
                "collectionLabels": [
                    collection_labels.get(collection, collection) for collection in group["collections"]
                ],
                "projectIds": project_ids,
                "projectCount": len(project_ids),
                "imageCount": sum(len(project_lookup[project_id]["images"]) for project_id in project_ids),
            }
        )

    payload = {
        "generatedFrom": str(inbox / "data/content.json"),
        "groups": groups,
        "projects": public_projects,
    }
    (site / "assets/graphic-design-library.json").write_text(
        json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    print(f"Synced {len(public_projects)} projects and {sum(len(p['images']) for p in public_projects)} images.")


if __name__ == "__main__":
    main()

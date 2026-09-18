#!/usr/bin/env python3
"""Generate the application icons from the shared design tokens.

The mark is drawn, not typeset: a font would make the output depend on what is
installed on the machine, and these PNGs are committed. Running this script on
any machine with Pillow must produce the same bytes.

    python3 scripts/build-app-assets.py
"""

from __future__ import annotations

import json
import math
import pathlib
import re

from PIL import Image, ImageDraw

ROOT = pathlib.Path(__file__).resolve().parents[1]
TOKENS = ROOT.parent.parent / "packages" / "design-tokens" / "src" / "colors.ts"
ASSETS = ROOT / "assets"

TRANSPARENT = (0, 0, 0, 0)
SUPERSAMPLE = 4


def token(path: str) -> tuple[int, int, int, int]:
    """Read one colour from the design tokens, so the icons cannot drift."""
    group, shade = path.split(".")
    source = TOKENS.read_text()
    block = re.search(rf"{group}:\s*{{(.*?)}}", source, re.S)
    if block is None:
        raise SystemExit(f"colour group {group} not found in {TOKENS}")
    match = re.search(rf"{shade}:\s*'(#[0-9a-fA-F]{{6}})'", block.group(1))
    if match is None:
        raise SystemExit(f"colour {path} not found in {TOKENS}")
    value = match.group(1).lstrip("#")
    return (int(value[0:2], 16), int(value[2:4], 16), int(value[4:6], 16), 255)


BRAND = token("brand.600")
ACCENT = token("accent.500")
WHITE = token("neutral.0")


def arrow(draw: ImageDraw.ImageDraw, size: int, colour, start: float, end: float) -> None:
    """One half of the exchange loop: an arc closed by a triangular head.

    Angles follow Pillow's convention: degrees, clockwise, zero pointing right.
    """
    margin = size * 0.26
    box = (margin, margin, size - margin, size - margin)
    stroke = size * 0.09
    draw.arc(box, start=start, end=end, fill=colour, width=int(stroke))

    centre = size / 2
    radius = (size - 2 * margin) / 2
    half = stroke * 1.55
    tip_angle = math.radians(end + 9)
    base_angle = math.radians(end)

    def point(angle: float, distance: float) -> tuple[float, float]:
        return (centre + distance * math.cos(angle), centre + distance * math.sin(angle))

    draw.polygon(
        [
            point(tip_angle, radius),
            point(base_angle, radius - half),
            point(base_angle, radius + half),
        ],
        fill=colour,
    )


def mark(size: int, background, primary=WHITE) -> Image.Image:
    """Two arrows chasing each other: an exchange between two neighbours."""
    canvas = size * SUPERSAMPLE
    image = Image.new("RGBA", (canvas, canvas), TRANSPARENT)
    draw = ImageDraw.Draw(image)

    if background is not None:
        corner = canvas * 0.22
        draw.rounded_rectangle((0, 0, canvas - 1, canvas - 1), radius=corner, fill=background)

    # Two arcs with a gap at each end, so neither head sits on the other arc.
    arrow(draw, canvas, primary, start=200, end=340)
    arrow(draw, canvas, ACCENT, start=20, end=160)

    return image.resize((size, size), Image.LANCZOS)


def save(image: Image.Image, name: str, *, flatten) -> None:
    ASSETS.mkdir(exist_ok=True)
    if flatten is not None:
        background = Image.new("RGBA", image.size, flatten)
        image = Image.alpha_composite(background, image).convert("RGB")
    image.save(ASSETS / name, "PNG", optimize=True)
    print(f"assets/{name} {image.size[0]}x{image.size[1]} {image.mode}")


def main() -> None:
    # iOS rejects an icon with an alpha channel, hence the flatten.
    save(mark(1024, BRAND), "icon.png", flatten=BRAND)
    # Android masks the adaptive foreground: the mark stays inside the safe area.
    foreground = Image.new("RGBA", (1024, 1024), TRANSPARENT)
    inner = mark(int(1024 * 0.66), None)
    foreground.paste(inner, ((1024 - inner.width) // 2, (1024 - inner.height) // 2), inner)
    save(foreground, "adaptive-icon.png", flatten=None)
    # The splash sits on white, so the first arrow takes the brand colour
    # instead of white, which would be invisible there.
    save(mark(512, None, primary=BRAND), "splash-icon.png", flatten=None)


if __name__ == "__main__":
    main()

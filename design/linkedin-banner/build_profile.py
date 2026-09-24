"""Render the separate 1584x396 LinkedIn personal-profile banner."""

from pathlib import Path
from tempfile import TemporaryDirectory

from PIL import Image, ImageDraw

from build import HERE, INK, MARIGOLD, MUTED, PAPER, ROOT, font, load_mark


WIDTH, HEIGHT = 1584, 396
QR_PANEL_X = 1274


def main() -> None:
    canvas = Image.new("RGB", (WIDTH, HEIGHT), INK)
    draw = ImageDraw.Draw(canvas)
    draw.rectangle((0, 0, WIDTH, 7), fill=MARIGOLD)

    # The profile photo overlaps the lower-left; keep content to its right.
    content_center = (340 + QR_PANEL_X) / 2
    headline = "I build what I wish existed"
    headline_font = font(68, "Bold")
    draw.text(
        (content_center - draw.textlength(headline, font=headline_font) / 2, 95),
        headline,
        font=headline_font,
        fill=PAPER,
    )
    descriptor = "SOFTWARE  /  BRANDS  /  EXPERIMENTS"
    descriptor_font = font(22, "Medium")
    draw.text(
        (content_center - draw.textlength(descriptor, font=descriptor_font) / 2, 181),
        descriptor,
        font=descriptor_font,
        fill=MUTED,
    )
    draw.line((420, 247, 1208, 247), fill="#4a4842", width=1)

    products = [
        ("Pepys", ROOT / "public/brands/pepys.svg"),
        ("Whooshly", ROOT / "public/brands/whooshly.svg"),
        ("QuoteSweep", ROOT / "public/brands/quotesweep.png"),
        ("Twinsona", ROOT / "public/brands/twinsona.svg"),
        ("Linnet", ROOT / "public/brands/linnet-delighted.png"),
    ]
    with TemporaryDirectory() as temporary:
        temp = Path(temporary)
        for index, (name, path) in enumerate(products):
            x = 420 + index * 170
            y = 292
            if name == "Whooshly":
                clear_svg = temp / "whooshly-clear.svg"
                clear_svg.write_text(
                    path.read_text().replace(
                        '<rect width="512" height="512" fill="#17151D"/>', ""
                    )
                )
                draw.rounded_rectangle((x, y, x + 40, y + 40), radius=9, fill=PAPER)
                icon = load_mark(clear_svg, 34, temp)
                canvas.paste(icon, (x + 3, y + 3), icon)
            elif name == "QuoteSweep":
                icon = load_mark(path, 40, temp)
                rounded = Image.new("L", (40, 40), 0)
                ImageDraw.Draw(rounded).rounded_rectangle((0, 0, 39, 39), radius=9, fill=255)
                canvas.paste(icon, (x, y), rounded)
            else:
                icon = load_mark(path, 40, temp)
                if name == "Twinsona":
                    draw.rounded_rectangle((x, y, x + 40, y + 40), radius=9, fill=PAPER)
                canvas.paste(icon, (x, y), icon)
            draw.text((x + 47, y + 10), name, font=font(18, "SemiBold"), fill=PAPER)

    draw.rectangle((QR_PANEL_X, 7, WIDTH, HEIGHT), fill=MARIGOLD)
    qr_center = (QR_PANEL_X + WIDTH) / 2
    top_label = "BUILT + BUILDING"
    top_font = font(16, "Bold")
    draw.text(
        (qr_center - draw.textlength(top_label, font=top_font) / 2, 29),
        top_label,
        font=top_font,
        fill=INK,
    )
    qr = Image.open(HERE / "source-qr.png").convert("RGB")
    qr = qr.resize((230, 230), Image.Resampling.NEAREST)
    canvas.paste(qr, (1314, 76))
    scan_label = "SCAN  /  ANKUR.WORKS"
    scan_font = font(15, "Bold")
    draw.text(
        (qr_center - draw.textlength(scan_label, font=scan_font) / 2, 319),
        scan_label,
        font=scan_font,
        fill=INK,
    )

    output = HERE / "ankur-works-linkedin-profile-cover.png"
    canvas.save(output, optimize=True)
    print(output)


if __name__ == "__main__":
    main()

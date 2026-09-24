"""Render the Ankur Works LinkedIn Page cover from the site's brand assets."""

from pathlib import Path
from tempfile import TemporaryDirectory
import subprocess

from PIL import Image, ImageDraw, ImageFont, ImageOps


ROOT = Path(__file__).resolve().parents[2]
HERE = Path(__file__).resolve().parent
WIDTH, HEIGHT = 4200, 700
INK = "#171715"
PAPER = "#fffaf2"
MARIGOLD = "#ffbd46"
MUTED = "#bab6ab"
FONT_PATH = "/Users/ankurhappeo/Library/Fonts/HostGrotesk-VariableFont_wght.ttf"


def font(size: int, weight: str = "Regular") -> ImageFont.FreeTypeFont:
    face = ImageFont.truetype(FONT_PATH, size)
    face.set_variation_by_name(weight)
    return face


def load_mark(path: Path, size: int, temp: Path) -> Image.Image:
    if path.suffix == ".svg":
        converted = temp / f"{path.stem}.png"
        subprocess.run(
            ["sips", "-s", "format", "png", str(path), "--out", str(converted)],
            check=True,
            stdout=subprocess.DEVNULL,
        )
        path = converted
    image = Image.open(path).convert("RGBA")
    return ImageOps.contain(image, (size, size), Image.Resampling.LANCZOS)


def main() -> None:
    canvas = Image.new("RGB", (WIDTH, HEIGHT), INK)
    draw = ImageDraw.Draw(canvas)

    # LinkedIn places the Page avatar over the lower-left of this wide cover.
    # Keep all essential content in the center and right of the dark field.
    draw.rectangle((0, 0, WIDTH, 13), fill=MARIGOLD)
    dark_center_x = 3380 / 2
    headline = "I build what I wish existed"
    headline_font = font(137, "Bold")
    draw.text(
        (dark_center_x - draw.textlength(headline, font=headline_font) / 2, 211),
        headline,
        font=headline_font,
        fill=PAPER,
    )
    descriptor = "SOFTWARE  /  BRANDS  /  EXPERIMENTS"
    descriptor_font = font(38, "Medium")
    draw.text(
        (dark_center_x - draw.textlength(descriptor, font=descriptor_font) / 2, 371),
        descriptor,
        font=descriptor_font,
        fill=MUTED,
    )

    draw.line((900, 465, 3200, 465), fill="#4a4842", width=2)

    products = [
        ("Pepys", ROOT / "public/brands/pepys.svg"),
        ("Whooshly", ROOT / "public/brands/whooshly.svg"),
        ("QuoteSweep", ROOT / "public/brands/quotesweep.png"),
        ("Linnet", ROOT / "public/brands/linnet-delighted.png"),
        ("Twinsona", ROOT / "public/brands/twinsona.svg"),
    ]
    with TemporaryDirectory() as temporary:
        temp = Path(temporary)
        for index, (name, path) in enumerate(products):
            x = 900 + index * 480
            if name == "Whooshly":
                # The site icon has a dark square; use its colored mark on a white tile.
                clear_svg = temp / "whooshly-clear.svg"
                clear_svg.write_text(
                    path.read_text().replace(
                        '<rect width="512" height="512" fill="#17151D"/>', ""
                    )
                )
                draw.rounded_rectangle((x, 538, x + 103, 641), radius=22, fill=PAPER)
                icon = load_mark(clear_svg, 87, temp)
                canvas.paste(icon, (x + 8, 546), icon)
            elif name == "QuoteSweep":
                icon = load_mark(path, 103, temp)
                rounded = Image.new("L", (103, 103), 0)
                ImageDraw.Draw(rounded).rounded_rectangle((0, 0, 102, 102), radius=22, fill=255)
                canvas.paste(icon, (x, 538), rounded)
            else:
                icon = load_mark(path, 103, temp)
                if name == "Twinsona":
                    draw.rounded_rectangle((x, 538, x + 103, 641), radius=22, fill=PAPER)
                canvas.paste(icon, (x, 538), icon)
            draw.text((x + 124, 556), name, font=font(42, "SemiBold"), fill=PAPER)

    # The supplied Whooshly QR resolves to ankur.works; leave its quiet zone intact.
    draw.rectangle((3380, 13, WIDTH, HEIGHT), fill=MARIGOLD)
    qr_center_x = (3534 + 4040) / 2
    label = "BUILT + BUILDING"
    label_font = font(34, "Bold")
    label_width = draw.textlength(label, font=label_font)
    draw.text((qr_center_x - label_width / 2, 53), label, font=label_font, fill=INK)
    qr = Image.open(HERE / "source-qr.png").convert("RGB")
    qr = qr.resize((506, 506), Image.Resampling.NEAREST)
    canvas.paste(qr, (3534, 113))
    scan_label = "SCAN  /  ANKUR.WORKS"
    scan_font = font(30, "Bold")
    scan_width = draw.textlength(scan_label, font=scan_font)
    draw.text((qr_center_x - scan_width / 2, 625), scan_label, font=scan_font, fill=INK)

    output = HERE / "ankur-works-linkedin-cover.png"
    canvas.save(output, optimize=True)
    canvas.resize((1260, 210), Image.Resampling.LANCZOS).save(
        HERE / "ankur-works-linkedin-cover-preview.png", optimize=True
    )
    print(output)


if __name__ == "__main__":
    main()

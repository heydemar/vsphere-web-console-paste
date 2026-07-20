from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter


ROOT = Path(__file__).resolve().parent.parent
OUTPUT = ROOT / "store-assets" / "small-promo-440x280.png"
WIDTH, HEIGHT = 440, 280


def vertical_gradient(size, top, bottom):
    image = Image.new("RGBA", size)
    pixels = image.load()
    for y in range(size[1]):
        ratio = y / max(size[1] - 1, 1)
        color = tuple(round(top[index] * (1 - ratio) + bottom[index] * ratio) for index in range(4))
        for x in range(size[0]):
            pixels[x, y] = color
    return image


canvas = vertical_gradient((WIDTH, HEIGHT), (5, 21, 39, 255), (11, 44, 66, 255))

glow = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
glow_draw = ImageDraw.Draw(glow)
glow_draw.ellipse((-90, -120, 270, 240), fill=(18, 198, 232, 70))
glow_draw.ellipse((265, 100, 525, 360), fill=(75, 245, 185, 40))
glow = glow.filter(ImageFilter.GaussianBlur(55))
canvas.alpha_composite(glow)

draw = ImageDraw.Draw(canvas, "RGBA")
draw.rounded_rectangle((32, 42, 408, 238), radius=20, fill=(2, 10, 23, 185), outline=(65, 110, 143, 130), width=2)
draw.line((32, 84, 408, 84), fill=(65, 110, 143, 110), width=2)
for x in (52, 72, 92):
    draw.ellipse((x - 5, 59, x + 5, 69), fill=(79, 116, 145, 210))

icon = Image.open(ROOT / "assets" / "icon-transparent.png").convert("RGBA")
icon.thumbnail((156, 156), Image.Resampling.LANCZOS)
icon_x = (WIDTH - icon.width) // 2
icon_y = 92

shadow = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
shadow_icon = Image.new("RGBA", icon.size, (0, 0, 0, 140))
shadow_icon.putalpha(icon.getchannel("A"))
shadow.alpha_composite(shadow_icon, (icon_x, icon_y + 10))
shadow = shadow.filter(ImageFilter.GaussianBlur(16))
canvas.alpha_composite(shadow)
canvas.alpha_composite(icon, (icon_x, icon_y))

OUTPUT.parent.mkdir(parents=True, exist_ok=True)
canvas.convert("RGB").save(OUTPUT, "PNG", optimize=True)
print(f"Wrote {OUTPUT.relative_to(ROOT)} ({WIDTH}x{HEIGHT})")

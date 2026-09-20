"""Bake the five sidebar masters into fixed caps and reflected repeat strips."""
from pathlib import Path
from PIL import Image


def bake_sidebar_art(root, clean):
    source = root / 'assets/gen/sidebar-osmanthus-20260920'
    output = root / 'assets'

    def master(name):
        im = Image.open(source / f'{name}.png').convert('RGBA')
        im.putalpha(im.getchannel('A').point(lambda a: 0 if a <= 16 else a))
        im = clean(im, min_area=180)
        box = im.getchannel('A').getbbox()
        if box is None:
            raise ValueError(f'Empty sidebar master: {name}')
        return im.crop(box)

    def save(im, name):
        im.save(output / f'lpp-sidebar-{name}.webp', 'WEBP', lossless=True, method=6)

    for name, key in [('workspace-ribbon', 'ribbon'), ('new-session-frame', 'new'), ('settings-frame', 'settings')]:
        im = master(name)
        im = im.resize((round(im.width * 192 / im.height), 192), Image.Resampling.LANCZOS)
        # Caps retain every flower/rolled edge; the center strip mirrors back
        # to itself so every repeat boundary has identical neighboring pixels.
        cap = min(round(im.width * .22), 240)
        save(im.crop((0, 0, cap, 192)), f'{key}-left')
        save(im.crop((im.width-cap, 0, im.width, 192)), f'{key}-right')
        strip = im.crop((im.width//2-32, 0, im.width//2+32, 192))
        tile = Image.new('RGBA', (128, 192))
        tile.paste(strip, (0, 0))
        tile.paste(strip.transpose(Image.Transpose.FLIP_LEFT_RIGHT), (64, 0))
        save(tile, f'{key}-tile')
        print(f'  sidebar {key}: cap {cap}x192, mirrored tile 128x192')

    corner = master('sidebar-corner')
    corner.thumbnail((384, 384), Image.Resampling.LANCZOS)
    for key, operation in [('tl', None), ('tr', Image.Transpose.FLIP_LEFT_RIGHT),
                           ('bl', Image.Transpose.FLIP_TOP_BOTTOM), ('br', Image.Transpose.ROTATE_180)]:
        save(corner if operation is None else corner.transpose(operation), f'corner-{key}')
    garland = master('footer-garland')
    garland.thumbnail((1200, 400), Image.Resampling.LANCZOS)
    save(garland, 'garland')
    print(f'  sidebar garland: {garland.size}')

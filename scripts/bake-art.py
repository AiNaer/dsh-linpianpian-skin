#!/usr/bin/env python3
"""Bake Lin Pianpian skin art: clean generated masters in assets/gen/ and
emit web-optimized finals into assets/.

Steps depend on the asset: legacy ornaments use speck cleanup and bbox crops;
the refined character canvases and watermark-free library backgrounds retain
their native geometry. Also renders the procedural trim tiles and favicon.

Usage: python scripts/bake-art.py
"""
from collections import deque
from pathlib import Path

from PIL import Image, ImageDraw
from sidebar_art import bake_sidebar_art

ROOT = Path(__file__).resolve().parent.parent
GEN = ROOT / 'assets' / 'gen'
OUT = ROOT / 'assets'

# 松烟鎏金（ADR-0003）：绿要正而深，金要亮
GOLD = (201, 162, 74, 255)       # 鎏金 #c9a24a
GOLD_HI = (228, 203, 144, 255)   # 金高光 #e4cb90
GOLD_DEEP = (154, 120, 48, 255)  # 金深处 #9a7830
PINE_TOP = (37, 68, 52, 255)     # 松烟高光面 #254434
PINE_LOW = (22, 40, 30, 255)     # 松烟底 #16281e


def alpha_bbox(img: Image.Image, margin: int = 2) -> Image.Image:
    bbox = img.getchannel('A').getbbox()
    if bbox is None:
        return img
    l, t, r, b = bbox
    l = max(0, l - margin)
    t = max(0, t - margin)
    r = min(img.width, r + margin)
    b = min(img.height, b + margin)
    return img.crop((l, t, r, b))


def remove_specks(img: Image.Image, min_area: int = 1200) -> Image.Image:
    """Erase small disconnected alpha islands (floating sparkle specks)
    while keeping the main subject and any large secondary parts."""
    w, h = img.size
    alpha = img.getchannel('A')
    mask = bytearray(w * h)
    src = alpha.load()
    for y in range(h):
        for x in range(w):
            if src[x, y] > 16:
                mask[y * w + x] = 1
    labels = [-1] * (w * h)
    areas = []
    for y in range(h):
        for x in range(w):
            idx = y * w + x
            if not mask[idx] or labels[idx] != -1:
                continue
            label = len(areas)
            area = 0
            queue = deque([idx])
            labels[idx] = label
            while queue:
                cur = queue.popleft()
                area += 1
                cx, cy = cur % w, cur // w
                for nx, ny in ((cx - 1, cy), (cx + 1, cy), (cx, cy - 1), (cx, cy + 1)):
                    if 0 <= nx < w and 0 <= ny < h:
                        nidx = ny * w + nx
                        if mask[nidx] and labels[nidx] == -1:
                            labels[nidx] = label
                            queue.append(nidx)
            areas.append(area)
    if not areas:
        return img
    keep = {i for i, a in enumerate(areas) if a >= min_area}
    px = img.load()
    for y in range(h):
        for x in range(w):
            idx = y * w + x
            if mask[idx] and labels[idx] not in keep:
                r, g, b, a = px[x, y]
                px[x, y] = (r, g, b, 0)
    return img


def save_webp(img: Image.Image, name: str, quality: int = 85) -> None:
    target = OUT / name
    img.save(target, 'WEBP', quality=quality, alpha_quality=100, method=6)
    print(f'  {name}: {img.size} {target.stat().st_size // 1024}KB')


def bake_backgrounds() -> None:
    for src, dst in (('linshui-library-v1/day.png', 'lpp-bg-day.webp'),
                     ('linshui-library-v1/night.png', 'lpp-bg-night.webp')):
        img = Image.open(GEN / src).convert('RGB')
        # These watermark-free masters share a native 1672 × 941 composition.
        # Keep the floor and geometry intact for the day/night crossfade.
        save_webp(img, dst, quality=90)


def bake_characters() -> None:
    masters = GEN / 'character-refinement-20260920'
    # The new skirt already covers the feet. Preserve both canvases: the
    # left hand-contact line at x=384 (37.5%) is the CSS positioning anchor.
    # Do not apply the generic 1200px speck cleanup to fine hair/jewelry.
    left = Image.open(masters / 'left-fullbody-no-shoes-cutout-v1.png').convert('RGBA')
    save_webp(left, 'lpp-char-left.webp', quality=95)
    right = Image.open(masters / 'right-refined-v2.png').convert('RGBA')
    save_webp(right, 'lpp-char-right.webp', quality=95)


def bake_mascot() -> None:
    # 用户提供的新 Q 版（持香囊与桂花糕），由用户自行抠图为透明 PNG；
    # 早期 kimi 稿 chibi-mascot.png 与 relay 稿 chibi-mascot-v2.png 留档。
    chibi = Image.open(GEN / 'chibi-mascot-v3.png').convert('RGBA')
    chibi = remove_specks(chibi)
    chibi = alpha_bbox(chibi, margin=4)
    save_webp(chibi, 'lpp-chibi.webp', quality=88)


def bake_workspace_emblem() -> None:
    emblem = Image.open(GEN / 'workspace-osmanthus-gold-v1.png').convert('RGBA')
    emblem = alpha_bbox(emblem, margin=4)
    emblem.thumbnail((88, 88), Image.Resampling.LANCZOS)
    tile = Image.new('RGBA', (96, 96))
    tile.paste(emblem, ((96 - emblem.width) // 2, (96 - emblem.height) // 2))
    save_webp(tile, 'lpp-workspace-osmanthus.webp', quality=95)


def bake_ornaments() -> None:
    # Split the user-approved frame into fixed corners and sliding rails.
    # Even the plain silk contains folds: NEVER stretch a raster middle.
    embroidery = Image.open(GEN / 'composer-frame-embroidery-v3.png').convert('RGBA')
    embroidery = remove_specks(embroidery)
    embroidery = alpha_bbox(embroidery)
    w, h = embroidery.size
    left = right = 260
    top, bottom = 200, 140
    for name, box in {
        'corner-tl': (0, 0, left, top),
        'corner-tr': (w - right, 0, w, top),
        'corner-bl': (0, h - bottom, left, h),
        'corner-br': (w - right, h - bottom, w, h),
    }.items():
        piece = embroidery.crop(box)
        # Still >3 device pixels per CSS pixel at the desktop scale; avoid
        # embedding eight full-resolution mirrored strips in the bundle.
        piece = piece.resize((piece.width // 2, piece.height // 2), Image.LANCZOS)
        save_webp(piece, f'lpp-composer-{name}.webp', quality=92)

    # Reflection makes each tile periodic without flattening or synthesizing
    # its folds. A+reverse(A) starts at the source's first edge; reverse(A)+A
    # ends at its last edge. Thus BOTH fixed corners keep their original join.
    # CSS anchors these start/end tiles to opposing corners and clips them.
    for name, box, horizontal in (
        ('top', (left, 0, w - right, top), True),
        ('bottom', (left, h - bottom, w - right, h), True),
        ('left', (0, top, left, h - bottom), False),
        ('right', (w - right, top, w, h - bottom), False),
    ):
        strip = embroidery.crop(box)
        strip = strip.resize((strip.width // 2, strip.height // 2), Image.LANCZOS)
        mirrored = strip.transpose(Image.Transpose.FLIP_LEFT_RIGHT if horizontal
                                   else Image.Transpose.FLIP_TOP_BOTTOM)
        size = (strip.width * 2, strip.height) if horizontal else (strip.width, strip.height * 2)
        offset = (strip.width, 0) if horizontal else (0, strip.height)
        for end, first, second in (('start', strip, mirrored), ('end', mirrored, strip)):
            tile = Image.new('RGBA', size)
            tile.paste(first, (0, 0))
            tile.paste(second, offset)
            # Lossless preserves exact matching pixels at the reflected joins.
            tile.save(OUT / f'lpp-composer-{name}-{end}.webp', 'WEBP', lossless=True, method=6)

    # Independent low begonia emblem; the former silk frame stays archived.
    # Crop transparent margins before scaling so 28 CSS px means the ornament,
    # not the generator's canvas. Preserve the native aspect ratio and alpha.
    emblem = Image.open(GEN / 'composer-emblem-begonia.png').convert('RGBA')
    emblem = remove_specks(emblem)
    emblem = alpha_bbox(emblem)
    emblem.thumbnail((640, 200), Image.LANCZOS)
    save_webp(emblem, 'lpp-composer-emblem.webp', quality=92)

    # 缠枝金桂角花（用户抠图）：母版为左上角，翻转烘焙出四角成套
    corner = Image.open(GEN / 'corner-osmanthus-gilt-cutout.png').convert('RGBA')
    corner = remove_specks(corner)
    corner = alpha_bbox(corner)
    corner.thumbnail((384, 384), Image.LANCZOS)
    for suffix, op in (('tl', None),
                       ('tr', Image.Transpose.FLIP_LEFT_RIGHT),
                       ('bl', Image.Transpose.FLIP_TOP_BOTTOM),
                       ('br', Image.Transpose.ROTATE_180)):
        piece = corner if op is None else corner.transpose(op)
        save_webp(piece, f'lpp-corner-{suffix}.webp', quality=88)

    # 鎏金缠枝桂白玉章（檐口中央与 crest 通用），用户抠图；
    # 旧天青冰裂瓷章 crest-emblem.png 随汝窑天青一并留档
    crest = Image.open(GEN / 'crest-jade-osmanthus-cutout.png').convert('RGBA')
    crest = remove_specks(crest)
    crest = alpha_bbox(crest)
    crest = crest.resize((512, 512), Image.LANCZOS)
    save_webp(crest, 'lpp-crest.webp', quality=88)


def bake_vessels() -> None:
    """海棠器形两件（用户抠图）：新会话白玉海棠匾 + 选中工作区鎏金腰牌。"""
    plaque = Image.open(GEN / 'plaque-begonia-jade-cutout.png').convert('RGBA')
    plaque = remove_specks(plaque)
    plaque = alpha_bbox(plaque)
    plaque = plaque.resize((640, 640), Image.LANCZOS)
    save_webp(plaque, 'lpp-plaque.webp', quality=90)

    token = Image.open(GEN / 'waist-token-gilt-cutout.png').convert('RGBA')
    token = remove_specks(token)
    token = alpha_bbox(token, margin=2)
    token.thumbnail((320, 320), Image.LANCZOS)
    save_webp(token, 'lpp-token.webp', quality=90)


def lerp(a, b, t: float):
    return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(4))


def vertical_gradient(size, stops) -> Image.Image:
    w, h = size
    img = Image.new('RGBA', (w, h))
    px = img.load()
    for y in range(h):
        t = y / max(1, h - 1)
        for (pos, col), (npos, ncol) in zip(stops, stops[1:]):
            if pos <= t <= npos:
                px_col = lerp(col, ncol, (t - pos) / max(1e-6, npos - pos))
                break
        else:
            px_col = stops[-1][1]
        for x in range(w):
            px[x, y] = px_col
    return img


def bake_trims() -> None:
    """Top (56px) and bottom (36px) trim tiles: 松烟漆带 + 鎏金双线 + 菱花金点，
    drawn as horizontally seamless tiles."""
    for name, h, diamonds in (('lpp-trim-top.webp', 56, True),
                              ('lpp-trim-bottom.webp', 36, False)):
        w = 256
        tile = vertical_gradient((w, h), [
            (0.0, PINE_TOP),
            (1.0, PINE_LOW),
        ])
        d = ImageDraw.Draw(tile)
        d.line((0, 1, w, 1), fill=GOLD_HI, width=1)
        d.line((0, 3, w, 3), fill=GOLD, width=2)
        d.line((0, h - 4, w, h - 4), fill=GOLD, width=2)
        d.line((0, h - 2, w, h - 2), fill=GOLD_HI, width=1)
        if diamonds:
            cy = (h + 6) // 2
            for cx in range(16, w, 32):
                d.polygon([(cx, cy - 4), (cx + 4, cy), (cx, cy + 4), (cx - 4, cy)],
                          fill=GOLD_HI)
        save_webp(tile, name, quality=90)


def bake_brocade() -> None:
    """宋锦菱格底纹：96px 无缝瓦片，极淡鎏金菱格，侧栏与檐口的底纹肌理。"""
    size = 96
    tile = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(tile)
    step = 24  # 整除 96，四缘无缝
    gold = (GOLD[0], GOLD[1], GOLD[2], 26)
    for i in range(-size, size * 2, step):
        d.line((i, 0, i + size, size), fill=gold, width=1)
        d.line((i + size, 0, i, size), fill=gold, width=1)
    save_webp(tile, 'lpp-brocade.webp', quality=90)


def bake_favicon() -> None:
    chibi = Image.open(GEN / 'chibi-mascot-v2.png').convert('RGBA')
    head = chibi.crop((210, 0, 790, 540)).resize((128, 128), Image.LANCZOS)
    target = OUT / 'lpp-favicon.png'
    head.save(target, 'PNG')
    print(f'  lpp-favicon.png: {head.size} {target.stat().st_size // 1024}KB')


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    print('backgrounds:')
    bake_backgrounds()
    print('characters:')
    bake_characters()
    print('workspace emblem:')
    bake_workspace_emblem()
    print('mascot:')
    bake_mascot()
    print('ornaments:')
    bake_ornaments()
    print('vessels:')
    bake_vessels()
    print('trims:')
    bake_trims()
    print('brocade:')
    bake_brocade()
    print('favicon:')
    bake_favicon()
    print('sidebar ornaments:')
    bake_sidebar_art(ROOT, remove_specks)


if __name__ == '__main__':
    main()

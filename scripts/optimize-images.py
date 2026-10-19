"""Optimize shipped images and local references. Requires Pillow and numpy.

Run: python3 scripts/optimize-images.py
Hash checks prevent repeated lossy encoding of already optimized images.
"""
import hashlib
import io
import json
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
PUBLIC = ROOT / 'public'
REPORT = ROOT / 'verification/image-optimization.json'
IMAGE_TYPES = {'.png', '.jpg', '.jpeg', '.webp'}
COMPATIBILITY_ICONS = {
    '8c78d97eb6f6-icon1.png', 'b9c4fc62bc05-icon2.png',
    '3d0a6ab4e400-apple-icon.png',
}
POLICY = 'Keep dimensions and alpha; block RGB SSIM >= 0.98 on light/dark backgrounds; keep Apple/small PNG icons.'


def digest(data):
    return hashlib.sha256(data).hexdigest()


def encode(image, **options):
    output = io.BytesIO()
    image.save(output, format='WEBP', method=4, **options)
    return output.getvalue()


def samples(image, background):
    canvas = Image.new('RGBA', image.size, (*background, 255))
    canvas.alpha_composite(image.convert('RGBA'))
    array = np.asarray(canvas.convert('RGB'), dtype=np.float32)
    h, w = array.shape[:2]
    array = np.pad(array, ((0, (-h) % 8), (0, (-w) % 8), (0, 0)), mode='edge')
    return array.reshape(array.shape[0] // 8, 8, array.shape[1] // 8, 8, 3)


def similarity(original, compressed):
    """Check local RGB structure on both light and dark backgrounds."""
    scores = []
    for bg in [(255, 255, 255), (24, 24, 24)]:
        a, b = samples(original, bg), samples(compressed, bg)
        ma, mb = a.mean(axis=(1, 3)), b.mean(axis=(1, 3))
        va, vb = a.var(axis=(1, 3)), b.var(axis=(1, 3))
        cov = (a * b).mean(axis=(1, 3)) - ma * mb
        ssim = ((2 * ma * mb + 6.5025) * (2 * cov + 58.5225)) / (
            (ma * ma + mb * mb + 6.5025) * (va + vb + 58.5225))
        scores.append(float(ssim.mean()))
    return min(scores)


def optimize(path, known):
    relative = path.relative_to(PUBLIC).as_posix()
    source = path.read_bytes()
    prior = known.get(relative)
    if prior and digest(source) == prior['sha256']:
        return prior, None, None
    with Image.open(path) as opened:
        original_format = opened.format
        if getattr(opened, 'is_animated', False):
            raise ValueError(f'Animated image needs a separate encoding policy: {path}')
        image = opened.convert('RGBA' if 'A' in opened.getbands() else 'RGB')
    icon = path.name in COMPATIBILITY_ICONS
    target = path if icon else path.with_suffix('.webp')
    if target != path and target.exists():
        raise ValueError(f'Refusing to overwrite another image: {target}')
    score = 1.0
    if icon:
        output = io.BytesIO()
        image.save(output, format='PNG', optimize=True)
        result = min([source, output.getvalue()], key=len) if original_format == 'PNG' else output.getvalue()
        encoding = 'compatible PNG'
    else:
        result = source if original_format == 'WEBP' else encode(image, lossless=True, exact=True)
        encoding = 'original WebP' if original_format == 'WEBP' else 'lossless WebP'
        for quality in [68, 75, 82, 88, 94]:
            candidate = encode(image, quality=quality, alpha_quality=100, exact=True)
            if len(candidate) >= len(result) * (0.92 if original_format == 'WEBP' else 1):
                continue
            with Image.open(io.BytesIO(candidate)) as decoded:
                candidate_score = similarity(image, decoded)
                if image.convert('RGBA').getchannel('A').tobytes() != decoded.convert('RGBA').getchannel('A').tobytes():
                    raise ValueError(f'Alpha channel changed: {path}')
            if candidate_score >= 0.98:
                result, score, encoding = candidate, candidate_score, f'WebP quality {quality}'
                break
    record = {
        'originalFile': relative, 'file': target.relative_to(PUBLIC).as_posix(),
        'beforeBytes': len(source), 'afterBytes': len(result),
        'width': image.width, 'height': image.height, 'encoding': encoding,
        'similarity': round(score, 6), 'sha256': digest(result),
    }
    replacement = (relative, target.relative_to(PUBLIC).as_posix()) if target != path else None
    return record, replacement, (path, target, result)


def update_references(replacements):
    # Preserve archived captures and original remote URLs in the manifest.
    texts = [*ROOT.glob('*.js'), *ROOT.glob('*.css'), *ROOT.glob('*.html')]
    for directory in ['src', 'public', 'scripts']:
        texts.extend(p for p in (ROOT / directory).rglob('*') if p.suffix in {'.html', '.js', '.cjs', '.mjs', '.css'})
    for path in texts:
        original = path.read_text()
        updated = original
        for old, new in replacements.items():
            updated = updated.replace('/' + old, '/' + new)
        updated = updated.replace('3625e314f1ac-icon3.webp" sizes="512x512" type="image/png"',
                                  '3625e314f1ac-icon3.webp" sizes="512x512" type="image/webp"')
        if updated != original:
            path.write_text(updated)
    manifest_path = PUBLIC / 'assets-manifest.json'
    manifest = json.loads(manifest_path.read_text())
    for item in manifest['files']:
        item['file'] = replacements.get(item['file'], item['file'])
        item['bytes'] = (PUBLIC / item['file']).stat().st_size
    manifest_path.write_text(json.dumps(manifest, indent=2, ensure_ascii=False) + '\n')


def write_report(records):
    report = {'policy': POLICY, 'beforeBytes': sum(r['beforeBytes'] for r in records),
              'afterBytes': sum(r['afterBytes'] for r in records), 'images': records}
    REPORT.parent.mkdir(parents=True, exist_ok=True)
    REPORT.write_text(json.dumps(report, indent=2, ensure_ascii=False) + '\n')
    print(json.dumps({k: v for k, v in report.items() if k != 'images'}, indent=2))


def main():
    previous = json.loads(REPORT.read_text()) if REPORT.exists() else {'images': []}
    known = {item['file']: item for item in previous['images']}
    records, replacements, outputs = [], {}, []
    paths = sorted(p for p in PUBLIC.rglob('*') if p.suffix.lower() in IMAGE_TYPES)
    with ThreadPoolExecutor(max_workers=4) as pool:
        for index, (record, replacement, output) in enumerate(pool.map(lambda p: optimize(p, known), paths), 1):
            records.append(record)
            if replacement:
                replacements[replacement[0]] = replacement[1]
            if output:
                outputs.append(output)
            if index % 50 == 0:
                print(f'Checked {index}/{len(paths)} images', flush=True)
    # Finish encoding and validation before changing any source files.
    for source_path, target_path, data in outputs:
        target_path.write_bytes(data)
        if target_path != source_path:
            source_path.unlink()
    update_references(replacements)
    write_report(records)
    print(f'Processed {len(records)} images; migrated {len(replacements)} local paths.')


if __name__ == '__main__':
    main()

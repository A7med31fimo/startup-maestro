#!/usr/bin/env python3
"""
Generate placeholder icons for Startup Maestro.
Run this before building: python3 generate_icons.py
Requires: pip install Pillow
"""
import os
import struct
import zlib

def create_png(width, height, color=(124, 92, 252, 255)):
    """Create a minimal valid PNG with a solid color."""
    def make_png_chunk(chunk_type, data):
        c = chunk_type + data
        return struct.pack('>I', len(data)) + c + struct.pack('>I', zlib.crc32(c) & 0xFFFFFFFF)

    header = b'\x89PNG\r\n\x1a\n'
    ihdr_data = struct.pack('>IIBBBBB', width, height, 8, 2, 0, 0, 0)
    ihdr = make_png_chunk(b'IHDR', ihdr_data)

    raw_rows = []
    row = b'\x00' + bytes([color[0], color[1], color[2]]) * width
    for _ in range(height):
        raw_rows.append(row)
    compressed = zlib.compress(b''.join(raw_rows))
    idat = make_png_chunk(b'IDAT', compressed)
    iend = make_png_chunk(b'IEND', b'')

    return header + ihdr + idat + iend

def write_png(path, width, height):
    data = create_png(width, height)
    with open(path, 'wb') as f:
        f.write(data)
    print(f"  Created: {path} ({width}x{height})")

icons_dir = os.path.join(os.path.dirname(__file__), 'icons')
os.makedirs(icons_dir, exist_ok=True)

print("Generating Startup Maestro icons...")

write_png(os.path.join(icons_dir, '32x32.png'), 32, 32)
write_png(os.path.join(icons_dir, '128x128.png'), 128, 128)
write_png(os.path.join(icons_dir, '128x128@2x.png'), 256, 256)

# Create .ico file (multi-size Windows icon) embedding the 32x32 PNG
ico_path = os.path.join(icons_dir, 'icon.ico')
png_data = create_png(32, 32)
with open(ico_path, 'wb') as f:
    # ICO header
    f.write(struct.pack('<HHH', 0, 1, 1))   # reserved, type=1(ICO), count=1
    # Directory entry for 32x32 image
    img_offset = 6 + 16  # header + 1 directory entry
    f.write(struct.pack('<BBBBHHII',
        32, 32, 0, 0, 1, 32, len(png_data), img_offset))
    f.write(png_data)
print(f"  Created: {ico_path}")

# Create .icns placeholder (macOS — can be empty for Windows-only builds)
icns_path = os.path.join(icons_dir, 'icon.icns')
with open(icns_path, 'wb') as f:
    # Minimal valid ICNS: magic + size header only
    f.write(b'icns')
    f.write(struct.pack('>I', 8))
print(f"  Created: {icns_path} (placeholder)")

print("\nDone. For production icons:")
print("  1. Create a 1024x1024 icon.png")
print("  2. Run: cargo tauri icon icon.png")
print("  This generates all required sizes automatically.")

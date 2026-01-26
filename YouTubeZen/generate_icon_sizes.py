#!/usr/bin/env python3
"""
Generate all required iOS app icon sizes from the 1024x1024 master icon
"""
from PIL import Image
import os

# Define all required icon sizes
icon_sizes = [
    ("icon-20@2x.png", 40),
    ("icon-20@3x.png", 60),
    ("icon-29@2x.png", 58),
    ("icon-29@3x.png", 87),
    ("icon-40@2x.png", 80),
    ("icon-40@3x.png", 120),
    ("icon-60@2x.png", 120),
    ("icon-60@3x.png", 180),
    ("icon-20.png", 20),
    ("icon-20@2x-ipad.png", 40),
    ("icon-29.png", 29),
    ("icon-29@2x-ipad.png", 58),
    ("icon-40.png", 40),
    ("icon-40@2x-ipad.png", 80),
    ("icon-76.png", 76),
    ("icon-76@2x.png", 152),
    ("icon-83.5@2x.png", 167),
]

# Path to the master icon and output directory
master_icon_path = "YouTubeZen/Assets.xcassets/AppIcon.appiconset/icon-1024.png"
output_dir = "YouTubeZen/Assets.xcassets/AppIcon.appiconset"

# Load the master icon
print(f"Loading master icon: {master_icon_path}")
master_icon = Image.open(master_icon_path)

# Ensure output directory exists
os.makedirs(output_dir, exist_ok=True)

# Generate each size
for filename, size in icon_sizes:
    output_path = os.path.join(output_dir, filename)

    # Resize with high-quality resampling
    resized_icon = master_icon.resize((size, size), Image.Resampling.LANCZOS)

    # Save the resized icon
    resized_icon.save(output_path, 'PNG')
    print(f"✓ Generated {filename} ({size}x{size}px)")

print(f"\n✓ All icon sizes generated successfully!")
print(f"✓ Total icons: {len(icon_sizes) + 1} (including 1024x1024)")

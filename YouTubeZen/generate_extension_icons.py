#!/usr/bin/env python3
"""
Generate YouTube Zen extension icons matching the app icon
Creates icons in sizes: 16x16, 48x48, 128x128 for Safari extension
"""
from PIL import Image, ImageDraw, ImageFont
import os

# YouTube colors
YOUTUBE_RED = '#FF0000'
WHITE = '#FFFFFF'

def create_extension_icon(size, output_path):
    """Create a single extension icon"""
    # Create image with YouTube red background
    img = Image.new('RGB', (size, size), YOUTUBE_RED)
    draw = ImageDraw.Draw(img)

    # Calculate font size proportional to icon size
    font_size = int(size * 0.37)  # ~37% of icon size

    # Try to use a bold system font
    try:
        font_paths = [
            '/System/Library/Fonts/Helvetica.ttc',
            '/System/Library/Fonts/SFCompact.ttf',
            '/System/Library/Fonts/SFNS.ttf',
            '/Library/Fonts/Arial Bold.ttf',
        ]

        font = None
        for font_path in font_paths:
            if os.path.exists(font_path):
                font = ImageFont.truetype(font_path, font_size)
                break

        if font is None:
            font = ImageFont.load_default()
    except Exception as e:
        print(f"Font loading failed: {e}")
        font = ImageFont.load_default()

    # Draw "ZEN" text centered
    text = "ZEN"

    # Get text bounding box for centering
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]

    # Center the text
    x = (size - text_width) // 2
    y = (size - text_height) // 2 - int(size * 0.03)  # Slight adjustment

    # Draw text (with shadow for larger sizes)
    if size >= 48:
        shadow_offset = max(1, int(size * 0.008))
        draw.text((x + shadow_offset, y + shadow_offset), text, fill='#CC0000', font=font)

    draw.text((x, y), text, fill=WHITE, font=font)

    # Save the icon
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    img.save(output_path, 'PNG')
    print(f"✓ Created {size}x{size} icon: {output_path}")

# Icon sizes needed for Safari extension
sizes = [16, 48, 128]
extension_dir = 'YouTubeZen Extension'

for size in sizes:
    output_path = f'{extension_dir}/icon-{size}.png'
    create_extension_icon(size, output_path)

print(f"\n✓ All extension icons generated successfully!")
print(f"✓ Color: YouTube Red ({YOUTUBE_RED})")

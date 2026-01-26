#!/usr/bin/env python3
"""
Generate YouTube Zen app icon with "ZEN" text in YouTube colors
"""
from PIL import Image, ImageDraw, ImageFont
import os

# Icon settings
SIZE = 1024
YOUTUBE_RED = '#FF0000'
WHITE = '#FFFFFF'

# Create image with YouTube red background
img = Image.new('RGB', (SIZE, SIZE), YOUTUBE_RED)
draw = ImageDraw.Draw(img)

# Add rounded corners for modern iOS look
def add_rounded_corners(img, radius):
    """Add rounded corners to the icon"""
    # Create a mask for rounded corners
    mask = Image.new('L', (SIZE, SIZE), 0)
    mask_draw = ImageDraw.Draw(mask)
    mask_draw.rounded_rectangle([(0, 0), (SIZE, SIZE)], radius=radius, fill=255)

    # Create output with alpha channel
    output = Image.new('RGBA', (SIZE, SIZE), (0, 0, 0, 0))
    output.paste(img, (0, 0))
    output.putalpha(mask)
    return output

# Try to use a bold system font
font_size = 380
try:
    # Try common macOS system fonts
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
x = (SIZE - text_width) // 2
y = (SIZE - text_height) // 2 - 30  # Slight adjustment for visual centering

# Draw text with slight shadow for depth
shadow_offset = 8
draw.text((x + shadow_offset, y + shadow_offset), text, fill='#CC0000', font=font)
draw.text((x, y), text, fill=WHITE, font=font)

# Add rounded corners (iOS style)
img_with_corners = add_rounded_corners(img, radius=180)

# Save the icon
output_path = 'YouTubeZen/Assets.xcassets/AppIcon.appiconset/icon-1024.png'
os.makedirs(os.path.dirname(output_path), exist_ok=True)
img_with_corners.save(output_path, 'PNG')

print(f"✓ Icon generated: {output_path}")
print(f"✓ Size: {SIZE}x{SIZE}px")
print(f"✓ Color: YouTube Red ({YOUTUBE_RED})")

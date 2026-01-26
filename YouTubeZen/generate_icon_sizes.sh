#!/bin/bash
# Generate all required iOS app icon sizes from the 1024x1024 master icon

MASTER_ICON="YouTubeZen/Assets.xcassets/AppIcon.appiconset/icon-1024.png"
OUTPUT_DIR="YouTubeZen/Assets.xcassets/AppIcon.appiconset"

# Check if master icon exists
if [ ! -f "$MASTER_ICON" ]; then
    echo "Error: Master icon not found at $MASTER_ICON"
    exit 1
fi

echo "Generating iOS app icons from $MASTER_ICON..."
echo

# Array of icon sizes: "filename:size"
declare -a sizes=(
    "icon-20@2x.png:40"
    "icon-20@3x.png:60"
    "icon-29@2x.png:58"
    "icon-29@3x.png:87"
    "icon-40@2x.png:80"
    "icon-40@3x.png:120"
    "icon-60@2x.png:120"
    "icon-60@3x.png:180"
    "icon-20.png:20"
    "icon-20@2x-ipad.png:40"
    "icon-29.png:29"
    "icon-29@2x-ipad.png:58"
    "icon-40.png:40"
    "icon-40@2x-ipad.png:80"
    "icon-76.png:76"
    "icon-76@2x.png:152"
    "icon-83.5@2x.png:167"
)

# Generate each size
for item in "${sizes[@]}"; do
    IFS=':' read -r filename size <<< "$item"
    output_path="$OUTPUT_DIR/$filename"

    # Use sips to resize the image
    sips -z $size $size "$MASTER_ICON" --out "$output_path" > /dev/null 2>&1

    if [ $? -eq 0 ]; then
        echo "✓ Generated $filename (${size}x${size}px)"
    else
        echo "✗ Failed to generate $filename"
    fi
done

echo
echo "✓ All icon sizes generated successfully!"
echo "✓ Total icons: $((${#sizes[@]} + 1)) (including 1024x1024)"

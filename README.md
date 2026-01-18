# YouTube Zen - iOS Safari Extension

A Safari extension for iOS that removes distracting elements from YouTube, helping you focus on the content you intentionally want to watch.

## Features

YouTube Zen can hide the following elements:

- **Shorts** - Vertical video feed and navigation
- **Recommendations** - Sidebar suggestions, end screens, and autoplay
- **Comments** - Comment section on all videos
- **Homepage Feed** - Video grid on the home page
- **Promotions** - Banners, promos, and breaking news sections

## Installation

### Step 1: Install the App

Install the YouTube Zen app on your iOS device from TestFlight or build from source using Xcode.

### Step 2: Enable the Extension

1. Open the **Settings** app on your iPhone/iPad
2. Scroll down and tap **Safari**
3. Tap **Extensions**
4. Find **YouTube Zen** and toggle it **on**
5. Tap **YouTube Zen** to open its settings
6. Set "Allow Extension" to **On**
7. Under "Allow Extension to Read and Modify", select **youtube.com** or **All Websites**

## Managing Settings

All extension settings are managed through the Safari extension popup while browsing YouTube.

### How to Access the Extension Popup

1. Open **Safari** and navigate to **youtube.com**
2. Tap the **"aA"** button in the address bar (left side)
3. Tap **"YouTube Zen"** from the dropdown menu
4. The extension popup will appear with toggle controls

### Configuring What to Hide

In the popup, you'll see toggle switches for each feature:

| Setting | What It Hides |
|---------|---------------|
| Shorts | YouTube Shorts shelf and Shorts navigation tab |
| Recommendations | Suggested videos sidebar, end screen recommendations, autoplay |
| Comments | The entire comments section below videos |
| Homepage Feed | The video grid on YouTube's homepage |
| Promotions | Promotional banners, breaking news, and special event promotions |

Toggle each setting on or off based on your preferences. Your settings are saved automatically.

### Applying Changes

After changing settings, tap the **"Refresh page to apply"** button in the popup, or manually refresh the YouTube page for changes to take effect.

## Troubleshooting

### Extension Not Appearing in Safari

- Make sure the extension is enabled in Settings > Safari > Extensions
- Verify that YouTube Zen has permission to access youtube.com
- Try restarting Safari

### Settings Not Saving

- Ensure the extension has permission to store data
- Try disabling and re-enabling the extension

### Elements Still Showing After Toggling

- Refresh the YouTube page after making changes
- Some dynamically loaded content may require a full page reload

## Privacy

YouTube Zen:
- Does not collect any personal data
- Does not track your browsing activity
- All settings are stored locally on your device
- Only runs on youtube.com domains

## Building from Source

1. Clone this repository
2. Open `YouTubeZen/YouTubeZen.xcodeproj` in Xcode
3. Select your development team in the project settings
4. Build and run on your iOS device

## License

MIT License

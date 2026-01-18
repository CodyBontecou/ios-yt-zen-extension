import SwiftUI
import os.log

struct ContentView: View {
    // App Group identifier - must match the extension
    private let appGroupIdentifier = "group.com.codybontecou.youtubezen"
    private let logger = Logger(subsystem: "com.youtubezen.app", category: "settings")

    // Settings stored in App Group UserDefaults (shared with extension)
    @AppStorage("shorts", store: UserDefaults(suiteName: "group.com.codybontecou.youtubezen")) private var hideShorts = true
    @AppStorage("recommendations", store: UserDefaults(suiteName: "group.com.codybontecou.youtubezen")) private var hideRecommendations = true
    @AppStorage("comments", store: UserDefaults(suiteName: "group.com.codybontecou.youtubezen")) private var hideComments = true
    @AppStorage("homepage", store: UserDefaults(suiteName: "group.com.codybontecou.youtubezen")) private var hideHomepage = true
    @AppStorage("ads", store: UserDefaults(suiteName: "group.com.codybontecou.youtubezen")) private var hideAds = true

    @State private var showSavedIndicator = false

    var body: some View {
        NavigationView {
            ScrollView {
                VStack(alignment: .leading, spacing: 24) {
                    // Debug info
                    VStack(alignment: .leading, spacing: 4) {
                        Text("DEBUG INFO")
                            .font(.caption)
                            .fontWeight(.bold)
                        Text("App Group: \(appGroupIdentifier)")
                            .font(.caption2)
                            .foregroundColor(.secondary)
                        Text("Shorts: \(hideShorts ? "ON" : "OFF")")
                            .font(.caption2)
                        Text("Recommendations: \(hideRecommendations ? "ON" : "OFF")")
                            .font(.caption2)
                        Text("Comments: \(hideComments ? "ON" : "OFF")")
                            .font(.caption2)
                        Text("Homepage: \(hideHomepage ? "ON" : "OFF")")
                            .font(.caption2)
                        Text("Ads: \(hideAds ? "ON" : "OFF")")
                            .font(.caption2)
                    }
                    .padding()
                    .background(Color(.systemGray5))
                    .cornerRadius(8)


                    // Header
                    VStack(spacing: 8) {
                        ZStack {
                            Circle()
                                .fill(Color.red.opacity(0.1))
                                .frame(width: 80, height: 80)

                            Image(systemName: "eye.slash.circle.fill")
                                .font(.system(size: 50))
                                .foregroundColor(.red)
                        }

                        Text("YouTube Zen")
                            .font(.largeTitle)
                            .fontWeight(.bold)

                        Text("Curate your focus")
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                    }
                    .frame(maxWidth: .infinity)
                    .padding(.top, 20)

                    // Settings Section
                    VStack(alignment: .leading, spacing: 16) {
                        HStack {
                            Text("Hide Distractions")
                                .font(.headline)
                            Spacer()
                            if showSavedIndicator {
                                Text("Saved")
                                    .font(.caption)
                                    .foregroundColor(.green)
                                    .transition(.opacity)
                            }
                        }

                        // Shorts Toggle
                        SettingToggle(
                            title: "Shorts",
                            description: "Vertical video feed & navigation",
                            icon: "film.stack",
                            isOn: $hideShorts,
                            onToggle: onSettingChanged
                        )

                        Divider()

                        // Recommendations Toggle
                        SettingToggle(
                            title: "Recommendations",
                            description: "Related videos, sidebar & autoplay",
                            icon: "rectangle.stack",
                            isOn: $hideRecommendations,
                            onToggle: onSettingChanged
                        )

                        Divider()

                        // Comments Toggle
                        SettingToggle(
                            title: "Comments",
                            description: "Comment section on all videos",
                            icon: "bubble.left.and.bubble.right",
                            isOn: $hideComments,
                            onToggle: onSettingChanged
                        )

                        Divider()

                        // Homepage Feed Toggle
                        SettingToggle(
                            title: "Homepage Feed",
                            description: "Video grid & redirect to subscriptions",
                            icon: "house",
                            isOn: $hideHomepage,
                            onToggle: onSettingChanged
                        )

                        Divider()

                        // Ads/Promotions Toggle
                        SettingToggle(
                            title: "Promotions",
                            description: "Banners, promos & breaking news",
                            icon: "rectangle.and.hand.point.up.left",
                            isOn: $hideAds,
                            onToggle: onSettingChanged
                        )
                    }
                    .padding()
                    .background(Color(.systemBackground))
                    .cornerRadius(16)
                    .shadow(color: Color.black.opacity(0.05), radius: 10, x: 0, y: 4)


                    // Setup instructions
                    VStack(alignment: .leading, spacing: 16) {
                        Text("Enable the Extension")
                            .font(.headline)

                        InstructionStep(number: 1, text: "Open Settings app")
                        InstructionStep(number: 2, text: "Scroll down and tap Safari")
                        InstructionStep(number: 3, text: "Tap Extensions")
                        InstructionStep(number: 4, text: "Find \"YouTube Zen\" and enable it")
                        InstructionStep(number: 5, text: "Tap \"YouTube Zen\" and allow for youtube.com")
                    }
                    .padding()
                    .background(Color(.systemGray6))
                    .cornerRadius(12)

                    // Open Settings button
                    Button(action: openSettings) {
                        HStack {
                            Image(systemName: "gear")
                            Text("Open Safari Settings")
                        }
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Color.blue)
                        .foregroundColor(.white)
                        .cornerRadius(12)
                    }

                    // Manage Settings section
                    VStack(alignment: .leading, spacing: 16) {
                        Text("Manage Settings")
                            .font(.headline)

                        InstructionStep(number: 1, text: "Open Safari and go to youtube.com")
                        InstructionStep(number: 2, text: "Tap the \"aA\" button in the address bar")
                        InstructionStep(number: 3, text: "Tap \"YouTube Zen\" from the menu")
                        InstructionStep(number: 4, text: "Toggle which elements to hide or show")
                        InstructionStep(number: 5, text: "Refresh the page to apply changes")
                    }
                    .padding()
                    .background(Color(.systemGray6))
                    .cornerRadius(12)

                    // Note
                    VStack(spacing: 8) {
                        Text("💡 How it works")
                            .font(.footnote)
                            .fontWeight(.medium)
                            .foregroundColor(.blue)
                            .multilineTextAlignment(.center)

                        Text("Settings are automatically synced with the extension. Changes take effect immediately on YouTube.")
                            .font(.footnote)
                            .foregroundColor(.secondary)
                            .multilineTextAlignment(.center)
                    }
                    .padding()
                    .background(Color.blue.opacity(0.1))
                    .cornerRadius(12)
                    .frame(maxWidth: .infinity)

                    Spacer(minLength: 20)
                }
                .padding()
            }
            .navigationBarHidden(true)
            .background(Color(.systemGroupedBackground))
        }
    }

    func onSettingChanged() {
        // Log all settings
        logger.info("⚙️ Settings changed!")
        logger.info("  Shorts: \(self.hideShorts)")
        logger.info("  Recommendations: \(self.hideRecommendations)")
        logger.info("  Comments: \(self.hideComments)")
        logger.info("  Homepage: \(self.hideHomepage)")
        logger.info("  Ads: \(self.hideAds)")

        // Save to App Group UserDefaults
        if let sharedDefaults = UserDefaults(suiteName: appGroupIdentifier) {
            logger.info("✅ App Group UserDefaults accessible")
            logger.info("  Shorts from shared: \(sharedDefaults.bool(forKey: "shorts"))")
            logger.info("  Recommendations from shared: \(sharedDefaults.bool(forKey: "recommendations"))")
            logger.info("  Comments from shared: \(sharedDefaults.bool(forKey: "comments"))")
            logger.info("  Homepage from shared: \(sharedDefaults.bool(forKey: "homepage"))")
            logger.info("  Ads from shared: \(sharedDefaults.bool(forKey: "ads"))")
        } else {
            logger.error("❌ Failed to access App Group UserDefaults!")
        }

        // Also write to a JSON file in App Group container for extension to read
        writeSettingsToAppGroupFile()

        // Show saved indicator
        showSavedIndicator = true

        // Hide after 1.5 seconds
        DispatchQueue.main.asyncAfter(deadline: .now() + 1.5) {
            withAnimation {
                showSavedIndicator = false
            }
        }
    }

    func writeSettingsToAppGroupFile() {
        guard let containerURL = FileManager.default.containerURL(forSecurityApplicationGroupIdentifier: appGroupIdentifier) else {
            logger.error("❌ Failed to get App Group container URL")
            return
        }

        let settingsURL = containerURL.appendingPathComponent("settings.json")

        let settings: [String: Bool] = [
            "shorts": hideShorts,
            "recommendations": hideRecommendations,
            "comments": hideComments,
            "homepage": hideHomepage,
            "ads": hideAds
        ]

        do {
            let jsonData = try JSONEncoder().encode(settings)
            try jsonData.write(to: settingsURL)
            logger.info("✅ Wrote settings to file: \(settingsURL.path)")
            logger.info("📝 Settings: \(String(data: jsonData, encoding: .utf8) ?? "error")")
        } catch {
            logger.error("❌ Failed to write settings file: \(error.localizedDescription)")
        }
    }

    func openSettings() {
        if let url = URL(string: "App-Prefs:root=SAFARI&path=WEB_EXTENSIONS") {
            if UIApplication.shared.canOpenURL(url) {
                UIApplication.shared.open(url)
            } else if let settingsUrl = URL(string: UIApplication.openSettingsURLString) {
                UIApplication.shared.open(settingsUrl)
            }
        }
    }
}

struct SettingToggle: View {
    let title: String
    let description: String
    let icon: String
    @Binding var isOn: Bool
    let onToggle: () -> Void

    var body: some View {
        HStack(spacing: 16) {
            // Icon
            ZStack {
                RoundedRectangle(cornerRadius: 8)
                    .fill(isOn ? Color.red.opacity(0.1) : Color.gray.opacity(0.1))
                    .frame(width: 40, height: 40)

                Image(systemName: icon)
                    .foregroundColor(isOn ? .red : .gray)
                    .font(.system(size: 20))
            }

            // Text
            VStack(alignment: .leading, spacing: 2) {
                Text(title)
                    .font(.body)
                    .fontWeight(.medium)

                Text(description)
                    .font(.caption)
                    .foregroundColor(.secondary)
            }

            Spacer()

            // Toggle
            Toggle("", isOn: $isOn)
                .labelsHidden()
                .tint(.red)
                .onChange(of: isOn) { _ in
                    onToggle()
                }
        }
    }
}


struct InstructionStep: View {
    let number: Int
    let text: String

    var body: some View {
        HStack(alignment: .top, spacing: 12) {
            Text("\(number)")
                .font(.caption)
                .fontWeight(.bold)
                .foregroundColor(.white)
                .frame(width: 24, height: 24)
                .background(Color.blue)
                .clipShape(Circle())

            Text(text)
                .font(.subheadline)

            Spacer()
        }
    }
}

#Preview {
    ContentView()
}

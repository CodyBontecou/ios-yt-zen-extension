import SwiftUI

struct ContentView: View {
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(alignment: .leading, spacing: 24) {
                    // Header
                    VStack(spacing: 8) {
                        Image(systemName: "eye.slash.circle.fill")
                            .font(.system(size: 60))
                            .foregroundColor(.red)

                        Text("YouTube Zen")
                            .font(.largeTitle)
                            .fontWeight(.bold)

                        Text("Distraction-free YouTube")
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                    }
                    .frame(maxWidth: .infinity)
                    .padding(.top, 20)

                    // What it hides
                    VStack(alignment: .leading, spacing: 12) {
                        Text("What This Extension Hides")
                            .font(.headline)

                        FeatureRow(icon: "film.stack", text: "YouTube Shorts")
                        FeatureRow(icon: "rectangle.stack", text: "Recommendations & Suggested Videos")
                        FeatureRow(icon: "bubble.left.and.bubble.right", text: "Comments Section")
                        FeatureRow(icon: "house", text: "Homepage Feed")
                    }
                    .padding()
                    .background(Color(.systemGray6))
                    .cornerRadius(12)

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

                    // Note
                    Text("After enabling, visit YouTube in Safari to enjoy a distraction-free experience.")
                        .font(.footnote)
                        .foregroundColor(.secondary)
                        .multilineTextAlignment(.center)
                        .frame(maxWidth: .infinity)

                    Spacer(minLength: 20)
                }
                .padding()
            }
            .navigationBarHidden(true)
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

struct FeatureRow: View {
    let icon: String
    let text: String

    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: icon)
                .foregroundColor(.red)
                .frame(width: 24)
            Text(text)
                .font(.subheadline)
            Spacer()
            Image(systemName: "checkmark.circle.fill")
                .foregroundColor(.green)
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

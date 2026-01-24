import SwiftUI

struct ContentView: View {
    // Solid deep red matching app icon
    private let zenRed = Color(red: 0.7, green: 0.11, blue: 0.11)

    var body: some View {
        ZStack {
            // Gradient background
            LinearGradient(
                gradient: Gradient(colors: [
                    Color(.systemBackground),
                    zenRed.opacity(0.08)
                ]),
                startPoint: .top,
                endPoint: .bottom
            )
            .ignoresSafeArea()

            ScrollView {
                VStack(spacing: 32) {
                    // Header block
                    VStack(spacing: 16) {
                        Text("ZEN")
                            .font(.system(size: 56, weight: .black, design: .monospaced))
                            .foregroundColor(zenRed)
                            .tracking(4)

                        Text("CURATE YOUR FOCUS")
                            .font(.system(size: 11, weight: .medium, design: .monospaced))
                            .tracking(2)
                            .foregroundColor(.secondary)
                    }
                    .frame(maxWidth: .infinity)
                    .padding(.top, 48)

                    // Instructions glass card
                    VStack(alignment: .leading, spacing: 0) {
                        Text("SETUP")
                            .font(.system(size: 13, weight: .bold, design: .monospaced))
                            .tracking(1.5)
                            .foregroundColor(zenRed)
                            .padding(.bottom, 24)

                        VStack(alignment: .leading, spacing: 20) {
                            StepView(number: "01", text: "Open Settings app")
                            StepView(number: "02", text: "Navigate to Safari")
                            StepView(number: "03", text: "Tap Extensions")
                            StepView(number: "04", text: "Enable YouTube Zen")
                            StepView(number: "05", text: "Allow for youtube.com")
                        }
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding(28)
                    .background(.ultraThinMaterial)
                    .clipShape(RoundedRectangle(cornerRadius: 20, style: .continuous))
                    .overlay(
                        RoundedRectangle(cornerRadius: 20, style: .continuous)
                            .strokeBorder(.white.opacity(0.2), lineWidth: 0.5)
                    )
                    .shadow(color: .black.opacity(0.1), radius: 20, x: 0, y: 10)

                    // Action button
                    Button(action: openSettings) {
                        HStack(spacing: 12) {
                            Text("OPEN SETTINGS")
                                .font(.system(size: 15, weight: .bold, design: .monospaced))
                                .tracking(1)

                            Image(systemName: "arrow.right")
                                .font(.system(size: 14, weight: .bold))
                        }
                        .foregroundColor(.white)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 20)
                        .background(
                            ZStack {
                                zenRed
                                LinearGradient(
                                    gradient: Gradient(colors: [
                                        .white.opacity(0.2),
                                        .clear
                                    ]),
                                    startPoint: .top,
                                    endPoint: .bottom
                                )
                            }
                        )
                        .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
                        .shadow(color: zenRed.opacity(0.4), radius: 15, x: 0, y: 8)
                    }

                    Spacer(minLength: 40)
                }
                .padding(.horizontal, 24)
            }
        }
    }

    func openSettings() {
        // Try to open Safari settings directly
        if let url = URL(string: "App-Prefs:root=SAFARI") {
            if UIApplication.shared.canOpenURL(url) {
                UIApplication.shared.open(url)
            } else if let settingsUrl = URL(string: UIApplication.openSettingsURLString) {
                UIApplication.shared.open(settingsUrl)
            }
        }
    }
}

struct StepView: View {
    let number: String
    let text: String

    var body: some View {
        HStack(alignment: .top, spacing: 16) {
            Text(number)
                .font(.system(size: 13, weight: .bold, design: .monospaced))
                .foregroundColor(Color(red: 0.7, green: 0.11, blue: 0.11))
                .frame(width: 32, alignment: .leading)

            Text(text)
                .font(.system(size: 15, weight: .regular))
                .foregroundColor(.primary)
                .fixedSize(horizontal: false, vertical: true)

            Spacer(minLength: 0)
        }
    }
}

#Preview {
    ContentView()
}

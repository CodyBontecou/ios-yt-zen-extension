import SafariServices
import os.log

class SafariWebExtensionHandler: NSObject, NSExtensionRequestHandling {
    // App Group identifier - must match the one in your app
    private let appGroupIdentifier = "group.com.codybontecou.youtubezen"

    func beginRequest(with context: NSExtensionContext) {
        os_log(.info, "🔔 SafariWebExtensionHandler: Received request")

        // Try to read settings from App Group file
        guard let containerURL = FileManager.default.containerURL(forSecurityApplicationGroupIdentifier: appGroupIdentifier) else {
            os_log(.error, "❌ Failed to get App Group container URL")
            sendDefaultSettings(context: context)
            return
        }

        let settingsURL = containerURL.appendingPathComponent("settings.json")
        os_log(.info, "📂 Reading from: %{public}@", settingsURL.path)

        do {
            let jsonData = try Data(contentsOf: settingsURL)
            os_log(.info, "✅ Read file: %{public}@", String(data: jsonData, encoding: .utf8) ?? "error")

            if let settings = try? JSONDecoder().decode([String: Bool].self, from: jsonData) {
                os_log(.info, "📤 Sending settings: %{public}@", String(describing: settings))
                let response = NSExtensionItem()
                response.userInfo = [SFExtensionMessageKey: ["settings": settings]]
                context.completeRequest(returningItems: [response], completionHandler: nil)
                return
            }
        } catch {
            os_log(.error, "❌ Failed to read settings file: %{public}@", error.localizedDescription)
        }

        // Fallback to defaults
        sendDefaultSettings(context: context)
    }

    private func sendDefaultSettings(context: NSExtensionContext) {
        os_log(.info, "📤 Sending default settings")
        let settings: [String: Bool] = [
            "shorts": true,
            "recommendations": true,
            "comments": true,
            "homepage": true,
            "ads": true
        ]

        let response = NSExtensionItem()
        response.userInfo = [SFExtensionMessageKey: ["settings": settings]]
        context.completeRequest(returningItems: [response], completionHandler: nil)
    }
}

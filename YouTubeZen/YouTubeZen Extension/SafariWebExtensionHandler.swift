import SafariServices
import os.log

class SafariWebExtensionHandler: NSObject, NSExtensionRequestHandling {
    func beginRequest(with context: NSExtensionContext) {
        // This extension doesn't need native messaging
        // All functionality is handled by content scripts

        let response = NSExtensionItem()
        response.userInfo = [ SFExtensionMessageKey: [ "status": "ok" ] ]

        context.completeRequest(returningItems: [response], completionHandler: nil)
    }
}

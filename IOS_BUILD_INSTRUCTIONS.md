# iOS Build Instructions

Since you are developing on Windows, you cannot build the final iOS application directly. You have successfully set up the project structure, but the final steps must be performed on a Mac.

## Prerequisites (On Mac)
1.  **Mac Computer**: Required for Xcode.
2.  **Xcode**: Install from the Mac App Store.
3.  **CocoaPods**: Install via terminal: `sudo gem install cocoapods`
4.  **Node.js**: Ensure Node.js is installed.

## Steps to Build

1.  **Clone the Repository**:
    Pull the `iphone-native-app` branch onto your Mac.
    ```bash
    git clone <your-repo-url>
    git checkout iphone-native-app
    ```

2.  **Install Dependencies**:
    ```bash
    npm install
    ```

3.  **Build Web Assets**:
    ```bash
    npm run build
    ```

4.  **Add iOS Platform (if not already present)**:
    If the `ios` folder is missing or incomplete:
    ```bash
    npx cap add ios
    ```

5.  **Sync Capacitor**:
    This copies your web build to the iOS project and updates native plugins.
    ```bash
    npx cap sync
    ```

6.  **Open in Xcode**:
    ```bash
    npx cap open ios
    ```

7.  **Build and Run**:
    - In Xcode, select your target device (Simulator or real iPhone).
    - Click the **Play** button (Run).

## Troubleshooting
- **CocoaPods Errors**: If `npx cap sync` fails on the "update" step, try running `cd ios && pod install && cd ..` manually.
- **Signing**: You will need an Apple Developer account (free or paid) to sign the app for a real device. Configure this in Xcode > Signing & Capabilities.

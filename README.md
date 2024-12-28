
# Palu-Desktop

A feature-rich video recording, screen capturing, and sharing application inspired by Loom. This project allows users to record their screens, webcam, or both simultaneously, edit videos, and share them easily via links.

This Palu has three components:
- [**Palu-Web**][1] (for video and workspace management)
- [**Palu-Desktop**][2] (for video recording)
- [**Palu-Express**][3] (for real time video processing and storaging in S3)

## Features

- **Screen Recording**: Record your entire screen, specific application windows, or browser tabs.
- **Webcam Recording**: Capture video directly from your webcam.
- **Audio Recording**: Support for system audio, microphone input, or both.
- **Video Editing**: Basic editing features like trimming, cropping, and adding captions.
- **Sharing**: Generate shareable links for recorded videos.
- **Cloud Storage**: Store videos securely in the cloud.
- **User Authentication**: Sign up, log in, and manage accounts securely.
- **Real-Time Notifications**: Notify users when their videos are processed and ready to share.

## Tech Stack

- **Framework**: Electron.js, React.js + vite
- **Styling**: Tailwind CSS
- **Authentication**: Clerk

## Installation

### Prerequisites
- Node.js (v16 or higher)

### Steps

1. Clone the repository:
   ```bash
   git clone https://github.com/1820ANKIT2029/Palu-Desktop.git
   cd Palu-Desktop
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory and add the api key as in .env.example.

4. Start the development server:
   ```bash
   npm run dev
   ```

## Usage

1. Log in or sign up.
2. Start a new recording by choosing screen, webcam, or both.
3. Edit your video after recording.

---

Happy Recording! 🎥

[1]: https://github.com/1820ANKIT2029/Palu-Web            "Palu-Web"
[2]: https://github.com/1820ANKIT2029/Palu-Desktop        "Palu-Desktop"
[3]: https://github.com/1820ANKIT2029/Palu-Express      "Palu-Express"

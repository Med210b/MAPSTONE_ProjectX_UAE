# Project Setup and Installation

This project was built using Google AI Studio. To run this project locally, follow the steps below.

## Prerequisites

- **Node.js**: Ensure you have Node.js installed (v18 or higher recommended).
- **npm**: Standard Node Package Manager.

## Getting Started

1. **Clone the repository**:
   ```bash
   git clone <your-repository-url>
   cd <repository-folder>
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Firebase Configuration**:
   Ensure the `firebase-applet-config.json` file is in the root directory. This file contains your Firebase project credentials.
   
   > **Note**: For Firebase Storage (profile uploads) to work, you must manually go to the [Firebase Console](https://console.firebase.google.com/), select your project, go to **Storage**, and click **"Get Started"** to enable the storage bucket.

4. **Start the development server**:
   ```bash
   npm run dev
   ```

5. **View the app**:
   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

- `npm run dev`: Starts the Vite development server.
- `npm run build`: Builds the application for production.
- `npm run lint`: Runs type checking.
- `npm run preview`: Previews the production build locally.

---
Built with ❤️ in Google AI Studio.

# 🎵 Ritmik - Emotion Based Music Recommender

Ritmik is a simple demo application that detects a user's emotion from a
photo and recommends a playlist based on that emotion.

The goal is to showcase how frontend technologies, lightweight AI
models, and clean UX can work together. No authentication, no database
--- just a smooth, interactive experience.

## 🚀 Features

- 🧠 Emotion Detection Uses \@vladmandic/face-api (TensorFlow.js) to
analyze facial expressions.

- 🎧 Playlist Recommendation Suggests songs for emotions like happy, sad,
angry, relaxed, neutral, etc.

- 🖼️ Photo Upload + URL Input Choose an image file or paste an online
image URL.

- 🔁 "Analyze Another Image" Reset One-click reset to start fresh.

- 📱 Responsive UI Fully styled with Tailwind CSS v4, optimized for mobile
& desktop.

- 🔗 YouTube & Spotify Quick Actions Instantly search song names on
YouTube or Spotify.

- 📋 Copy to Clipboard + Toast Notifications Fast copying for track titles
with instant UI feedback.

## 🏗️ Tech Stack

| Layer                 | Technology                             |
| --------------------- | -------------------------------------- |
| **Frontend**          | React (Vite)                           |
| **Styling**           | Tailwind CSS v4                        |
| **Emotion Detection** | `@vladmandic/face-api` (TensorFlow.js) |
| **Backend**           | Node.js + Express                      |
| **Utilities**         | CORS, dotenv, nodemon                  |


## 📂 Project Structure
```bash
ritmik/
├── client/                   # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── services/
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
│
├── server/                   # Node.js backend
│   ├── routes/
│   ├── controllers/
│   ├── index.js
│   └── package.json
│
└── README.md
```

## ⚙️ Installation & Running the App

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/akinmertbur/ritmik.git
cd ritmik
```
### 2️⃣ Install Dependencies
```bash
cd server
npm install

cd ../client
npm install
```
### 3️⃣ Start the Backend 
```bash
npm run dev
```
Backend will run on: http://localhost:3000

### 4️⃣ Start the Frontend
```bash
npm run dev
```

Frontend will run on: http://localhost:5173

## 🌈 How It Works

1\. The frontend loads TensorFlow models for:

 - face detection

 - emotion recognition

2\. The user uploads or pastes a photo.

3\. The model predicts emotions such as happy, sad, angry, surprised,
etc.

4\. The emotion is sent to the backend.

5\. The backend returns a simple JSON playlist based on the detected
emotion.

6\. The UI displays the playlist with:

 - YouTube search button

 - Spotify search button

 - Copy-to-clipboard button

Clean, simple, and fast.

## 🧩 Future Improvements

- 🎵 Integration with the Spotify API for real playlists

- 📷 Live camera capture support (WebRTC)

- 🪪 Basic user history using localStorage

- 🌙 Full dark mode toggle

- 🔍 Better emotion model fine-tuning

## 💡 Project Goal

This project is intentionally lightweight --- a demo focusing on:

- clean UI/UX

- simple AI usage

- quick frontend--backend communication

- showcasing concepts rather than production-grade architecture

Perfect for portfolios, experiments, or teaching demos.

## 📝 License

This project is licensed under the MIT License.

import { useState } from "react";
import { fetchPlaylist } from "./services/api";
import EmotionPhoto from "./components/EmotionPhoto";

function App() {
  const [playlist, setPlaylist] = useState(null);
  const [emotion, setEmotion] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleEmotionDetected = async (emotion, isRetry = false) => {
    if (!isRetry) setEmotion(emotion);
    setError("");
    setPlaylist(null);
    setLoading(true);

    try {
      const data = await fetchPlaylist(emotion);
      if (!data || !data.playlist?.length) {
        setError("No playlist found for this emotion 😕");
      } else {
        setPlaylist(data.playlist);
      }
    } catch (err) {
      if (err.message.includes("Failed to fetch")) {
        setError(
          "⚠️ Server not reachable. Please check your connection or backend server."
        );
      } else if (err.message.includes("404")) {
        setError("No playlist found for this emotion 😕");
      } else {
        setError("Unexpected error occurred. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    if (emotion) handleEmotionDetected(emotion, true);
  };

  return (
    <div style={{ maxWidth: 520, margin: "1rem auto", textAlign: "center" }}>
      <h1>🎵 Ritmik App</h1>
      <p style={{ color: "#777" }}>Your mood-based playlist generator</p>

      <EmotionPhoto onEmotionDetected={handleEmotionDetected} />

      {emotion && (
        <p>
          Detected Emotion: <strong>{emotion}</strong>
        </p>
      )}

      {loading && (
        <p style={{ color: "#3498db", marginTop: "1rem" }}>
          Fetching playlist… ⏳
        </p>
      )}

      {error && (
        <div
          style={{
            background: "#ffe8e8",
            color: "#d9534f",
            borderRadius: "8px",
            padding: "0.8rem 1rem",
            marginTop: "1rem",
          }}
        >
          {error}
          <br />
          {emotion && (
            <button
              onClick={handleRetry}
              style={{
                marginTop: "0.5rem",
                background: "#d9534f",
                color: "white",
                border: "none",
                borderRadius: "5px",
                padding: "0.4rem 1rem",
                cursor: "pointer",
              }}
            >
              Retry 🔁
            </button>
          )}
        </div>
      )}

      {playlist && (
        <div
          style={{
            marginTop: "1rem",
            background: "#f9f9f9",
            padding: "1rem",
            borderRadius: "8px",
            textAlign: "left",
          }}
        >
          <h3>🎧 Suggested Playlist</h3>
          <ul style={{ paddingLeft: "1.2rem" }}>
            {playlist.map((song, i) => (
              <li key={i}>{song}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;

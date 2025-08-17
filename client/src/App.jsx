// client/src/App.jsx
import { useState } from "react";
import EmotionPhoto from "./components/EmotionPhoto";

const EMOTIONS = [
  "happy",
  "sad",
  "angry",
  "relaxed",
  "motivated",
  "anxious",
  "neutral",
];

export default function App() {
  const [emotion, setEmotion] = useState("");
  const [playlist, setPlaylist] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function fetchPlaylist(targetEmotion) {
    try {
      setLoading(true);
      setError("");
      setPlaylist([]);
      const res = await fetch("http://localhost:3000/api/playlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emotion: targetEmotion }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed");
      setPlaylist(data.playlist);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  const handleDetectedEmotion = (detected) => {
    setEmotion(detected);
    fetchPlaylist(detected);
  };

  return (
    <div style={{ maxWidth: 640, margin: "2rem auto", textAlign: "center" }}>
      <h1>🎵 Ritmik</h1>

      <EmotionPhoto onEmotionDetected={handleDetectedEmotion} />

      <hr style={{ margin: "1.5rem 0" }} />

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!emotion) return setError("Select emotion");
          fetchPlaylist(emotion);
        }}
      >
        <select
          value={emotion}
          onChange={(e) => setEmotion(e.target.value)}
          style={{ padding: "0.5rem", fontSize: "1rem" }}
        >
          <option value="">-- Select an emotion --</option>
          {EMOTIONS.map((emo) => (
            <option key={emo} value={emo}>
              {emo.charAt(0).toUpperCase() + emo.slice(1)}
            </option>
          ))}
        </select>
        <br />
        <button
          type="submit"
          style={{ marginTop: "0.75rem", padding: "0.5rem 1rem" }}
        >
          Get Playlist
        </button>
      </form>

      {loading && <p>Loading…</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {playlist.length > 0 && (
        <div style={{ marginTop: "1.25rem", textAlign: "left" }}>
          <h3>Recommended Playlist ({emotion}):</h3>
          <ul>
            {playlist.map((song, i) => (
              <li key={i}>{song}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

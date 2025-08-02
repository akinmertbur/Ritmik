import { useState } from "react";
import './App.css'

const EMOTIONS = ["happy", "sad", "angry", "relaxed", "motivated", "anxious", "neutral"];

function App() {
  const [emotion, setEmotion] = useState("");
  const [playlist, setPlaylist] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!emotion) {
      setError("Please select an emotion.");
      return;
    }

    setLoading(true);
    setError("");
    setPlaylist([]);

    try {
      const res = await fetch("http://localhost:3000/api/playlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ emotion }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Something went wrong.");
      }

      setPlaylist(data.playlist);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 500, margin: "2rem auto", textAlign: "center" }}>
      <h1>🎵 Ritmik App</h1>
      <form onSubmit={handleSubmit}>
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
        <button type="submit" style={{ marginTop: "1rem", padding: "0.5rem 1rem" }}>
          Get Playlist
        </button>
      </form>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {playlist.length > 0 && (
        <div style={{ marginTop: "2rem", textAlign: "left" }}>
          <h3>Recommended Playlist:</h3>
          <ul>
            {playlist.map((song, index) => (
              <li key={index}>{song}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;

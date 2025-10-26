// client/src/services/api.js

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";

export async function fetchPlaylist(emotion) {
  try {
    const response = await fetch(`${API_BASE}/api/playlist`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ emotion }),
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (err) {
    console.error("API Error:", err);
    throw err;
  }
}

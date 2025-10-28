import { useState } from "react";
import { fetchPlaylist } from "./services/api";
import EmotionPhoto from "./components/EmotionPhoto";
import Card from "./components/ui/Card";
import Button from "./components/ui/Button";

const Badge = ({ emotion }) => {
  const map = {
    happy: "bg-emerald-100 text-emerald-700 ring-emerald-200",
    sad: "bg-sky-100 text-sky-700 ring-sky-200",
    angry: "bg-rose-100 text-rose-700 ring-rose-200",
    anxious: "bg-amber-100 text-amber-800 ring-amber-200",
    motivated: "bg-indigo-100 text-indigo-700 ring-indigo-200",
    relaxed: "bg-teal-100 text-teal-700 ring-teal-200",
    neutral: "bg-slate-100 text-slate-700 ring-slate-200",
  };
  const classes = map[emotion] ?? map.neutral;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm ring-1 ${classes}`}
    >
      <span className="size-1.5 rounded-full bg-current/60" />
      <span className="capitalize">{emotion}</span>
    </span>
  );
};

export default function App() {
  const [playlist, setPlaylist] = useState(null);
  const [emotion, setEmotion] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleEmotionDetected = async (emo, isRetry = false) => {
    if (!isRetry) setEmotion(emo);
    setError("");
    setPlaylist(null);
    setLoading(true);
    try {
      const data = await fetchPlaylist(emo);
      if (!data || !data.playlist?.length)
        setError("No playlist found for this emotion.");
      else setPlaylist(data.playlist);
    } catch (err) {
      if (err.message.includes("Failed to fetch"))
        setError("Server not reachable. Check your connection or backend.");
      else if (err.message.includes("404"))
        setError("No playlist found for this emotion.");
      else setError("Unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    if (emotion) handleEmotionDetected(emotion, true);
  };

  return (
    <div className="min-h-screen text-slate-900 bg-linear-to-b from-slate-50 to-indigo-50">
      <div className="mx-auto max-w-3xl px-4 py-10">
        <header className="mb-8 flex items-center justify-between">
          <div className="inline-flex items-center gap-3">
            <span className="inline-grid place-items-center size-11 rounded-2xl bg-indigo-100 text-indigo-600">
              <span className="text-2xl">🎵</span>
            </span>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Ritmik App</h1>
              <p className="text-slate-500 -mt-0.5">
                Your mood-based playlist generator
              </p>
            </div>
          </div>
        </header>

        <Card title="Analyze a Photo">
          <EmotionPhoto
            onEmotionDetected={handleEmotionDetected}
            onReset={() => {
              setEmotion(null);
              setPlaylist(null);
              setError("");
            }}
          />
        </Card>

        <section className="mt-6 space-y-3 text-center">
          {emotion && (
            <div className="flex items-center justify-center gap-2">
              <span className="text-slate-600">Detected emotion:</span>
              <Badge emotion={emotion} />
            </div>
          )}

          {loading && <p className="text-blue-600">Fetching playlist… ⏳</p>}

          {error && (
            <div className="mx-auto max-w-xl rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-rose-700">
              <p>{error}</p>
              {emotion && (
                <Button
                  variant="danger"
                  size="sm"
                  className="mt-3"
                  onClick={handleRetry}
                >
                  Retry 🔁
                </Button>
              )}
            </div>
          )}
        </section>

        {playlist && (
          <Card
            className="mt-6"
            title="Suggested Playlist"
            actions={emotion && <Badge emotion={emotion} />}
          >
            <ul className="mt-1 divide-y divide-slate-100">
              {playlist.map((song, i) => (
                <li
                  key={i}
                  className="py-2 first:pt-0 last:pb-0 flex items-center justify-between"
                >
                  <span>{song}</span>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </div>
    </div>
  );
}

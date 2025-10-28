// client/src/components/EmotionPhoto.jsx
import { useEffect, useRef, useState } from "react";
import * as faceapi from "@vladmandic/face-api";

const MODEL_URL = "/models";
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";

function mapExpressionsToEmotion(expressions) {
  if (!expressions) return "neutral";
  const entries = Object.entries(expressions).sort((a, b) => b[1] - a[1]);
  const topExpression = entries[0]?.[0];

  switch (topExpression) {
    case "happy":
      return "happy";
    case "sad":
      return "sad";
    case "angry":
      return "angry";
    case "fearful":
    case "disgusted":
      return "anxious";
    case "surprised":
      return "motivated";
    case "neutral":
    default:
      return "neutral";
  }
}

export default function EmotionPhoto({ onEmotionDetected, onReset }) {
  const [modelsReady, setModelsReady] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [urlInput, setUrlInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [warning, setWarning] = useState("");
  const [error, setError] = useState("");

  const imgRef = useRef(null);
  const canvasRef = useRef(null);

  // Load models once
  useEffect(() => {
    (async () => {
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
        ]);
        setModelsReady(true);
      } catch (e) {
        console.error(e);
        setError("Failed to load AI models. Please refresh the page.");
      }
    })();
  }, []);

  // ---- Actions ----
  function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreviewUrl(URL.createObjectURL(file));
    setError("");
    setWarning("");
  }

  function handleUrlSubmit(e) {
    e.preventDefault();
    if (!urlInput) return;

    // Basic URL validation
    try {
      const u = new URL(urlInput);
      if (!/^https?:/.test(u.protocol)) throw new Error("Invalid protocol");
    } catch {
      setError("Please enter a valid http/https image URL.");
      return;
    }

    // proxy the remote image to avoid CORS issues
    const proxied = `${API_BASE}/api/proxy-image?url=${encodeURIComponent(
      urlInput
    )}`;
    setPreviewUrl(proxied);
    setError("");
    setWarning("");
  }

  function resetAll() {
    setPreviewUrl(null);
    setUrlInput("");
    setError("");
    setWarning("");
    const c = canvasRef.current;
    if (c) {
      const ctx = c.getContext("2d");
      ctx?.clearRect(0, 0, c.width, c.height);
    }
    onReset?.();
  }

  async function analyzeImage() {
    const img = imgRef.current;
    if (!img || !img.complete || !img.naturalWidth) {
      setError("Image not ready or invalid.");
      return;
    }

    setLoading(true);
    setError("");
    setWarning("");

    const options = new faceapi.TinyFaceDetectorOptions({
      inputSize: 224,
      scoreThreshold: 0.5,
    });

    try {
      const results = await faceapi
        .detectAllFaces(img, options)
        .withFaceExpressions();

      // Prep canvas
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      ctx?.clearRect(0, 0, canvas.width, canvas.height);

      if (!results.length) {
        setError("No face detected. Try a clearer, front-facing image.");
        onEmotionDetected?.(null);
        return;
      }

      if (results.length > 1) {
        setWarning(
          `Multiple faces detected (${results.length}). Using the most prominent.`
        );
      }

      // draw boxes
      results.forEach((r) => {
        const { x, y, width, height } = r.detection.box;
        ctx.lineWidth = 2;
        ctx.strokeStyle = "white";
        ctx.strokeRect(x, y, width, height);
      });

      // choose largest face
      const largest = results.reduce((max, r) =>
        r.detection.box.area > max.detection.box.area ? r : max
      );

      const emotion = mapExpressionsToEmotion(largest.expressions);
      onEmotionDetected?.(emotion);
    } catch (err) {
      console.error("Detection error:", err);
      setError("Something went wrong while analyzing the image.");
      onEmotionDetected?.(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h3 className="text-center text-xl font-semibold">Analyze a Photo</h3>

      {/* Controls */}
      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-center">
        <input
          type="file"
          accept="image/*"
          onChange={handleFile}
          disabled={!modelsReady}
          className="block w-full sm:w-auto rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-1.5 file:text-slate-700 hover:file:bg-slate-200 disabled:opacity-50"
        />
        <form
          onSubmit={handleUrlSubmit}
          className="flex gap-2 w-full sm:w-auto"
        >
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="Paste image URL"
            disabled={!modelsReady}
            className="flex-1 min-w-0 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!urlInput || !modelsReady}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-white text-sm font-medium hover:bg-indigo-700 active:scale-[.99] disabled:opacity-60"
          >
            Load
          </button>
        </form>
      </div>

      {!modelsReady && (
        <p className="mt-2 text-center text-slate-500">Loading models…</p>
      )}
      {error && (
        <p className="mt-2 text-center text-rose-600">
          {error}
          <button
            onClick={analyzeImage}
            className="ml-2 rounded-md bg-rose-600 px-2 py-1 text-white text-xs hover:bg-rose-700"
          >
            Retry
          </button>
        </p>
      )}
      {warning && <p className="mt-1 text-center text-amber-600">{warning}</p>}

      {/* Image area */}
      {previewUrl && (
        <>
          <div className="relative mx-auto mt-5 w-full max-w-[520px]">
            <img
              ref={imgRef}
              src={previewUrl}
              alt="preview"
              className={`w-full rounded-xl ${loading ? "brightness-75" : ""}`}
              crossOrigin="anonymous"
              onLoad={analyzeImage}
              onError={() =>
                setError("Failed to load image. Check the URL or proxy.")
              }
            />
            <canvas
              ref={canvasRef}
              className="pointer-events-none absolute inset-0 h-full w-full"
            />

            {/* Overlay spinner */}
            {loading && (
              <div
                className="absolute inset-0 rounded-xl bg-black/40 text-white grid place-items-center"
                aria-busy="true"
                aria-label="Analyzing photo"
              >
                <div className="flex flex-col items-center">
                  <div className="h-11 w-11 animate-spin rounded-full border-4 border-white/40 border-t-white"></div>
                  <p className="mt-2 text-sm">Analyzing…</p>
                </div>
              </div>
            )}
          </div>

          {/* Reset */}
          <div className="mt-3 text-center">
            <button
              onClick={resetAll}
              className="inline-flex items-center gap-1 rounded-lg bg-slate-200 text-slate-800 px-3 py-1.5 text-sm hover:bg-slate-300"
            >
              🔁 Analyze another image
            </button>
          </div>
        </>
      )}
    </div>
  );
}

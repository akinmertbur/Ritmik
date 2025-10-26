// client/src/components/EmotionPhoto.jsx
import { useEffect, useRef, useState } from "react";
import * as faceapi from "@vladmandic/face-api";
import "./EmotionPhoto.css";

const MODEL_URL = "/models";

function mapExpressionsToEmotion(expressions) {
  if (!expressions) return null;
  const entries = Object.entries(expressions).sort((a, b) => b[1] - a[1]);
  const [top] = entries;
  const topExpression = top?.[0];

  switch (topExpression) {
    case "happy":
      return "happy";
    case "sad":
      return "sad";
    case "angry":
      return "angry";
    case "fearful":
      return "anxious";
    case "disgusted":
      return "anxious";
    case "surprised":
      return "motivated";
    case "neutral":
    default:
      return "neutral";
  }
}

export default function EmotionPhoto({ onEmotionDetected }) {
  const [modelsReady, setModelsReady] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [urlInput, setUrlInput] = useState("");
  const [detected, setDetected] = useState(null);
  const [error, setError] = useState("");
  const [warning, setWarning] = useState("");
  const [loading, setLoading] = useState(false);

  const imgRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
        ]);
        setModelsReady(true);
      } catch (e) {
        setError("Failed to load AI models.");
        console.error(e);
      }
    })();
  }, []);

  async function analyzeImage() {
    const img = imgRef.current;
    if (!img || !img.complete || !img.naturalWidth) {
      setError("Image not ready or invalid.");
      return;
    }

    setLoading(true);
    setError("");
    setWarning("");
    setDetected(null);

    const options = new faceapi.TinyFaceDetectorOptions({
      inputSize: 224,
      scoreThreshold: 0.5,
    });

    try {
      const results = await faceapi
        .detectAllFaces(img, options)
        .withFaceExpressions();

      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      ctx?.clearRect(0, 0, canvas.width, canvas.height);

      if (results.length === 0) {
        setError("No face detected. Try a clearer, front-facing image.");
        setDetected(null);
        return;
      }

      if (results.length > 1) {
        setWarning(
          `Multiple faces detected (${results.length}). Using the most prominent.`
        );
      } else {
        setWarning("");
      }

      const largest = results.reduce((max, f) =>
        f.detection.box.area > max.detection.box.area ? f : max
      );

      results.forEach((r) => {
        const box = r.detection.box;
        ctx.lineWidth = 2;
        ctx.strokeStyle = "white";
        ctx.strokeRect(box.x, box.y, box.width, box.height);
      });

      const emotion = mapExpressionsToEmotion(largest.expressions);
      setDetected(emotion);
      onEmotionDetected?.(emotion);
    } catch (err) {
      console.error("Detection error:", err);
      setError("Something went wrong while analyzing the image.");
    } finally {
      setLoading(false);
    }
  }

  function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreviewUrl(URL.createObjectURL(file));
    setDetected(null);
    setError("");
    setWarning("");
  }

  function handleUrlSubmit(e) {
    e.preventDefault();
    if (!urlInput) return;
    const proxied = `http://localhost:3000/api/proxy-image?url=${encodeURIComponent(
      urlInput
    )}`;
    setPreviewUrl(proxied);
    setDetected(null);
    setError("");
    setWarning("");
  }

  const retryDetection = () => {
    setError("");
    analyzeImage();
  };

  return (
    <div style={{ maxWidth: 520, margin: "1rem auto", textAlign: "center" }}>
      <h3>Analyze a Photo</h3>

      <input
        type="file"
        accept="image/*"
        onChange={handleFile}
        disabled={!modelsReady}
      />

      <form onSubmit={handleUrlSubmit} style={{ marginTop: "0.5rem" }}>
        <input
          type="url"
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          placeholder="Paste image URL"
          style={{ width: "70%", padding: "0.25rem" }}
          disabled={!modelsReady}
        />
        <button type="submit" disabled={!urlInput || !modelsReady}>
          Load
        </button>
      </form>

      {!modelsReady && <p>Loading models…</p>}

      {error && (
        <p style={{ color: "red" }}>
          {error}
          <button onClick={retryDetection} style={{ marginLeft: 8 }}>
            Retry
          </button>
        </p>
      )}
      {warning && <p style={{ color: "orange" }}>{warning}</p>}

      {previewUrl && (
        <div className="image-wrap">
          {/* Image & canvas */}
          <img
            ref={imgRef}
            src={previewUrl}
            alt="preview"
            className={`photo ${loading ? "photo-dim" : ""}`}
            crossOrigin="anonymous"
            onLoad={analyzeImage}
            onError={() =>
              setError("Failed to load image. Check the URL or proxy.")
            }
          />
          <canvas ref={canvasRef} className="photo-canvas" />

          {/* Overlay spinner while analyzing */}
          {loading && (
            <div
              className="overlay"
              aria-busy="true"
              aria-label="Analyzing photo"
            >
              <div className="spinner" />
              <p>Analyzing…</p>
            </div>
          )}
        </div>
      )}

      {detected && (
        <p style={{ marginTop: 8 }}>
          Detected emotion: <strong>{detected}</strong>
        </p>
      )}
    </div>
  );
}

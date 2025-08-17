// client/src/components/EmotionPhoto.jsx
import { useEffect, useRef, useState } from "react";
import * as faceapi from "@vladmandic/face-api";

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

  const imgRef = useRef(null);
  const canvasRef = useRef(null);

  // Load face-api models
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
        ]);
        if (!cancelled) setModelsReady(true);
      } catch (e) {
        setError("Model loading failed");
        console.error(e);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Analyze image once it’s loaded
  async function analyzeImage() {
    const img = imgRef.current;
    if (!img) return;

    if (!img.complete || !img.naturalWidth || !img.naturalHeight) {
      setError("Image not loaded properly. Try again.");
      return;
    }

    const options = new faceapi.TinyFaceDetectorOptions({
      inputSize: 224,
      scoreThreshold: 0.5,
    });

    const result = await faceapi
      .detectSingleFace(img, options)
      .withFaceExpressions();

    // Draw bounding box
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (result?.detection) {
        const b = result.detection.box;
        ctx.lineWidth = 2;
        ctx.strokeStyle = "white";
        ctx.strokeRect(b.x, b.y, b.width, b.height);
      }
    }

    if (!result?.expressions) {
      setError("No face detected. Try a clearer, front-facing photo.");
      return;
    }

    const emotion = mapExpressionsToEmotion(result.expressions);
    setDetected(emotion);
    onEmotionDetected?.(emotion);
  }

  // Handle local file
  function onFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setDetected(null);
    setError("");
  }

  // Handle remote URL submit
  function onUrlSubmit(e) {
    e.preventDefault();
    if (!urlInput) return;
    const proxied = `http://localhost:3000/api/proxy-image?url=${encodeURIComponent(
      urlInput
    )}`;
    setPreviewUrl(proxied);
    setDetected(null);
    setError("");
  }

  // Handlers for the <img>
  const handleImgLoad = () => {
    analyzeImage();
  };

  const handleImgError = () => {
    setError("Failed to load image. Check the URL or proxy.");
  };

  return (
    <div style={{ maxWidth: 520, margin: "1rem auto", textAlign: "center" }}>
      <h3>Analyze a Photo</h3>

      {/* Local file upload */}
      <input
        type="file"
        accept="image/*"
        onChange={onFile}
        disabled={!modelsReady}
      />

      {/* Remote URL input */}
      <form onSubmit={onUrlSubmit} style={{ marginTop: "0.5rem" }}>
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
      {error && <p style={{ color: "red" }}>{error}</p>}

      {previewUrl && (
        <div
          style={{
            position: "relative",
            display: "inline-block",
            marginTop: "1rem",
          }}
        >
          <img
            ref={imgRef}
            src={previewUrl}
            alt="preview"
            style={{ maxWidth: 500, width: "100%", borderRadius: 8 }}
            crossOrigin="anonymous"
            onLoad={handleImgLoad}
            onError={handleImgError}
          />
          <canvas
            ref={canvasRef}
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: "100%",
              height: "100%",
              pointerEvents: "none",
            }}
          />
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

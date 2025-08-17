import { Readable } from "stream";

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

function isSafeUrl(u) {
  try {
    const url = new URL(u);
    return ["http:", "https:"].includes(url.protocol);
  } catch {
    return false;
  }
}

const imageProxy = async (req, res) => {
  const { url } = req.query;
  if (!url || !isSafeUrl(url)) {
    return res.status(400).json({ error: "Invalid or missing url" });
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const upstream = await fetch(url, {
      signal: controller.signal,
      redirect: "follow",
      headers: {
        // some CDNs block requests with no UA
        "User-Agent": "RitmikProxy/1.0 (+https://localhost)",
        Accept: "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
      },
    });

    clearTimeout(timeout);

    if (!upstream.ok) {
      return res.status(upstream.status).send("Upstream error");
    }

    const ct = upstream.headers.get("content-type") || "";
    if (![...ALLOWED_TYPES].some((t) => ct.startsWith(t))) {
      return res.status(415).json({ error: `Unsupported content-type: ${ct}` });
    }

    // CORS + caching headers
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Content-Type", ct);
    const cl = upstream.headers.get("content-length");
    if (cl) res.setHeader("Content-Length", cl);
    res.setHeader("Cache-Control", "public, max-age=3600");

    // ✅ Convert Web Stream → Node stream and pipe to response
    if (upstream.body) {
      const nodeStream = Readable.fromWeb(upstream.body);
      nodeStream.on("error", () => res.destroy());
      nodeStream.pipe(res);
    } else {
      // fallback (shouldn’t usually happen)
      const buf = Buffer.from(await upstream.arrayBuffer());
      res.end(buf);
    }
  } catch (e) {
    if (e.name === "AbortError")
      return res.status(504).send("Upstream timeout");
    // Optional: log e for debugging
    res.status(500).send("Proxy failed");
  }
};

export { imageProxy };

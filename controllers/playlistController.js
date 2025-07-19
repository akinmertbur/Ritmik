import { getPlaylistByEmotion } from "../services/playlistService.js";

export function suggestPlaylist(req, res) {
  const { emotion } = req.body;

  // Check if emotion was sent
  if (!emotion) {
    return res.status(400).json({ error: "Emotion is required." });
  }

  const playlist = getPlaylistByEmotion(emotion.toLowerCase());

  // Check if we have a playlist for the given emotion
  if (!playlist || !playlist.length) {
    return res.status(404).json({ error: `No playlist found for emotion: ${emotion}` });
  }

  // Success response
  res.status(200).json({ emotion, playlist });
}

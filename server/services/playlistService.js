import { emotionPlaylists } from "../data/emotionsPlaylists.js";

export function getPlaylistByEmotion(emotion) {
  return emotionPlaylists[emotion] || [];
}

import { Track, Theme, Texture } from "./types";

// Spotify Configuration
export const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID || "";
export const SPOTIFY_AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";
export const SPOTIFY_TOKEN_ENDPOINT = "https://accounts.spotify.com/api/token";

// REDIRECT URI
export const SPOTIFY_REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI || "";

// PKCE Configuration
export const CODE_VERIFIER_KEY = "spotify_code_verifier";

export const SPOTIFY_SCOPES = [
  "user-top-read",
  "user-read-private",
  "user-read-email",
];

// Mock Data
export const MOCK_TRACKS: Track[] = [
  { id: "1", name: "Midnight City", artist: "M83", duration_ms: 243000 },
  {
    id: "2",
    name: "Cruel Summer",
    artist: "Taylor Swift",
    duration_ms: 178000,
  },
  { id: "3", name: "Starboy", artist: "The Weeknd", duration_ms: 230000 },
  { id: "4", name: "As It Was", artist: "Harry Styles", duration_ms: 167000 },
  { id: "5", name: "Flowers", artist: "Miley Cyrus", duration_ms: 200000 },
];

export const THEME_STYLES: Record<Theme, string> = {
  classic: "bg-[#fbfbfb] text-gray-800",
  mint: "bg-[#e0f7fa] text-teal-900",
  sakura: "bg-[#fff0f5] text-pink-900",
  dark: "bg-[#1a1a1a] text-gray-200",
  cyber: "bg-zinc-900 text-[#00ff41]",
};

export const TEXTURE_STYLES: Record<Texture, string> = {
  clean: "",
  crumpled: "", // Handled via SVG overlay in component
  faded: "opacity-85 sepia-[.3]",
};

export const formatDuration = (ms: number): string => {
  const minutes = Math.floor(ms / 60000);
  const seconds = ((ms % 60000) / 1000).toFixed(0);
  return `${minutes}:${Number(seconds) < 10 ? "0" : ""}${seconds}`;
};

export const formatDate = (date: Date): string => {
  return date
    .toLocaleDateString("en-US", {
      weekday: "short",
      month: "numeric",
      day: "numeric",
      year: "2-digit",
    })
    .toUpperCase()
    .replace(/,/g, "");
};

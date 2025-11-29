export interface Track {
  id: string;
  name: string;
  artist: string; // Display string (e.g., "Artist A, Artist B")
  duration_ms: number;
  popularity?: number;
  albumArt?: string;
  url?: string;
}

export type TimeRange = "short_term" | "medium_term" | "long_term";

export type Theme = "classic" | "mint" | "sakura" | "dark" | "cyber";

export type Texture = "clean" | "crumpled" | "faded";

export type ReceiptMode = "standard" | "vibe" | "roast";

export interface UserData {
  username: string;
  topTracks: Track[];
  topArtists: string[];
  topGenres: string[];
  totalMinutes: number; // Estimated based on tracks
  generatedAt: Date;
}

export interface ReceiptConfig {
  theme: Theme;
  texture: Texture;
  timeRange: TimeRange;
  showBarcode: boolean;
  length: number;
  showAlbumArt: boolean;
  mode: ReceiptMode;
}

// Raw Spotify API Types
export interface SpotifyArtist {
  name: string;
  id: string;
  genres?: string[];
}

export interface SpotifyTrack {
  id: string;
  name: string;
  artists: SpotifyArtist[];
  duration_ms: number;
  popularity: number;
  external_urls: { spotify: string };
  album: {
    images: { url: string }[];
  };
}

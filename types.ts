export interface Track {
  id: string;
  name: string;
  artist: string;
  duration_ms: number;
  popularity: number;
  albumArt?: string;
  url?: string;
  releaseDate?: string;
  explicit: boolean;
}

export type TimeRange = "short_term" | "medium_term" | "long_term";

export type Theme = "classic" | "mint" | "sakura" | "dark" | "cyber";

export type Texture = "clean" | "crumpled" | "faded";

export type ViewMode = "receipt" | "stats";

export interface UserData {
  username: string;
  topTracks: Track[];
  topArtists: string[];
  topGenres: string[];
  generatedAt: Date;
  stats: {
    avgPopularity: number; // 0-100
    explicitCount: number;
    avgDuration: number;
    trackCount: number;
    varietyScore: number; // 0-1 (Low = Loyalist, High = Explorer)
    shortestTrack: Track | null;
    longestTrack: Track | null;
  };
  genreCounts?: Record<string, number>;
  decadeCounts?: Record<string, number>;
  artistCounts?: Record<string, number>;
}

export interface ReceiptConfig {
  theme: Theme;
  texture: Texture;
  timeRange: TimeRange;
  showBarcode: boolean;
  length: number;
  showAlbumArt: boolean;
  view: ViewMode;
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
  explicit: boolean;
  external_urls: { spotify: string };
  album: {
    images: { url: string }[];
    release_date: string;
  };
}

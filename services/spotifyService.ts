import {
  SPOTIFY_AUTH_ENDPOINT,
  SPOTIFY_TOKEN_ENDPOINT,
  SPOTIFY_CLIENT_ID,
  SPOTIFY_REDIRECT_URI,
  SPOTIFY_SCOPES,
} from "../constants";
import { SpotifyTrack, Track, UserData } from "../types";

// PKCE Helpers
const generateRandomString = (length: number) => {
  const possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const values = crypto.getRandomValues(new Uint8Array(length));
  return values.reduce((acc, x) => acc + possible[x % possible.length], "");
};

const sha256 = async (plain: string) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  return window.crypto.subtle.digest("SHA-256", data);
};

const base64encode = (input: ArrayBuffer) => {
  return btoa(String.fromCharCode(...new Uint8Array(input)))
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
};

// Initiate Login - Generates PKCE challenge and redirects
export const redirectToSpotifyLogin = async () => {
  const codeVerifier = generateRandomString(64);
  const hashed = await sha256(codeVerifier);
  const codeChallenge = base64encode(hashed);

  // Store verifier in localStorage to use after callback
  window.localStorage.setItem("spotify_code_verifier", codeVerifier);

  const params = {
    response_type: "code",
    client_id: SPOTIFY_CLIENT_ID,
    scope: SPOTIFY_SCOPES.join(" "),
    code_challenge_method: "S256",
    code_challenge: codeChallenge,
    redirect_uri: SPOTIFY_REDIRECT_URI,
  };

  const authUrl = new URL(SPOTIFY_AUTH_ENDPOINT);
  authUrl.search = new URLSearchParams(params).toString();
  window.location.href = authUrl.toString();
};

// Handle Callback - Exchange code for token
export const exchangeCodeForToken = async (
  code: string,
): Promise<string | null> => {
  const codeVerifier = window.localStorage.getItem("spotify_code_verifier");

  if (!codeVerifier) {
    console.error("No code verifier found");
    return null;
  }

  const payload = {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: SPOTIFY_CLIENT_ID,
      grant_type: "authorization_code",
      code,
      redirect_uri: SPOTIFY_REDIRECT_URI,
      code_verifier: codeVerifier,
    }),
  };

  try {
    const response = await fetch(SPOTIFY_TOKEN_ENDPOINT, payload);
    const data = await response.json();

    if (data.access_token) {
      window.localStorage.removeItem("spotify_code_verifier"); // Clean up
      return data.access_token;
    } else {
      console.error("Token exchange failed", data);
      return null;
    }
  } catch (error) {
    console.error("Network error during token exchange", error);
    return null;
  }
};

export const fetchSpotifyProfile = async (token: string) => {
  const result = await fetch("https://api.spotify.com/v1/me", {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
  return await result.json();
};

export const fetchTopTracks = async (
  token: string,
  timeRange: string = "short_term",
): Promise<UserData> => {
  // Fetch Top Tracks - limit 50 to allow client-side resizing
  const result = await fetch(
    `https://api.spotify.com/v1/me/top/tracks?time_range=${timeRange}&limit=50`,
    {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  const data = await result.json();
  const tracks: SpotifyTrack[] = data.items;

  // Map to internal Track type
  const mappedTracks: Track[] = tracks.map((t) => ({
    id: t.id,
    name: t.name,
    artist: t.artists.map((a) => a.name).join(", "),
    duration_ms: t.duration_ms,
    popularity: t.popularity,
    url: t.external_urls.spotify,
    albumArt: t.album.images[0]?.url, // High res
  }));

  // Extract Genres (Approximation)
  const artistIds = [
    ...new Set(tracks.flatMap((t) => t.artists.map((a) => a.id))),
  ]
    .slice(0, 5)
    .join(",");
  let topGenres: string[] = [];

  try {
    const artistsResult = await fetch(
      `https://api.spotify.com/v1/artists?ids=${artistIds}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    const artistsData = await artistsResult.json();
    const allGenres = artistsData.artists.flatMap((a: any) => a.genres);
    const frequency: Record<string, number> = {};
    allGenres.forEach((g: string) => {
      frequency[g] = (frequency[g] || 0) + 1;
    });
    topGenres = Object.entries(frequency)
      .sort((a, b) => b[1] - a[1])
      .map((e) => e[0])
      .slice(0, 3);
  } catch (e) {
    console.warn("Could not fetch genres", e);
    topGenres = ["Pop", "Music"];
  }

  const totalMinutes = Math.floor(
    mappedTracks.reduce((acc, t) => acc + t.duration_ms, 0) / 60000,
  );

  return {
    username: "USER",
    topTracks: mappedTracks,
    topArtists: [...new Set(mappedTracks.map((t) => t.artist.split(", ")[0]))],
    topGenres: topGenres.length > 0 ? topGenres : ["Eclectic"],
    totalMinutes,
    generatedAt: new Date(),
  };
};

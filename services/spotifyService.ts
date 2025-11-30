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

// Initiate Login
export const redirectToSpotifyLogin = async () => {
  const codeVerifier = generateRandomString(64);
  const hashed = await sha256(codeVerifier);
  const codeChallenge = base64encode(hashed);

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

// Handle Callback
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
      window.localStorage.removeItem("spotify_code_verifier");
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
  const result = await fetch(
    `https://api.spotify.com/v1/me/top/tracks?time_range=${timeRange}&limit=50`,
    {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    },
  );

  if (!result.ok) {
    throw new Error(`Spotify API Error: ${result.statusText}`);
  }

  const data = await result.json();
  const tracks: SpotifyTrack[] = data.items;

  // Map to internal Track type
  const mappedTracks: Track[] = tracks.map((t) => ({
    id: t.id,
    name: t.name,
    artist: t.artists.map((a) => a.name).join(", "),
    duration_ms: t.duration_ms,
    popularity: t.popularity,
    explicit: t.explicit,
    url: t.external_urls.spotify,
    albumArt: t.album.images[0]?.url,
    releaseDate: t.album.release_date,
  }));

  // --- Aggregate Stats ---

  // 1. Artist Calculations
  const uniqueArtistIds = [
    ...new Set(tracks.flatMap((t) => t.artists.map((a) => a.id))),
  ];
  const artistCounts: Record<string, number> = {};

  // Count artist frequency in the tracklist
  mappedTracks.forEach((t) => {
    const primaryArtist = t.artist.split(", ")[0];
    artistCounts[primaryArtist] = (artistCounts[primaryArtist] || 0) + 1;
  });

  // Calculate Variety Score (Unique Artists / Total Tracks)
  // Close to 1 = Explorer (Lots of different artists), Close to 0 = Loyalist (Same few artists)
  const varietyScore =
    mappedTracks.length > 0
      ? Object.keys(artistCounts).length / mappedTracks.length
      : 0;

  // 2. Genres
  const chunkArray = (arr: string[], size: number) => {
    return Array.from({ length: Math.ceil(arr.length / size) }, (v, i) =>
      arr.slice(i * size, i * size + size),
    );
  };

  let topGenres: string[] = [];
  const genreCounts: Record<string, number> = {};
  const artistGenreMap: Record<string, string[]> = {};

  try {
    const chunks = chunkArray(uniqueArtistIds, 50);

    for (const chunk of chunks) {
      if (chunk.length === 0) continue;
      const artistsResult = await fetch(
        `https://api.spotify.com/v1/artists?ids=${chunk.join(",")}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (artistsResult.ok) {
        const artistsData = await artistsResult.json();
        artistsData.artists.forEach((a: any) => {
          artistGenreMap[a.id] = a.genres;
        });
      }
    }

    tracks.forEach((track) => {
      // Take the primary artist
      const primaryArtistId = track.artists[0]?.id;
      if (primaryArtistId && artistGenreMap[primaryArtistId]) {
        const genres = artistGenreMap[primaryArtistId];
        if (genres && genres.length > 0) {
          // Only count the FIRST genre (Primary Genre) to ensure counts match track numbers roughly
          const primaryGenre = genres[0];
          genreCounts[primaryGenre] = (genreCounts[primaryGenre] || 0) + 1;
        }
      }
    });

    topGenres = Object.entries(genreCounts)
      .sort((a, b) => b[1] - a[1])
      .map((e) => e[0])
      .slice(0, 3);
  } catch (e) {
    console.warn("Could not fetch genres", e);
    topGenres = ["Pop", "Music"];
  }

  // 3. Stats (Replacing Audio Features)
  const totalPopularity = mappedTracks.reduce(
    (acc, t) => acc + t.popularity,
    0,
  );
  const explicitCount = mappedTracks.filter((t) => t.explicit).length;
  const totalDuration = mappedTracks.reduce((acc, t) => acc + t.duration_ms, 0);

  // Find min/max duration tracks
  const sortedByDuration = [...mappedTracks].sort(
    (a, b) => a.duration_ms - b.duration_ms,
  );
  const shortestTrack =
    sortedByDuration.length > 0 ? sortedByDuration[0] : null;
  const longestTrack =
    sortedByDuration.length > 0
      ? sortedByDuration[sortedByDuration.length - 1]
      : null;

  const stats = {
    avgPopularity:
      mappedTracks.length > 0 ? totalPopularity / mappedTracks.length : 0,
    explicitCount: explicitCount,
    avgDuration:
      mappedTracks.length > 0 ? totalDuration / mappedTracks.length : 0,
    trackCount: mappedTracks.length,
    varietyScore,
    shortestTrack,
    longestTrack,
  };

  // 4. Decades
  const decadeCounts: Record<string, number> = {};
  mappedTracks.forEach((t) => {
    if (t.releaseDate) {
      const year = parseInt(t.releaseDate.split("-")[0]);
      if (!isNaN(year)) {
        const decade = Math.floor(year / 10) * 10;
        const label = `${decade}s`;
        decadeCounts[label] = (decadeCounts[label] || 0) + 1;
      }
    }
  });

  return {
    username: "USER",
    topTracks: mappedTracks,
    topArtists: [...new Set(mappedTracks.map((t) => t.artist.split(", ")[0]))],
    topGenres: topGenres.length > 0 ? topGenres : ["Eclectic"],
    generatedAt: new Date(),
    stats,
    genreCounts,
    decadeCounts,
    artistCounts,
  };
};

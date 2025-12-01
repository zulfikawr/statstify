import React, { useState, useEffect, useRef } from "react";
import * as htmlToImage from "html-to-image";
import ReceiptContainer from "./components/ReceiptContainer";
import StatsContainer from "./components/StatsContainer";
import Controls from "./components/Controls";
import { ReceiptConfig, UserData } from "./types";
import { MOCK_TRACKS } from "./constants";
import {
  redirectToSpotifyLogin,
  fetchSpotifyProfile,
  fetchTopTracks,
} from "./services/spotifyService";
import { ArrowRight, Sparkles, BarChart2 } from "lucide-react";

const App: React.FC = () => {
  // Auth State
  const [token, setToken] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // App State
  const receiptRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  const [config, setConfig] = useState<ReceiptConfig>({
    theme: "classic",
    texture: "clean",
    timeRange: "short_term",
    showBarcode: true,
    length: 10,
    showAlbumArt: false,
    view: "receipt", // 'receipt' or 'stats'
  });

  const [userData, setUserData] = useState<UserData | null>(null);

  useEffect(() => {
    if (token && userData) {
      loadData(token, config.timeRange);
    }
  }, [config.timeRange]);

  const loadData = async (accessToken: string, range: string) => {
    setIsLoggingIn(true);
    try {
      const [profile, data] = await Promise.all([
        fetchSpotifyProfile(accessToken),
        fetchTopTracks(accessToken, range),
      ]);

      const fullData = {
        ...data,
        username: profile.display_name || "Spotify User",
      };
      setUserData(fullData);
    } catch (error) {
      console.error("Failed to load Spotify data", error);
      alert("Session expired or error occurred. Please log in again.");
      setToken(null);
      try {
        window.localStorage.removeItem("spotify_access_token");
      } catch (e) {
        // ignore
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  // On mount, check for stored token (set by callback) and load data
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem("spotify_access_token");
      if (stored) {
        setToken(stored);
        loadData(stored, config.timeRange);
      }
    } catch (e) {
      // ignore storage errors
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogin = () => {
    setIsLoggingIn(true);
    redirectToSpotifyLogin();
  };

  const handleDownload = async () => {
    const targetRef = config.view === "receipt" ? receiptRef : statsRef;
    if (!targetRef.current) return;

    try {
      const dataUrl = await htmlToImage.toPng(targetRef.current, {
        cacheBust: true,
        pixelRatio: 2,
      });
      const link = document.createElement("a");
      link.download = `statstify-${config.view}-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Download failed", err);
      alert("Could not generate image. Please try again.");
    }
  };

  // Mock data for the landing page visual
  const mockLandingData: UserData = {
    username: "YOUR_NAME",
    topTracks: MOCK_TRACKS.map((t) => ({
      ...t,
      explicit: false,
      popularity: 80,
    })),
    topArtists: ["The Weeknd", "Taylor Swift", "SZA"],
    topGenres: ["Pop", "R&B"],
    generatedAt: new Date(),
    stats: {
      avgPopularity: 75,
      explicitCount: 2,
      avgDuration: 210000,
      trackCount: 10,
      varietyScore: 0.8,
      shortestTrack: MOCK_TRACKS[3], // As It Was
      longestTrack: MOCK_TRACKS[0], // Midnight City
    },
    genreCounts: { Pop: 6, Rock: 3, Indie: 1 },
    decadeCounts: { "2020s": 8, "2010s": 2 },
    artistCounts: {
      "The Weeknd": 3,
      "Taylor Swift": 2,
      SZA: 2,
      M83: 1,
      "Harry Styles": 2,
    },
  };

  // LOGGED IN DASHBOARD
  if (token && userData) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center py-6 px-4 md:py-12 md:px-8 font-sans selection:bg-black selection:text-white">
        {/* Header (Mobile Only) */}
        <div className="md:hidden text-center mb-6">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 flex items-center justify-center gap-2">
            <BarChart2 className="w-6 h-6" /> Statstify
          </h2>
        </div>

        <div className="w-full max-w-5xl flex flex-col md:flex-row gap-8 md:gap-16 items-start justify-center">
          {/* Left Column: The Receipt or Stats */}
          {/* On mobile: Order 1 (Top). On Desktop: Order 1 (Left) */}
          <div className="w-full flex justify-center md:justify-end md:w-auto md:flex-shrink-0 relative z-10 order-1">
            <div className="transform transition-transform duration-500 hover:scale-[1.01] origin-top">
              {config.view === "receipt" ? (
                <ReceiptContainer
                  ref={receiptRef}
                  userData={userData}
                  config={config}
                />
              ) : (
                <StatsContainer
                  ref={statsRef}
                  userData={userData}
                  config={config}
                />
              )}
            </div>
          </div>

          {/* Right Column: Controls */}
          {/* On mobile: Order 2 (Bottom). On Desktop: Sticky */}
          <div className="w-full md:w-[350px] order-2 md:sticky md:top-8 animate-in slide-in-from-bottom-4 duration-700">
            <div className="hidden md:block mb-6">
              <h2 className="text-4xl font-bold tracking-tighter text-gray-900">
                Statstify
              </h2>
              <p className="text-gray-500 font-medium">
                Analyze your music DNA.
              </p>
            </div>

            <Controls
              config={config}
              setConfig={setConfig}
              onDownload={handleDownload}
            />

            <div className="text-center mt-6 space-y-2">
              <button
                onClick={() => {
                  setToken(null);
                  setUserData(null);
                  try {
                    window.localStorage.removeItem("spotify_access_token");
                  } catch (e) {}
                  window.location.href = "/";
                }}
                className="text-xs font-semibold text-red-400 hover:text-red-600 transition-colors"
              >
                Log Out
              </button>
              <p className="text-[10px] text-gray-300 font-mono uppercase">
                Powered by Spotify API
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // LANDING PAGE
  return (
    <div className="min-h-screen bg-[#f3f4f6] text-gray-900 font-sans overflow-x-hidden flex flex-col relative selection:bg-green-200">
      {/* Background Gradients - Adjusted for mobile to prevent overflow */}
      <div className="fixed top-[-20%] left-[-10%] w-[80%] h-[60%] bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob pointer-events-none"></div>
      <div className="fixed top-[-20%] right-[-10%] w-[80%] h-[60%] bg-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000 pointer-events-none"></div>
      <div className="fixed bottom-[-20%] left-[20%] w-[80%] h-[60%] bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000 pointer-events-none"></div>

      {/* Navbar */}
      <nav className="relative z-10 flex justify-between items-center p-6 md:px-12">
        <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
          <BarChart2 className="w-6 h-6 text-[#1DB954]" />
          <span>Statstify</span>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 flex-1 flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-20 px-6 md:px-12 max-w-7xl mx-auto w-full py-10 lg:py-0">
        {/* Left Content */}
        <div className="flex-1 text-center lg:text-left space-y-6 md:space-y-8 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/50 border border-white/60 backdrop-blur-sm text-[10px] md:text-xs font-semibold uppercase tracking-wider shadow-sm">
            <Sparkles className="w-3 h-3 text-[#1DB954]" />
            <span>Now with Audio Analytics</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold leading-[0.95] tracking-tighter text-gray-900">
            Your music stats,
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1DB954] to-[#1ed760]">
              printed fresh.
            </span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-gray-600 leading-relaxed max-w-md mx-auto lg:mx-0">
            Transform your Spotify history into aesthetic receipts and detailed
            data reports.
          </p>

          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <button
                onClick={handleLogin}
                disabled={isLoggingIn}
                className="px-8 py-4 bg-[#1DB954] text-white rounded-full font-bold text-base md:text-lg hover:bg-[#1ed760] hover:scale-105 transition-all shadow-xl flex items-center justify-center gap-3 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed group w-full sm:w-auto"
              >
                {isLoggingIn ? "Connecting..." : "Log in with Spotify"}
                {!isLoggingIn && (
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                )}
              </button>
            </div>
          </div>

          <p className="text-[10px] text-gray-400">
            *Requires a Spotify account. Uses PKCE Secure Flow.
          </p>
        </div>

        {/* Right Visuals (3D Receipts)s */}
        <div className="flex-1 w-full flex items-center justify-center relative perspective-2000 py-10">
          {/* Floating Elements */}
          <div className="relative transform-style-3d rotate-y-[-12deg] rotate-x-[5deg] hover:rotate-y-[-5deg] hover:rotate-x-[0deg] transition-transform duration-700 ease-out cursor-default">
            {/* Background Receipt (Faded) */}
            <div className="absolute top-4 -right-8 md:-right-12 transform translate-z-[-50px] rotate-6 opacity-60 pointer-events-none blur-[1px]">
              <StatsContainer
                userData={{ ...mockLandingData, username: "ALT_EGO" }}
                config={{
                  theme: "dark",
                  texture: "crumpled",
                  timeRange: "medium_term",
                  showBarcode: true,
                  length: 15,
                  showAlbumArt: false,
                  view: "stats",
                }}
              />
            </div>

            {/* Main Receipt */}
            <div className="relative transform translate-z-[20px]">
              <ReceiptContainer
                userData={mockLandingData}
                config={{
                  theme: "classic",
                  texture: "clean",
                  timeRange: "short_term",
                  showBarcode: true,
                  length: 10,
                  showAlbumArt: false,
                  view: "receipt",
                }}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;

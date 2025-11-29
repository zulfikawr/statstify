import React, { useState, useEffect, useRef } from "react";
import * as htmlToImage from "html-to-image";
import ReceiptContainer from "./components/ReceiptContainer";
import Controls from "./components/Controls";
import CallbackPage from "./pages/CallbackPage";
import { ReceiptConfig, UserData } from "./types";
import { MOCK_TRACKS } from "./constants";
import { generateAnalysis } from "./services/geminiService";
import {
  redirectToSpotifyLogin,
  fetchSpotifyProfile,
  fetchTopTracks,
} from "./services/spotifyService";
import { Music, ArrowRight, Sparkles } from "lucide-react";

const App: React.FC = () => {
  // Routing State
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  // Auth State
  const [token, setToken] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // App State
  const receiptRef = useRef<HTMLDivElement>(null);
  const [config, setConfig] = useState<ReceiptConfig>({
    theme: "classic",
    texture: "clean",
    timeRange: "short_term",
    showBarcode: true,
    length: 10,
    showAlbumArt: false,
    mode: "standard", // Default page
  });

  const [userData, setUserData] = useState<UserData | null>(null);

  // Cache for generated texts
  const [analysisResults, setAnalysisResults] = useState<{
    vibe: string | null;
    roast: string | null;
  }>({
    vibe: null,
    roast: null,
  });

  const [isGenerating, setIsGenerating] = useState(false);

  // Handle successful login from CallbackPage
  const handleAuthSuccess = async (accessToken: string) => {
    setToken(accessToken);
    // Clear URL and update route to home
    window.history.replaceState({}, document.title, "/");
    setCurrentPath("/");

    // Load initial data
    await loadData(accessToken, "short_term");
  };

  const handleAuthFailure = () => {
    alert("Authentication failed or was cancelled. Please try again.");
    window.history.replaceState({}, document.title, "/");
    setCurrentPath("/");
    setIsLoggingIn(false);
  };

  // Re-fetch when time range changes if logged in
  useEffect(() => {
    if (token && userData) {
      loadData(token, config.timeRange);
    }
  }, [config.timeRange]);

  // Effect to handle AI Generation when mode changes
  useEffect(() => {
    if (!userData) return;

    const checkAndGenerate = async () => {
      if (config.mode === "vibe" && !analysisResults.vibe) {
        await triggerAnalysis("vibe");
      } else if (config.mode === "roast" && !analysisResults.roast) {
        await triggerAnalysis("roast");
      }
    };
    checkAndGenerate();
  }, [config.mode, userData]);

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

      // Reset analysis on new data load
      setAnalysisResults({ vibe: null, roast: null });
    } catch (error) {
      console.error("Failed to load Spotify data", error);
      alert("Session expired or error occurred. Please log in again.");
      setToken(null);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogin = () => {
    setIsLoggingIn(true);
    redirectToSpotifyLogin();
  };

  const triggerAnalysis = async (type: "vibe" | "roast") => {
    if (!userData) return;
    setIsGenerating(true);

    const result = await generateAnalysis(
      userData.topTracks,
      userData.topArtists,
      type,
    );

    setAnalysisResults((prev) => ({
      ...prev,
      [type]: result,
    }));

    setIsGenerating(false);
  };

  const handleDownload = async () => {
    if (!receiptRef.current) return;
    try {
      const dataUrl = await htmlToImage.toPng(receiptRef.current, {
        cacheBust: true,
        pixelRatio: 2,
      });
      const link = document.createElement("a");
      link.download = `receiptify-${config.mode}-${Date.now()}.png`;
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
    topTracks: MOCK_TRACKS,
    topArtists: ["The Weeknd", "Taylor Swift", "SZA"],
    topGenres: ["Pop", "R&B"],
    totalMinutes: 1337,
    generatedAt: new Date(),
  };

  // ROUTER LOGIC
  if (currentPath === "/callback") {
    return (
      <CallbackPage
        onSuccess={handleAuthSuccess}
        onFailure={handleAuthFailure}
      />
    );
  }

  // LOGGED IN DASHBOARD
  if (token && userData) {
    return (
      <div className="min-h-screen bg-[#e5e7eb] flex flex-col md:flex-row md:items-start justify-center p-4 md:p-10 gap-8 overflow-x-hidden font-sans">
        {/* Left Column: The Receipt */}
        <div className="relative flex-shrink-0 perspective-1000 order-2 md:order-1 z-10 mb-20 md:mb-0 md:mt-4">
          <div className="transform transition-transform duration-500">
            <ReceiptContainer
              ref={receiptRef}
              userData={userData}
              config={config}
              analysisText={
                config.mode === "vibe"
                  ? analysisResults.vibe
                  : config.mode === "roast"
                    ? analysisResults.roast
                    : null
              }
              isGenerating={isGenerating}
            />
          </div>
        </div>

        {/* Right Column: Controls */}
        <div className="w-full max-w-sm order-1 md:order-2 flex flex-col gap-6 animate-fadeIn md:sticky md:top-10 md:mt-4">
          <div className="text-center md:text-left mb-2">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">
              Your Receipt
            </h2>
            <p className="text-gray-500">Customize, Vibe Check, and Share.</p>
          </div>

          <Controls
            config={config}
            setConfig={setConfig}
            onDownload={handleDownload}
          />

          <div className="text-center mt-4 space-y-2">
            <button
              onClick={() => {
                setToken(null);
                setUserData(null);
                window.location.href = "/";
              }}
              className="text-xs text-red-400 hover:text-red-600 underline decoration-dotted"
            >
              Log Out
            </button>
            <p className="text-[10px] text-gray-400 font-mono uppercase">
              Powered by Spotify API & Gemini
              <br />
            </p>
          </div>
        </div>
      </div>
    );
  }

  // LANDING PAGE
  return (
    <div className="min-h-screen bg-[#f3f4f6] text-gray-900 font-sans overflow-hidden flex flex-col relative selection:bg-green-200">
      {/* Background Gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
      <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-[-20%] left-[20%] w-[60%] h-[60%] bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>

      {/* Navbar */}
      <nav className="relative z-10 flex justify-between items-center p-6 md:px-12">
        <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
          <Music className="w-6 h-6 text-[#1DB954]" />
          <span>Receiptify AI</span>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 flex-1 flex flex-col lg:flex-row items-center justify-center gap-12 px-6 md:px-12 max-w-7xl mx-auto w-full">
        {/* Left Content */}
        <div className="flex-1 text-center lg:text-left space-y-8 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/50 border border-white/60 backdrop-blur-sm text-xs font-semibold uppercase tracking-wider shadow-sm">
            <Sparkles className="w-3 h-3 text-[#1DB954]" />
            <span>Now with Gemini AI</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold leading-[0.9] tracking-tighter text-gray-900">
            Your music taste,
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1DB954] to-[#1ed760]">
              served fresh.
            </span>
          </h1>

          <p className="text-lg md:text-xl text-gray-600 leading-relaxed">
            Transform your Spotify top tracks into a shareable receipt. Analyze
            your vibe check or get roasted by AI.
          </p>

          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <button
                onClick={handleLogin}
                disabled={isLoggingIn}
                className="px-8 py-4 bg-[#1DB954] text-white rounded-full font-bold text-lg hover:bg-[#1ed760] hover:scale-105 transition-all shadow-xl flex items-center justify-center gap-3 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed group"
              >
                {isLoggingIn ? "Connecting..." : "Log in with Spotify"}
                {!isLoggingIn && (
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                )}
              </button>
            </div>
          </div>

          <p className="text-xs text-gray-400">
            *Requires a Spotify account. Uses PKCE Secure Flow.
          </p>
        </div>

        {/* Right Visuals (3D Receipts) */}
        <div className="flex-1 w-full flex items-center justify-center relative perspective-2000 py-20 lg:py-10">
          {/* Floating Elements */}
          <div className="relative transform-style-3d rotate-y-[-12deg] rotate-x-[5deg] hover:rotate-y-[-5deg] hover:rotate-x-[0deg] transition-transform duration-700 ease-out cursor-default">
            {/* Background Receipt (Faded) */}
            <div className="absolute top-4 -right-12 transform translate-z-[-50px] rotate-6 opacity-60 pointer-events-none blur-[1px]">
              <ReceiptContainer
                userData={{ ...mockLandingData, username: "ALT_EGO" }}
                config={{
                  theme: "dark",
                  texture: "crumpled",
                  timeRange: "medium_term",
                  showBarcode: true,
                  length: 15,
                  showAlbumArt: false,
                  mode: "standard",
                }}
                analysisText={null}
                isGenerating={false}
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
                  mode: "vibe",
                }}
                analysisText="CERTIFIED MAINSTREAM BANGERZ. YOU LOVE THE HITS."
                isGenerating={false}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;

import React, { forwardRef } from "react";
import { UserData, ReceiptConfig, Track } from "../types";
import {
  THEME_STYLES,
  TEXTURE_STYLES,
  formatDuration,
  formatDate,
} from "../constants";
import Barcode from "./Barcode";
import {
  Music,
  Coffee,
  ShoppingBag,
  Terminal,
  Flame,
  Sparkles,
} from "lucide-react";

interface ReceiptContainerProps {
  userData: UserData;
  config: ReceiptConfig;
  analysisText: string | null;
  isGenerating: boolean;
}

const ReceiptContainer = forwardRef<HTMLDivElement, ReceiptContainerProps>(
  ({ userData, config, analysisText, isGenerating }, ref) => {
    const { theme, texture, length, showAlbumArt, mode } = config;

    const baseClasses =
      "relative w-[340px] min-h-[500px] p-6 mx-auto shadow-2xl transition-all duration-300 ease-in-out font-mono text-xs md:text-sm leading-tight tracking-tight select-none backface-hidden";
    const themeClasses = THEME_STYLES[theme];
    const textureClasses = TEXTURE_STYLES[texture];

    const isDark = theme === "dark" || theme === "cyber";

    // Slice tracks based on user preference
    const visibleTracks = userData.topTracks.slice(
      0,
      Math.max(1, Math.min(50, length)),
    );

    // Calculate "Total"
    const totalDurationMs = visibleTracks.reduce(
      (acc, curr) => acc + curr.duration_ms,
      0,
    );
    const totalHours = Math.floor(totalDurationMs / (1000 * 60 * 60));
    const totalMinutes = Math.floor(
      (totalDurationMs % (1000 * 60 * 60)) / (1000 * 60),
    );

    const LogoIcon =
      theme === "cyber"
        ? Terminal
        : theme === "sakura"
          ? Coffee
          : theme === "mint"
            ? ShoppingBag
            : Music;

    return (
      <>
        {/* SVG Filters for paper effects */}
        <svg className="absolute w-0 h-0 pointer-events-none">
          <defs>
            {/* Advanced Crumpled Paper Filter */}
            <filter id="crumple-paper" x="0%" y="0%" width="100%" height="100%">
              <feTurbulence
                type="turbulence"
                baseFrequency="0.02"
                numOctaves="5"
                result="noise"
                seed="5"
              />
              <feDiffuseLighting
                in="noise"
                lightingColor="#fff"
                surfaceScale="2"
                result="lighting"
              >
                <feDistantLight azimuth="45" elevation="60" />
              </feDiffuseLighting>
            </filter>
          </defs>
        </svg>

        <div
          ref={ref}
          className={`${baseClasses} ${themeClasses} ${textureClasses} group origin-top`}
          style={{
            filter:
              texture === "faded" ? "contrast(0.9) brightness(1.1)" : "none",
            backgroundColor:
              theme === "classic"
                ? "#fbfbfb"
                : theme === "mint"
                  ? "#e0f7fa"
                  : theme === "sakura"
                    ? "#fff0f5"
                    : theme === "dark"
                      ? "#1a1a1a"
                      : "#27272a",
          }}
        >
          {/* Crumpled Texture Overlay */}
          {texture === "crumpled" && (
            <div
              className="absolute inset-0 z-20 pointer-events-none opacity-50"
              style={{
                mixBlendMode: isDark ? "soft-light" : "multiply",
                filter: "url(#crumple-paper)",
              }}
            >
              <div className="w-full h-full bg-white/50" />
            </div>
          )}

          {/* Receipt Header */}
          <div className="flex flex-col items-center mb-6 text-center border-b-2 border-dashed border-current pb-4 relative z-10">
            <LogoIcon className="w-8 h-8 mb-2 opacity-80" />
            <h1 className="text-xl font-bold uppercase tracking-widest">
              Receiptify
            </h1>
            <p className="opacity-70 text-[10px] mt-1">MUSIC CONSUMPTION LOG</p>
            <div className="flex justify-between w-full mt-4 text-[10px] opacity-80">
              <span>{formatDate(userData.generatedAt)}</span>
              <span>
                {userData.generatedAt.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
            <div className="w-full text-left mt-1 text-[10px] opacity-80">
              ORDER #:{" "}
              {Math.floor(Math.random() * 10000)
                .toString()
                .padStart(4, "0")}
            </div>
          </div>

          {/* User Info */}
          <div className="mb-4 text-xs uppercase relative z-10">
            <p>CUSTOMER: {userData.username}</p>
            <p>PERIOD: {config.timeRange.replace("_", " ")}</p>
            <p>MODE: {mode}</p>
          </div>

          {/* Track List */}
          <div className="space-y-3 mb-6 relative z-10">
            <div className="flex justify-between border-b border-current pb-1 mb-2 opacity-60 text-[10px]">
              <span>QTY ITEM</span>
              <span>AMT</span>
            </div>

            {visibleTracks.map((track: Track, index) => (
              <div
                key={track.id}
                className="flex items-center text-xs md:text-sm"
              >
                {/* Number */}
                <span className="font-bold mr-3 tabular-nums text-xs opacity-70 w-5 flex-shrink-0">
                  {String(index + 1).padStart(2, "0")}
                </span>

                {/* Optional Album Art (Inline) */}
                {showAlbumArt && track.albumArt && (
                  <div className="mr-3 w-8 h-8 flex-shrink-0 overflow-hidden border border-current opacity-90 grayscale contrast-125">
                    <img
                      src={track.albumArt}
                      alt="cover"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Track Info */}
                <div className="flex-1 min-w-0 pr-2 leading-none">
                  <span className="font-bold uppercase truncate block mb-0.5">
                    {track.name}
                  </span>
                  <div className="text-[10px] opacity-70 uppercase truncate">
                    {track.artist}
                  </div>
                </div>

                {/* Duration */}
                <span className="text-xs opacity-80 flex-shrink-0">
                  {formatDuration(track.duration_ms)}
                </span>
              </div>
            ))}
          </div>

          {/* Divider */}
          <div className="border-t-2 border-dashed border-current my-4 opacity-50 relative z-10"></div>

          {/* Summary Stats */}
          <div className="space-y-1 text-xs uppercase relative z-10">
            <div className="flex justify-between">
              <span>ITEM COUNT</span>
              <span>{visibleTracks.length}</span>
            </div>
            <div className="flex justify-between">
              <span>TOP GENRE</span>
              <span className="truncate max-w-[150px]">
                {userData.topGenres[0] || "N/A"}
              </span>
            </div>
            <div className="flex justify-between font-bold text-base mt-2 pt-2 border-t border-current">
              <span>TOTAL</span>
              <span>
                {totalHours}H {totalMinutes}M
              </span>
            </div>
          </div>

          {/* AI Analysis Section (Conditional) */}
          {mode !== "standard" && (
            <div className="mt-6 pt-4 border-t-2 border-dashed border-current relative z-10">
              <div className="flex items-center justify-center gap-2 mb-2 opacity-80">
                {mode === "vibe" ? (
                  <Sparkles className="w-4 h-4" />
                ) : (
                  <Flame className="w-4 h-4" />
                )}
                <span className="font-bold uppercase">
                  {mode === "vibe" ? "VIBE CHECK" : "ROAST ME"}
                </span>
              </div>
              <div className="p-3 border border-current bg-current/5 text-center min-h-[80px] flex items-center justify-center">
                {isGenerating ? (
                  <span className="animate-pulse">PRINTING...</span>
                ) : (
                  <p className="text-xs font-medium uppercase leading-relaxed whitespace-pre-wrap">
                    {analysisText || "ERROR GENERATING MESSAGE"}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="mt-8 flex flex-col items-center text-center space-y-4 relative z-10">
            {config.showBarcode && (
              <Barcode
                className="w-full opacity-80"
                color={isDark ? "#fff" : "#000"}
              />
            )}

            <div className="text-[10px] uppercase opacity-70">
              <p>CARD: **** **** **** {userData.generatedAt.getFullYear()}</p>
              <p>
                AUTH CODE:{" "}
                {Math.random().toString(36).substring(7).toUpperCase()}
              </p>
              <p className="mt-2">THANK YOU FOR LISTENING!</p>
              <p>spotify.com</p>
            </div>
          </div>

          {/* Decorative jagged bottom (SVG) */}
          <div className="absolute -bottom-3 left-0 w-full h-4 overflow-hidden z-20">
            <svg
              viewBox="0 0 340 12"
              className="w-full h-full"
              preserveAspectRatio="none"
            >
              <path
                d="M0,0 L10,12 L20,0 L30,12 L40,0 L50,12 L60,0 L70,12 L80,0 L90,12 L100,0 L110,12 L120,0 L130,12 L140,0 L150,12 L160,0 L170,12 L180,0 L190,12 L200,0 L210,12 L220,0 L230,12 L240,0 L250,12 L260,0 L270,12 L280,0 L290,12 L300,0 L310,12 L320,0 L330,12 L340,0 V-10 H0 Z"
                fill={
                  theme === "dark"
                    ? "#1a1a1a"
                    : theme === "cyber"
                      ? "#18181b"
                      : theme === "mint"
                        ? "#e0f7fa"
                        : theme === "sakura"
                          ? "#fff0f5"
                          : "#fbfbfb"
                }
              />
            </svg>
          </div>
        </div>
      </>
    );
  },
);

ReceiptContainer.displayName = "ReceiptContainer";

export default ReceiptContainer;

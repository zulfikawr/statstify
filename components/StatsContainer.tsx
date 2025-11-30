import React, { forwardRef } from "react";
import { UserData, ReceiptConfig } from "../types";
import {
  THEME_STYLES,
  TEXTURE_STYLES,
  formatDate,
  formatDuration,
} from "../constants";
import Barcode from "./Barcode";
import {
  PieChart,
  TrendingUp,
  AlertTriangle,
  Clock,
  FastForward,
  Rewind,
  User,
  Users,
} from "lucide-react";

interface StatsContainerProps {
  userData: UserData;
  config: ReceiptConfig;
}

const StatsContainer = forwardRef<HTMLDivElement, StatsContainerProps>(
  ({ userData, config }, ref) => {
    const { theme, texture } = config;

    // CHANGED: w-[340px] -> w-full max-w-[340px] for responsiveness
    const baseClasses =
      "relative w-full max-w-[340px] min-h-[500px] p-6 mx-auto shadow-2xl transition-all duration-300 ease-in-out font-mono text-xs md:text-sm leading-tight tracking-tight select-none backface-hidden";
    const themeClasses = THEME_STYLES[theme];
    const textureClasses = TEXTURE_STYLES[texture];

    const isDark = theme === "dark" || theme === "cyber";
    const { stats, genreCounts, decadeCounts, artistCounts } = userData;

    // Sort genres
    const sortedGenres = Object.entries(genreCounts || {})
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .slice(0, 5);

    // Sort Artists
    const sortedArtists = Object.entries(artistCounts || {})
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .slice(0, 5);

    // Sort Decades
    const sortedDecades = Object.entries(decadeCounts || {}).sort(([a], [b]) =>
      a.localeCompare(b),
    );

    const maxGenreCount = Math.max(
      ...sortedGenres.map(([, c]) => c as number),
      1,
    );
    const maxArtistCount = Math.max(
      ...sortedArtists.map(([, c]) => c as number),
      1,
    );
    const totalTracks = stats.trackCount || 1;

    // Determine listener type based on Variety Score
    const varietyPercent = Math.round(stats.varietyScore * 100);
    const listenerType =
      varietyPercent > 80
        ? "EXPLORER"
        : varietyPercent > 50
          ? "BALANCED"
          : "LOYALIST";

    return (
      <>
        <svg className="absolute w-0 h-0 pointer-events-none">
          <defs>
            <filter
              id="crumple-paper-stats"
              x="0%"
              y="0%"
              width="100%"
              height="100%"
            >
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
          {texture === "crumpled" && (
            <div
              className="absolute inset-0 z-20 pointer-events-none opacity-50"
              style={{
                mixBlendMode: isDark ? "soft-light" : "multiply",
                filter: "url(#crumple-paper-stats)",
              }}
            >
              <div className="w-full h-full bg-white/50" />
            </div>
          )}

          {/* Header */}
          <div className="flex flex-col items-center mb-6 text-center border-b-2 border-dashed border-current pb-4 relative z-10">
            <PieChart className="w-8 h-8 mb-2 opacity-80" />
            <h1 className="text-xl font-bold uppercase tracking-widest">
              STATSTIFY
            </h1>
            <p className="opacity-70 text-[10px] mt-1">ANALYTICS REPORT</p>
            <div className="w-full flex justify-between mt-3 text-[10px] opacity-80">
              <span>ID: {userData.username}</span>
              <span>{formatDate(userData.generatedAt)}</span>
            </div>
          </div>

          <div className="relative z-10 space-y-6">
            {/* 1. Artist Dominance Chart */}
            <div>
              <h3 className="text-center font-bold uppercase mb-3 border border-current py-1 text-xs">
                ARTIST ROTATION
              </h3>
              <div className="space-y-2">
                {sortedArtists.map(([artist, count], i) => (
                  <div
                    key={artist}
                    className="flex items-center text-[10px] uppercase"
                  >
                    <span className="w-4 opacity-50 font-bold">{i + 1}.</span>
                    <div className="flex-1">
                      <div className="flex justify-between mb-0.5">
                        <span className="truncate max-w-[140px] font-bold">
                          {artist}
                        </span>
                        <span className="opacity-60">{count} trks</span>
                      </div>
                      <div className="w-full h-2 bg-current/10 relative">
                        <div
                          className="absolute top-0 left-0 h-full bg-current opacity-80"
                          style={{
                            width: `${((count as number) / maxArtistCount) * 100}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
                {sortedArtists.length === 0 && (
                  <p className="text-center opacity-50 text-[10px]">
                    No artist data
                  </p>
                )}
              </div>
            </div>

            {/* 2. Variety Meter & Mainstream */}
            <div className="grid grid-cols-2 gap-4 border-t border-dashed border-current pt-4">
              {/* Mainstream Score */}
              <div>
                <div className="flex justify-between text-[9px] uppercase font-bold mb-1 opacity-80">
                  <span>Mainstream</span>
                  <span>{Math.round(stats.avgPopularity)}%</span>
                </div>
                <div className="w-full h-2 bg-current/10 border border-current relative">
                  <div
                    className="h-full bg-current absolute left-0 top-0"
                    style={{ width: `${stats.avgPopularity}%` }}
                  />
                </div>
              </div>

              {/* Variety Score */}
              <div>
                <div className="flex justify-between text-[9px] uppercase font-bold mb-1 opacity-80">
                  <span>Variety</span>
                  <span>{listenerType}</span>
                </div>
                <div className="w-full h-2 bg-current/10 border border-current relative">
                  <div
                    className="h-full bg-current absolute left-0 top-0"
                    style={{ width: `${varietyPercent}%` }}
                  />
                </div>
              </div>
            </div>

            {/* 3. Time Extremes */}
            <div className="border-t border-dashed border-current pt-4">
              <h3 className="text-center font-bold uppercase mb-3 border border-current py-1 text-xs">
                TIME EXTREMES
              </h3>

              <div className="space-y-3">
                {/* Shortest */}
                <div className="flex items-center gap-3">
                  <div className="p-1.5 border border-current opacity-70">
                    <Rewind className="w-3 h-3" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between text-[10px] uppercase font-bold">
                      <span className="truncate">SHORTEST LOOP</span>
                      <span>
                        {stats.shortestTrack
                          ? formatDuration(stats.shortestTrack.duration_ms)
                          : "--:--"}
                      </span>
                    </div>
                    <div className="text-[9px] opacity-70 truncate uppercase">
                      {stats.shortestTrack
                        ? `${stats.shortestTrack.name} - ${stats.shortestTrack.artist}`
                        : "N/A"}
                    </div>
                  </div>
                </div>

                {/* Longest */}
                <div className="flex items-center gap-3">
                  <div className="p-1.5 border border-current opacity-70">
                    <FastForward className="w-3 h-3" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between text-[10px] uppercase font-bold">
                      <span className="truncate">LONGEST JOURNEY</span>
                      <span>
                        {stats.longestTrack
                          ? formatDuration(stats.longestTrack.duration_ms)
                          : "--:--"}
                      </span>
                    </div>
                    <div className="text-[9px] opacity-70 truncate uppercase">
                      {stats.longestTrack
                        ? `${stats.longestTrack.name} - ${stats.longestTrack.artist}`
                        : "N/A"}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 4. Top Genres & Explicit */}
            <div className="border-t border-dashed border-current pt-4">
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <h3 className="font-bold uppercase mb-2 text-[10px]">
                    TOP GENRES
                  </h3>
                  <div className="space-y-1">
                    {sortedGenres.slice(0, 3).map(([genre, count]) => (
                      <div
                        key={genre}
                        className="flex justify-between text-[9px] uppercase"
                      >
                        <span className="opacity-80 truncate pr-2">
                          {genre}
                        </span>
                        <span className="opacity-60 tabular-nums">
                          {(((count as number) / totalTracks) * 100).toFixed(0)}
                          %
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="w-[1px] bg-current opacity-30 h-16"></div>
                <div className="flex-1">
                  <h3 className="font-bold uppercase mb-2 text-[10px]">
                    CONTENT
                  </h3>
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle className="w-3 h-3 opacity-70" />
                    <span className="text-[9px] uppercase">
                      Explicit: {stats.explicitCount}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3 h-3 opacity-70" />
                    <span className="text-[9px] uppercase">
                      Avg: {formatDuration(stats.avgDuration)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 5. Decades Graph */}
            {sortedDecades.length > 0 && (
              <div className="border-t border-dashed border-current pt-4">
                <h3 className="text-center font-bold uppercase mb-3 border border-current py-1 text-xs">
                  ERA BREAKDOWN
                </h3>
                <div className="grid grid-cols-3 gap-2 text-center">
                  {sortedDecades.map(([decade, count]) => (
                    <div key={decade} className="border border-current p-1">
                      <div className="text-xs font-bold">{decade}</div>
                      <div className="text-[10px] opacity-70">{count} trks</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 flex flex-col items-center text-center space-y-4 relative z-10">
            {config.showBarcode && (
              <Barcode
                className="w-full opacity-80"
                color={isDark ? "#fff" : "#000"}
              />
            )}
            <p className="text-[10px] uppercase opacity-70">STATSTIFY.COM</p>
          </div>

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

StatsContainer.displayName = "StatsContainer";

export default StatsContainer;

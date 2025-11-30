import React from "react";
import { ReceiptConfig, Theme, TimeRange, Texture } from "../types";
import {
  Download,
  Share2,
  Minus,
  Plus,
  Image as ImageIcon,
  FileText,
  BarChart2,
} from "lucide-react";

interface ControlsProps {
  config: ReceiptConfig;
  setConfig: React.Dispatch<React.SetStateAction<ReceiptConfig>>;
  onDownload: () => void;
}

const Controls: React.FC<ControlsProps> = ({
  config,
  setConfig,
  onDownload,
}) => {
  const themes: Theme[] = ["classic", "mint", "sakura", "dark", "cyber"];
  const textures: Texture[] = ["clean", "crumpled", "faded"];
  const ranges: { label: string; value: TimeRange }[] = [
    { label: "Last Month", value: "short_term" },
    { label: "6 Months", value: "medium_term" },
    { label: "All Time", value: "long_term" },
  ];

  const updateConfig = (key: keyof ReceiptConfig, value: any) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  const handleLengthChange = (delta: number) => {
    const newLength = Math.max(1, Math.min(50, config.length + delta));
    updateConfig("length", newLength);
  };

  // Ensure controls fit width of receipt on mobile but expand on desktop
  return (
    <div className="bg-white/80 backdrop-blur-md p-6 rounded-3xl shadow-xl w-full max-w-[340px] md:max-w-sm mx-auto space-y-6 border border-gray-100/50">
      {/* View Switcher: Receipt vs Stats */}
      <div className="flex bg-gray-100/80 p-1.5 rounded-xl mb-4">
        <button
          onClick={() => updateConfig("view", "receipt")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-bold rounded-lg transition-all ${
            config.view === "receipt"
              ? "bg-white text-black shadow-sm ring-1 ring-black/5"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <FileText className="w-3.5 h-3.5" /> Receipt
        </button>
        <button
          onClick={() => updateConfig("view", "stats")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-bold rounded-lg transition-all ${
            config.view === "stats"
              ? "bg-white text-black shadow-sm ring-1 ring-black/5"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <BarChart2 className="w-3.5 h-3.5" /> Analytics
        </button>
      </div>

      {/* Time Range */}
      <div>
        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-1">
          Time Period
        </label>
        <div className="flex bg-gray-100/80 p-1.5 rounded-xl">
          {ranges.map((range) => (
            <button
              key={range.value}
              onClick={() => updateConfig("timeRange", range.value)}
              className={`flex-1 py-2 text-[10px] sm:text-xs font-medium rounded-lg transition-all ${
                config.timeRange === range.value
                  ? "bg-white text-black shadow-sm ring-1 ring-black/5"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* Item Count & Options (Only for Receipt View) */}
      {config.view === "receipt" && (
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-1">
              Count
            </label>
            <div className="flex items-center justify-between bg-gray-100/80 rounded-xl p-1.5">
              <button
                onClick={() => handleLengthChange(-1)}
                className="w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-sm hover:bg-gray-50 active:scale-95 transition text-gray-700"
                aria-label="Decrease count"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="font-mono text-sm font-bold text-gray-800 w-8 text-center">
                {config.length}
              </span>
              <button
                onClick={() => handleLengthChange(1)}
                className="w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-sm hover:bg-gray-50 active:scale-95 transition text-gray-700"
                aria-label="Increase count"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          </div>

          <div className="flex-1">
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-1">
              Art
            </label>
            <button
              onClick={() => updateConfig("showAlbumArt", !config.showAlbumArt)}
              className={`w-full h-[44px] flex items-center justify-center gap-2 rounded-xl text-xs font-bold transition-all border shadow-sm active:scale-95 ${
                config.showAlbumArt
                  ? "bg-zinc-900 text-white border-zinc-900"
                  : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"
              }`}
            >
              <ImageIcon className="w-3 h-3" />
              {config.showAlbumArt ? "On" : "Off"}
            </button>
          </div>
        </div>
      )}

      {/* Theme Selection */}
      <div>
        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-1">
          Paper Theme
        </label>
        <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
          {themes.map((t) => (
            <button
              key={t}
              onClick={() => updateConfig("theme", t)}
              className={`w-10 h-10 rounded-full border-2 transition-transform hover:scale-110 active:scale-90 ${
                config.theme === t
                  ? "border-zinc-900 scale-110"
                  : "border-transparent"
              }`}
              style={{
                backgroundColor:
                  t === "classic"
                    ? "#fbfbfb"
                    : t === "mint"
                      ? "#e0f7fa"
                      : t === "sakura"
                        ? "#fff0f5"
                        : t === "dark"
                          ? "#1a1a1a"
                          : "#27272a",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              }}
              aria-label={`Select ${t} theme`}
            />
          ))}
        </div>
      </div>

      {/* Texture Selection */}
      <div>
        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-1">
          Texture
        </label>
        <div className="grid grid-cols-3 gap-2">
          {textures.map((t) => (
            <button
              key={t}
              onClick={() => updateConfig("texture", t)}
              className={`py-2.5 text-[10px] sm:text-xs border rounded-lg uppercase tracking-wide transition-colors active:scale-95 ${
                config.texture === t
                  ? "border-zinc-900 bg-zinc-50 text-black font-bold"
                  : "border-gray-200 text-gray-500 hover:bg-gray-50 bg-white"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="pt-2 space-y-3">
        <div className="flex gap-3">
          <button
            onClick={onDownload}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-zinc-900 text-white rounded-xl font-bold hover:bg-zinc-800 transition-colors active:scale-95 shadow-lg shadow-zinc-200"
          >
            <Download className="w-4 h-4" />
            Save Image
          </button>
          <button
            className="px-4 py-3.5 bg-white border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors active:scale-95"
            title="Share (Demo)"
            onClick={() =>
              alert("Sharing feature mocked! Image copied to clipboard.")
            }
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Controls;

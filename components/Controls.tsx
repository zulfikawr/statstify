import React from "react";
import {
  ReceiptConfig,
  Theme,
  TimeRange,
  Texture,
  ReceiptMode,
} from "../types";
import {
  Download,
  Share2,
  Minus,
  Plus,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  FileText,
  Sparkles,
  Flame,
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

  const modes: ReceiptMode[] = ["standard", "vibe", "roast"];
  const currentModeIndex = modes.indexOf(config.mode);

  const updateConfig = (key: keyof ReceiptConfig, value: any) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  const handleLengthChange = (delta: number) => {
    const newLength = Math.max(1, Math.min(50, config.length + delta));
    updateConfig("length", newLength);
  };

  const handlePageChange = (direction: number) => {
    const nextIndex = currentModeIndex + direction;
    if (nextIndex >= 0 && nextIndex < modes.length) {
      updateConfig("mode", modes[nextIndex]);
    }
  };

  const getModeLabel = (mode: ReceiptMode) => {
    switch (mode) {
      case "standard":
        return "Standard Receipt";
      case "vibe":
        return "Vibe Analysis";
      case "roast":
        return "Roast Me";
    }
  };

  const getModeIcon = (mode: ReceiptMode) => {
    switch (mode) {
      case "standard":
        return <FileText className="w-4 h-4" />;
      case "vibe":
        return <Sparkles className="w-4 h-4" />;
      case "roast":
        return <Flame className="w-4 h-4" />;
    }
  };

  return (
    <div className="bg-white p-6 rounded-3xl shadow-xl w-full max-w-sm mx-auto space-y-6 border border-gray-100">
      {/* Pagination / Receipt Mode */}
      <div className="bg-gray-900 rounded-2xl p-4 text-white">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold uppercase text-gray-400">
            Receipt Page
          </span>
          <span className="text-xs font-mono opacity-60">
            {currentModeIndex + 1} / 3
          </span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={() => handlePageChange(-1)}
            disabled={currentModeIndex === 0}
            className="p-2 rounded-full hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex flex-col items-center flex-1">
            <div className="flex items-center gap-2 font-bold mb-1">
              {getModeIcon(config.mode)}
              <span>{getModeLabel(config.mode)}</span>
            </div>
            <div className="flex gap-1.5">
              {modes.map((m, idx) => (
                <div
                  key={m}
                  className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${idx === currentModeIndex ? "bg-white scale-125" : "bg-white/30"}`}
                />
              ))}
            </div>
          </div>

          <button
            onClick={() => handlePageChange(1)}
            disabled={currentModeIndex === modes.length - 1}
            className="p-2 rounded-full hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Time Range */}
      <div>
        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
          Time Period
        </label>
        <div className="flex bg-gray-100 p-1 rounded-xl">
          {ranges.map((range) => (
            <button
              key={range.value}
              onClick={() => updateConfig("timeRange", range.value)}
              className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all ${
                config.timeRange === range.value
                  ? "bg-white text-black shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* Item Count & Options */}
      <div className="flex gap-4">
        {/* Count Stepper */}
        <div className="flex-1">
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
            Item Count
          </label>
          <div className="flex items-center justify-between bg-gray-100 rounded-xl p-1">
            <button
              onClick={() => handleLengthChange(-1)}
              className="w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-sm hover:bg-gray-50 active:scale-95 transition"
            >
              <Minus className="w-3 h-3 text-gray-600" />
            </button>
            <span className="font-mono text-sm font-bold text-gray-800 w-8 text-center">
              {config.length}
            </span>
            <button
              onClick={() => handleLengthChange(1)}
              className="w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-sm hover:bg-gray-50 active:scale-95 transition"
            >
              <Plus className="w-3 h-3 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Album Art Toggle */}
        <div className="flex-1">
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
            Options
          </label>
          <button
            onClick={() => updateConfig("showAlbumArt", !config.showAlbumArt)}
            className={`w-full h-[42px] flex items-center justify-center gap-2 rounded-xl text-xs font-bold transition-all border ${
              config.showAlbumArt
                ? "bg-black text-white border-black"
                : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"
            }`}
          >
            <ImageIcon className="w-3 h-3" />
            {config.showAlbumArt ? "Art On" : "Art Off"}
          </button>
        </div>
      </div>

      {/* Theme Selection */}
      <div>
        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
          Paper Theme
        </label>
        <div className="flex gap-3 justify-center">
          {themes.map((t) => (
            <button
              key={t}
              onClick={() => updateConfig("theme", t)}
              className={`w-10 h-10 rounded-full border-2 transition-transform hover:scale-110 ${
                config.theme === t
                  ? "border-black scale-110"
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
        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
          Paper Texture
        </label>
        <div className="flex bg-gray-100 p-1 rounded-xl">
          {textures.map((t) => (
            <button
              key={t}
              onClick={() => updateConfig("texture", t)}
              className={`flex-1 py-2 text-xs font-medium uppercase rounded-lg transition-all ${
                config.texture === t
                  ? "bg-white text-black shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="pt-4 space-y-3">
        <div className="flex gap-3">
          <button
            onClick={onDownload}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-black text-white rounded-xl font-bold hover:bg-gray-800 transition-colors active:scale-95"
          >
            <Download className="w-4 h-4" />
            Save Image
          </button>
          <button
            className="px-4 py-3 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-colors active:scale-95"
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

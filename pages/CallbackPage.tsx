import React, { useEffect, useRef } from "react";
import { exchangeCodeForToken } from "../services/spotifyService";
import { Loader2 } from "lucide-react";

interface CallbackPageProps {
  onSuccess: (token: string) => void;
  onFailure: () => void;
}

const CallbackPage: React.FC<CallbackPageProps> = ({
  onSuccess,
  onFailure,
}) => {
  const hasRun = useRef(false);

  useEffect(() => {
    // Prevent React 18 double-execution in Strict Mode
    if (hasRun.current) return;
    hasRun.current = true;

    const handleCallback = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");
      const error = params.get("error");

      if (error) {
        console.error("Spotify Auth Error:", error);
        onFailure();
        return;
      }

      if (code) {
        const accessToken = await exchangeCodeForToken(code);
        if (accessToken) {
          onSuccess(accessToken);
        } else {
          onFailure();
        }
      } else {
        // No code present, invalid callback
        onFailure();
      }
    };

    handleCallback();
  }, [onSuccess, onFailure]);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl flex flex-col items-center space-y-4 max-w-sm w-full text-center animate-in fade-in zoom-in duration-300">
        <div className="relative">
          <div className="absolute inset-0 bg-purple-200 rounded-full blur-xl opacity-50 animate-pulse"></div>
          <Loader2 className="w-12 h-12 text-black animate-spin relative z-10" />
        </div>

        <h2 className="text-xl font-bold tracking-tight">Authenticating...</h2>
        <p className="text-sm text-gray-500">
          Securing your connection with Spotify. <br />
          This should only take a moment.
        </p>

        <div className="w-full bg-gray-200 h-1 rounded-full overflow-hidden mt-4">
          <div className="h-full bg-black animate-progress origin-left w-full"></div>
        </div>
      </div>

      <style>{`
        @keyframes progress {
          0% { transform: scaleX(0); }
          50% { transform: scaleX(0.7); }
          100% { transform: scaleX(1); }
        }
        .animate-progress {
          animation: progress 2s ease-out infinite;
        }
      `}</style>
    </div>
  );
};

export default CallbackPage;

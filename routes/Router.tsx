import React, { useState, useEffect } from "react";
import App from "../App";
import CallbackPage from "../pages/CallbackPage";

interface RouterProps {
  onAuthSuccess?: (token: string) => void;
  onAuthFailure?: () => void;
}

const Router: React.FC<RouterProps> = ({ onAuthSuccess, onAuthFailure }) => {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Route to /callback
  if (currentPath === "/callback") {
    return (
      <CallbackPage
        onSuccess={(token) => {
          // Persist token so the App can pick it up after navigation
          try {
            window.localStorage.setItem("spotify_access_token", token);
          } catch (e) {
            // ignore storage errors
          }

          onAuthSuccess?.(token);

          // Navigate to home after successful auth
          window.history.replaceState({}, document.title, "/");
          setCurrentPath("/");
          // Ensure full navigation so SPA picks up stored token
          setTimeout(() => (window.location.href = "/"), 100);
        }}
        onFailure={() => {
          onAuthFailure?.();
          // Clear any lingering verifier/token
          try {
            window.localStorage.removeItem("spotify_access_token");
          } catch (e) {}

          // Navigate to home after auth failure
          window.history.replaceState({}, document.title, "/");
          setCurrentPath("/");
          setTimeout(() => (window.location.href = "/"), 100);
        }}
      />
    );
  }

  // Default route to App (covers "/" and other paths)
  return <App />;
};

export default Router;

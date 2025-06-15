import {
  useGoogleOneTapLogin,
  GoogleOAuthProvider,
  GoogleLogin,
  useGoogleLogin,
} from "@react-oauth/google";
import { useState, useEffect } from "react";
import { ShieldCheckIcon } from "@heroicons/react/24/outline";
import { useAuth } from "../hooks/useAuth";

// This will give you a proper OAuth access token for YouTube API

const YouTubeAuthButton: React.FC = () => {
  const { setAccessToken, accessToken, verifyChannelOwnership } = useAuth();
  useEffect(() => {
    if (accessToken) {
      console.log("Context token updated:", accessToken);
      verifyChannelOwnership();
    }
  }, [accessToken]);
  const login = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      if (setAccessToken) {
        setAccessToken(tokenResponse.access_token); // Store the token in your auth context or state
      }
    },
    onError: () => console.error("Login Failed"),
    scope: "https://www.googleapis.com/auth/youtube.readonly",
  });
  return (
    <div id="youtube-auth-container">
      <button
        onClick={() => login()}
        className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition duration-150 ease-in-out flex items-center text-lg"
      >
        <ShieldCheckIcon className="h-5 w-5 mr-2" />
        Verify Channel Now
      </button>
    </div>
  );
};

export default YouTubeAuthButton;

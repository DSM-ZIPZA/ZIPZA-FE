import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/shared/contexts/AuthContext";
import { BACKEND_URL } from "@/const";

export default function OAuthCallback() {
  const [, navigate] = useLocation();
  const { setAuthToken } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("access_token");
    const code = params.get("code");

    if (token) {
      setAuthToken(token);
      navigate("/");
      return;
    }

    if (code) {
      const state = params.get("state");
      const redirectUrl = new URL(`${BACKEND_URL}/oauth/callback`);
      redirectUrl.searchParams.set("code", code);
      if (state) redirectUrl.searchParams.set("state", state);
      window.location.href = redirectUrl.toString();
      return;
    }

    navigate("/");
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-gray-500 text-sm">로그인 처리 중...</p>
    </div>
  );
}

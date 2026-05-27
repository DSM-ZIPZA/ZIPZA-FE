import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/shared/contexts/AuthContext";
import { BACKEND_URL } from "@/const";

export default function OAuthCallback() {
  const [, navigate] = useLocation();
  const { setAuthToken } = useAuth();
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const error = params.get("error");
    const message = params.get("message") ?? params.get("error_description");
    const token = params.get("token") ?? params.get("access_token");
    const code = params.get("code");

    if (error || message) {
      setErrorMessage(message || error || "로그인에 실패했습니다.");
      return;
    }

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

  if (errorMessage) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 px-4 text-center">
        <p className="text-sm font-medium text-red-600">로그인에 실패했습니다.</p>
        <p className="max-w-md break-words text-sm text-gray-500">
          {errorMessage}
        </p>
        <button
          type="button"
          onClick={() => navigate("/")}
          className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white"
        >
          돌아가기
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-gray-500 text-sm">로그인 처리 중...</p>
    </div>
  );
}

export { COOKIE_NAME, ONE_YEAR_MS } from "@/shared/const";

export const BACKEND_URL = (
  (import.meta.env.VITE_BACKEND_URL as string | undefined) ??
  "http://localhost:8080"
).replace(/\/$/, "");

export const getLoginUrl = () =>
  `${BACKEND_URL}/oauth2/authorization/kakao`;

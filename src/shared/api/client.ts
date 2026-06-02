import { BACKEND_URL } from "@/const";

export const TOKEN_KEY = "zipza_access_token";
const API_BASE_URL = import.meta.env.DEV ? "" : BACKEND_URL;

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

interface ApiOptions extends RequestInit {
  auth?: boolean;
}

export async function apiRequest<T>(
  path: string,
  options: ApiOptions = {}
): Promise<T> {
  if (!API_BASE_URL && !import.meta.env.DEV) {
    throw new ApiError(0, "VITE_BACKEND_URL이 설정되지 않았습니다.");
  }

  const token = localStorage.getItem(TOKEN_KEY);
  const headers = new Headers(options.headers);
  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }
  if (options.auth !== false && token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
    credentials: options.credentials ?? "include",
  });

  if (response.status === 401) {
    localStorage.removeItem(TOKEN_KEY);
  }

  if (!response.ok) {
    const message = await response.text();
    throw new ApiError(response.status, message || response.statusText);
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

export function toManwon(valueWon: number | undefined | null): number {
  return Math.round((valueWon ?? 0) / 10000);
}

export function toWon(valueManwon: number | undefined | null): number {
  return Math.round((valueManwon ?? 0) * 10000);
}

export function m2ToPyeong(valueM2: number | undefined | null): number {
  return Math.round(((valueM2 ?? 0) / 3.3058) * 10) / 10;
}

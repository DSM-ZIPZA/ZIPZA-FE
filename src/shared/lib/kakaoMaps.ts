declare global {
  interface Window {
    kakao?: any;
  }
}

const KAKAO_APP_KEY = import.meta.env.VITE_KAKAO_APP_KEY;

let kakaoMapsLoadPromise: Promise<void> | null = null;

export interface KakaoLocationSuggestion {
  id: string;
  title: string;
  roadAddress: string;
  jibunAddress: string;
  latitude: number;
  longitude: number;
}

export function loadKakaoMapScript() {
  if (window.kakao?.maps?.services) return Promise.resolve();
  if (kakaoMapsLoadPromise) return kakaoMapsLoadPromise;

  kakaoMapsLoadPromise = new Promise<void>((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>(
      "script[data-zipza-kakao-map]"
    );

    const handleLoad = () => {
      window.kakao?.maps?.load(() => resolve());
    };

    if (existingScript) {
      existingScript.addEventListener("load", handleLoad, { once: true });
      existingScript.addEventListener(
        "error",
        () => reject(new Error("Kakao Map script load failed")),
        { once: true }
      );
      return;
    }

    if (!KAKAO_APP_KEY) {
      reject(new Error("VITE_KAKAO_APP_KEY is not configured"));
      return;
    }

    const script = document.createElement("script");
    script.dataset.zipzaKakaoMap = "true";
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_APP_KEY}&autoload=false&libraries=services`;
    script.async = true;
    script.onload = handleLoad;
    script.onerror = () => reject(new Error("Kakao Map script load failed"));
    document.head.appendChild(script);
  });

  return kakaoMapsLoadPromise;
}

export async function searchKakaoLocations(
  query: string,
  options: { size?: number } = {}
): Promise<KakaoLocationSuggestion[]> {
  const trimmedQuery = query.trim();
  if (!trimmedQuery) return [];

  await loadKakaoMapScript();
  if (!window.kakao?.maps?.services) return [];

  const size = options.size ?? 8;
  const places = new window.kakao.maps.services.Places();
  const geocoder = new window.kakao.maps.services.Geocoder();

  const [addressResults, keywordResults] = await Promise.all([
    new Promise<KakaoLocationSuggestion[]>(resolve => {
      geocoder.addressSearch(
        trimmedQuery,
        (data: any[], status: string) => {
          if (status !== window.kakao.maps.services.Status.OK) {
            resolve([]);
            return;
          }
          resolve(
            data
              .map(toAddressSuggestion)
              .filter(Boolean) as KakaoLocationSuggestion[]
          );
        },
        { size }
      );
    }),
    new Promise<KakaoLocationSuggestion[]>(resolve => {
      places.keywordSearch(
        trimmedQuery,
        (data: any[], status: string) => {
          if (status !== window.kakao.maps.services.Status.OK) {
            resolve([]);
            return;
          }
          resolve(
            data
              .map(toPlaceSuggestion)
              .filter(Boolean) as KakaoLocationSuggestion[]
          );
        },
        { size }
      );
    }),
  ]);

  return dedupeSuggestions([...addressResults, ...keywordResults]).slice(
    0,
    size
  );
}

function toAddressSuggestion(node: any): KakaoLocationSuggestion | null {
  const road = node.road_address;
  const address = node.address;
  const roadAddress = road?.address_name || "";
  const jibunAddress = address?.address_name || node.address_name || "";
  const latitude = Number(node.y || road?.y || address?.y);
  const longitude = Number(node.x || road?.x || address?.x);

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;

  const title =
    road?.building_name || roadAddress || jibunAddress || node.address_name;

  return {
    id: `address-${longitude}-${latitude}-${roadAddress || jibunAddress}`,
    title,
    roadAddress,
    jibunAddress,
    latitude,
    longitude,
  };
}

function toPlaceSuggestion(place: any): KakaoLocationSuggestion | null {
  const title = place.place_name || "";
  const roadAddress = place.road_address_name || "";
  const jibunAddress = place.address_name || "";
  const latitude = Number(place.y);
  const longitude = Number(place.x);

  if (!title || !Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return null;
  }

  return {
    id: place.id || `place-${longitude}-${latitude}-${title}`,
    title,
    roadAddress,
    jibunAddress,
    latitude,
    longitude,
  };
}

function dedupeSuggestions(
  suggestions: KakaoLocationSuggestion[]
): KakaoLocationSuggestion[] {
  const deduped = new Map<string, KakaoLocationSuggestion>();

  suggestions.forEach(suggestion => {
    const key = [
      suggestion.roadAddress || suggestion.jibunAddress || suggestion.title,
      suggestion.latitude.toFixed(6),
      suggestion.longitude.toFixed(6),
    ].join("|");
    if (!deduped.has(key)) deduped.set(key, suggestion);
  });

  return Array.from(deduped.values());
}

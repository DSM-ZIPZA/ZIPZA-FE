import { useEffect, useRef, useState } from "react";
import type { Property } from "@/shared/types";
import { usePersistFn } from "@/hooks/usePersistFn";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

declare global {
  interface Window {
    kakao?: any;
  }
}

const KAKAO_APP_KEY = import.meta.env.VITE_KAKAO_APP_KEY;

const SEOUL_CENTER = { lat: 37.5665, lng: 126.978 };
const DEFAULT_ZOOM = 5; // 카카오 level 5 = 동네 수준

function loadKakaoMapScript() {
  return new Promise<void>((resolve, reject) => {
    if (window.kakao?.maps) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_APP_KEY}&autoload=false`;
    script.async = true;
    script.onload = () => {
      window.kakao.maps.load(() => resolve());
    };
    script.onerror = () => {
      console.error("Failed to load Kakao Map script");
      reject(new Error("Kakao Map script load failed"));
    };
    document.head.appendChild(script);
  });
}

function getUserLocation(): Promise<{ lat: number; lng: number }> {
  return new Promise(resolve => {
    if (!navigator.geolocation) {
      resolve(SEOUL_CENTER);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      position => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      () => {
        // 거부하거나 실패하면 서울로 fallback
        resolve(SEOUL_CENTER);
      },
      { timeout: 5000 }
    );
  });
}

interface KakaoMapViewProps {
  center?: { lat: number; lng: number }; // optional로 변경
  zoom?: number; // optional로 변경
  properties: Property[];
  selectedPropertyId?: string;
  hoveredPropertyId?: string;
  onPropertySelect?: (property: Property) => void;
  className?: string;
}

export function KakaoMapView({
  center,
  zoom = DEFAULT_ZOOM,
  properties,
  selectedPropertyId,
  hoveredPropertyId,
  onPropertySelect,
  className,
}: KakaoMapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const markersRef = useRef<Map<string, any>>(new Map());
  const [resolvedCenter, setResolvedCenter] = useState<{
    lat: number;
    lng: number;
  } | null>(center ?? null);

  const initMap = usePersistFn(
    async (mapCenter: { lat: number; lng: number }) => {
      await loadKakaoMapScript();
      if (!mapContainer.current || !window.kakao?.maps) {
        console.error("Map container or Kakao Maps not found");
        return;
      }

      // 이미 초기화된 경우 스킵
      if (map.current) return;

      map.current = new window.kakao.maps.Map(mapContainer.current, {
        center: new window.kakao.maps.LatLng(mapCenter.lat, mapCenter.lng),
        level: zoom,
      });

      const zoomControl = new window.kakao.maps.ZoomControl();
      map.current.addControl(
        zoomControl,
        window.kakao.maps.ControlPosition.RIGHT
      );

      const mapTypeControl = new window.kakao.maps.MapTypeControl();
      map.current.addControl(
        mapTypeControl,
        window.kakao.maps.ControlPosition.TOPRIGHT
      );
    }
  );

  // 현재 위치 or 서울로 초기 중심 결정
  useEffect(() => {
    if (center) {
      // 부모에서 명시적으로 center를 줬으면 그걸 사용
      setResolvedCenter(center);
      return;
    }

    getUserLocation().then(loc => {
      setResolvedCenter(loc);
    });
  }, [center]);

  // resolvedCenter가 확정되면 지도 초기화
  useEffect(() => {
    if (!resolvedCenter) return;
    initMap(resolvedCenter);
  }, [resolvedCenter, initMap]);

  // 외부 center prop 변경 시 지도 이동
  useEffect(() => {
    if (map.current && window.kakao?.maps && resolvedCenter) {
      map.current.setCenter(
        new window.kakao.maps.LatLng(resolvedCenter.lat, resolvedCenter.lng)
      );
      map.current.setLevel(zoom);
    }
  }, [resolvedCenter, zoom]);

  // 마커 업데이트
  useEffect(() => {
    if (!map.current || !window.kakao?.maps) return;

    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current.clear();

    properties.forEach(property => {
      const marker = new window.kakao.maps.Marker({
        position: new window.kakao.maps.LatLng(
          property.latitude,
          property.longitude
        ),
        map: map.current,
        title: property.title,
      });

      window.kakao.maps.event.addListener(marker, "click", () => {
        onPropertySelect?.(property);
      });

      markersRef.current.set(property.id, marker);
    });
  }, [properties, selectedPropertyId, hoveredPropertyId, onPropertySelect]);

  return (
    <div
      ref={mapContainer}
      className={twMerge(clsx("w-full h-full bg-gray-100", className))}
    />
  );
}

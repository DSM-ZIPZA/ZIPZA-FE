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
const DEFAULT_ZOOM = 5;

const SELECTED_MARKER_IMG =
  "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png";

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
        resolve(SEOUL_CENTER);
      },
      { timeout: 5000 }
    );
  });
}

interface KakaoMapViewProps {
  center?: { lat: number; lng: number };
  zoom?: number;
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
  const [mapReady, setMapReady] = useState(false);

  const initMap = usePersistFn(
    async (mapCenter: { lat: number; lng: number }) => {
      await loadKakaoMapScript();
      if (!mapContainer.current || !window.kakao?.maps) {
        console.error("Map container or Kakao Maps not found");
        return;
      }

      if (map.current) return;

      map.current = new window.kakao.maps.Map(mapContainer.current, {
        center: new window.kakao.maps.LatLng(mapCenter.lat, mapCenter.lng),
        level: zoom,
      });

      map.current.addControl(
        new window.kakao.maps.ZoomControl(),
        window.kakao.maps.ControlPosition.RIGHT
      );
      map.current.addControl(
        new window.kakao.maps.MapTypeControl(),
        window.kakao.maps.ControlPosition.TOPRIGHT
      );

      setMapReady(true);
    }
  );

  useEffect(() => {
    if (center) {
      setResolvedCenter(center);
      return;
    }
    getUserLocation().then(loc => setResolvedCenter(loc));
  }, [center]);

  useEffect(() => {
    if (!resolvedCenter) return;
    initMap(resolvedCenter);
  }, [resolvedCenter, initMap]);

  useEffect(() => {
    if (!mapReady || !map.current || !window.kakao?.maps || !resolvedCenter)
      return;
    map.current.panTo(
      new window.kakao.maps.LatLng(resolvedCenter.lat, resolvedCenter.lng)
    );
  }, [resolvedCenter, zoom, mapReady]);

  useEffect(() => {
    if (!mapReady || !map.current || !window.kakao?.maps) return;

    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current.clear();

    properties.forEach(property => {
      const isSelected = property.id === selectedPropertyId;

      const markerImage = isSelected
        ? new window.kakao.maps.MarkerImage(
            SELECTED_MARKER_IMG,
            new window.kakao.maps.Size(24, 35)
          )
        : undefined;

      const marker = new window.kakao.maps.Marker({
        position: new window.kakao.maps.LatLng(
          property.latitude,
          property.longitude
        ),
        map: map.current,
        title: property.title,
        ...(markerImage ? { image: markerImage } : {}),
        zIndex: isSelected ? 10 : 1,
      });

      window.kakao.maps.event.addListener(marker, "click", () => {
        map.current.panTo(
          new window.kakao.maps.LatLng(property.latitude, property.longitude)
        );
        onPropertySelect?.(property);
      });

      markersRef.current.set(property.id, marker);
    });
  }, [
    mapReady,
    properties,
    selectedPropertyId,
    hoveredPropertyId,
    onPropertySelect,
  ]);

  return (
    <div
      ref={mapContainer}
      className={twMerge(clsx("w-full h-full bg-gray-100", className))}
    />
  );
}

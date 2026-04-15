import { useEffect, useRef } from "react";
import type { Property } from "@/shared/types";
import { formatPrice } from "@/shared/lib/format";
import { usePersistFn } from "@/hooks/usePersistFn";
import { cn } from "@/lib/utils";

declare global {
  interface Window {
    google?: typeof google;
  }
}

const API_KEY = import.meta.env.VITE_FRONTEND_FORGE_API_KEY;
const FORGE_BASE_URL =
  import.meta.env.VITE_FRONTEND_FORGE_API_URL ||
  "https://forge.butterfly-effect.dev";
const MAPS_PROXY_URL = `${FORGE_BASE_URL}/v1/maps/proxy`;

function loadMapScript() {
  return new Promise(resolve => {
    const script = document.createElement("script");
    script.src = `${MAPS_PROXY_URL}/maps/api/js?key=${API_KEY}&v=weekly&libraries=marker,places,geocoding,geometry`;
    script.async = true;
    script.crossOrigin = "anonymous";
    script.onload = () => {
      resolve(null);
      script.remove();
    };
    script.onerror = () => {
      console.error("Failed to load Google Maps script");
    };
    document.head.appendChild(script);
  });
}

interface PropertyMapViewProps {
  center: { lat: number; lng: number };
  zoom: number;
  properties: Property[];
  selectedPropertyId?: string;
  hoveredPropertyId?: string;
  onPropertySelect?: (property: Property) => void;
  className?: string;
}

export function PropertyMapView({
  center,
  zoom,
  properties,
  selectedPropertyId,
  hoveredPropertyId,
  onPropertySelect,
  className,
}: PropertyMapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<
    Map<string, google.maps.marker.AdvancedMarkerElement>
  >(new Map());

  const init = usePersistFn(async () => {
    await loadMapScript();
    if (!mapContainer.current) {
      console.error("Map container not found");
      return;
    }
    map.current = new window.google.maps.Map(mapContainer.current, {
      zoom,
      center,
      mapTypeControl: true,
      fullscreenControl: true,
      zoomControl: true,
      streetViewControl: false,
      mapId: "DEMO_MAP_ID",
    });
  });

  // 지도 초기화
  useEffect(() => {
    init();
  }, [init]);

  // 지도 중심 및 줌 업데이트
  useEffect(() => {
    if (map.current) {
      map.current.setCenter(center);
      map.current.setZoom(zoom);
    }
  }, [center, zoom]);

  // 마커 업데이트
  useEffect(() => {
    if (!map.current || !window.google) return;

    // 기존 마커 제거
    markersRef.current.forEach(marker => {
      marker.map = null;
    });
    markersRef.current.clear();

    // 새 마커 추가
    properties.forEach(property => {
      const isSelected = property.id === selectedPropertyId;
      const isHovered = property.id === hoveredPropertyId;

      // 마커 컨텐츠 생성
      const markerContent = document.createElement("div");
      markerContent.className = cn(
        "flex items-center justify-center px-3 py-1 rounded-full font-bold text-sm cursor-pointer transition-all",
        isSelected
          ? "bg-blue-600 text-white shadow-lg scale-110"
          : isHovered
            ? "bg-orange-500 text-white shadow-lg scale-105"
            : "bg-orange-500 text-white shadow-md"
      );
      markerContent.textContent = formatPrice(property.price);
      markerContent.style.whiteSpace = "nowrap";

      const marker = new window.google.maps.marker.AdvancedMarkerElement({
        map: map.current,
        position: { lat: property.latitude, lng: property.longitude },
        content: markerContent,
      });

      marker.addListener("click", () => {
        onPropertySelect?.(property);
      });

      markersRef.current.set(property.id, marker);
    });
  }, [properties, selectedPropertyId, hoveredPropertyId, onPropertySelect]);

  return <div ref={mapContainer} className={cn("w-full h-full", className)} />;
}

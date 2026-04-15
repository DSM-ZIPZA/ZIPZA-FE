import { useEffect, useRef } from 'react';
import type { Property } from '@shared/types';
import { formatPrice } from '@shared/lib/format';
import { usePersistFn } from '@/hooks/usePersistFn';
import { cn } from '@/lib/utils';

declare global {
  interface Window {
    naver?: any;
  }
}

const NAVER_CLIENT_ID = import.meta.env.VITE_NAVER_CLIENT_ID || 'YOUR_NAVER_CLIENT_ID';

function loadNaverMapScript() {
  return new Promise((resolve) => {
    if (window.naver?.maps) {
      resolve(null);
      return;
    }

    const script = document.createElement('script');
    script.src = `https://openapi.map.naver.com/openapi/v3/maps.js?ncpClientId=${NAVER_CLIENT_ID}`;
    script.async = true;
    script.onload = () => {
      resolve(null);
    };
    script.onerror = () => {
      console.error('Failed to load Naver Map script');
    };
    document.head.appendChild(script);
  });
}

interface NaverMapViewProps {
  center: { lat: number; lng: number };
  zoom: number;
  properties: Property[];
  selectedPropertyId?: string;
  hoveredPropertyId?: string;
  onPropertySelect?: (property: Property) => void;
  className?: string;
}

export function NaverMapView({
  center,
  zoom,
  properties,
  selectedPropertyId,
  hoveredPropertyId,
  onPropertySelect,
  className,
}: NaverMapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const markersRef = useRef<Map<string, any>>(new Map());

  const init = usePersistFn(async () => {
    await loadNaverMapScript();
    if (!mapContainer.current || !window.naver?.maps) {
      console.error('Map container or Naver Maps not found');
      return;
    }

    map.current = new window.naver.maps.Map(mapContainer.current, {
      center: new window.naver.maps.LatLng(center.lat, center.lng),
      zoom,
      mapTypeControl: true,
      zoomControl: true,
      scaleControl: true,
    });
  });

  // 지도 초기화
  useEffect(() => {
    init();
  }, [init]);

  // 지도 중심 및 줌 업데이트
  useEffect(() => {
    if (map.current && window.naver?.maps) {
      map.current.setCenter(new window.naver.maps.LatLng(center.lat, center.lng));
      map.current.setZoom(zoom);
    }
  }, [center, zoom]);

  // 마커 업데이트
  useEffect(() => {
    if (!map.current || !window.naver?.maps) return;

    // 기존 마커 제거
    markersRef.current.forEach((marker) => {
      marker.setMap(null);
    });
    markersRef.current.clear();

    // 새 마커 추가
    properties.forEach((property) => {
      const isSelected = property.id === selectedPropertyId;
      const isHovered = property.id === hoveredPropertyId;

      // 마커 생성
      const marker = new window.naver.maps.Marker({
        position: new window.naver.maps.LatLng(property.latitude, property.longitude),
        map: map.current,
        title: property.title,
      });

      // 마커 클릭 이벤트
      window.naver.maps.Event.addListener(marker, 'click', () => {
        onPropertySelect?.(property);
      });

      markersRef.current.set(property.id, marker);
    });
  }, [properties, selectedPropertyId, hoveredPropertyId, onPropertySelect]);

  return (
    <div ref={mapContainer} className={cn('w-full h-full bg-gray-100', className)} />
  );
}

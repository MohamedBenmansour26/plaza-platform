'use client';

import { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

type Props = {
  lat: number | null;
  lng: number | null;
  onLocationChange: (lat: number, lng: number) => void;
};

export default function MapboxMap({ lat, lng, onLocationChange }: Props) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);
  const initializedRef = useRef(false);
  const [locating, setLocating] = useState(false);

  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  const handleLocate = () => {
    if (!navigator.geolocation || !mapRef.current) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: posLat, longitude: posLng } = pos.coords;
        mapRef.current?.flyTo({ center: [posLng, posLat], zoom: 15, duration: 1000 });
        if (markerRef.current) {
          markerRef.current.setLngLat([posLng, posLat]);
        } else {
          markerRef.current = new mapboxgl.Marker({ color: '#E8632A' })
            .setLngLat([posLng, posLat])
            .addTo(mapRef.current!);
        }
        onLocationChange(posLat, posLng);
        setLocating(false);
      },
      () => setLocating(false),
      { timeout: 8000 },
    );
  };

  useEffect(() => {
    if (!token) return;
    if (!mapContainerRef.current) return;
    if (mapRef.current) return; // already initialized

    mapboxgl.accessToken = token;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [lng ?? -6.8, lat ?? 31.5] as [number, number],
      zoom: lat && lng ? 13 : 4.5,
    });

    mapRef.current = map;

    if (!initializedRef.current) {
      initializedRef.current = true;
      if (!(lat && lng)) {
        map.fitBounds(
          [[-17.5, 20.77], [-1.0, 35.92]] as [[number, number], [number, number]],
          { padding: 40, duration: 0 },
        );
      }
    }

    if (lat !== null && lng !== null) {
      const marker = new mapboxgl.Marker({ color: '#E8632A' })
        .setLngLat([lng, lat])
        .addTo(map);
      markerRef.current = marker;
    }

    map.on('click', (e: mapboxgl.MapMouseEvent) => {
      const { lat: clickLat, lng: clickLng } = e.lngLat;

      if (markerRef.current) {
        markerRef.current.setLngLat([clickLng, clickLat]);
      } else {
        const newMarker = new mapboxgl.Marker({ color: '#E8632A' })
          .setLngLat([clickLng, clickLat])
          .addTo(map);
        markerRef.current = newMarker;
      }

      onLocationChange(clickLat, clickLng);
    });

    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  if (!token) {
    return (
      <div className="space-y-2">
        <p className="text-xs text-[#78716C] bg-[#FFF7ED] border border-[#FDE68A] rounded-lg p-2">
          Token Mapbox non configuré. Saisie manuelle :
        </p>
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="block text-xs text-[#78716C] mb-1">Latitude</label>
            <input
              type="number"
              step="any"
              placeholder="31.6295"
              defaultValue={lat ?? ''}
              onChange={(e) => {
                const newLat = parseFloat(e.target.value);
                if (!isNaN(newLat)) onLocationChange(newLat, lng ?? 0);
              }}
              className="w-full h-9 px-2 border border-[#E2E8F0] rounded-lg text-sm focus:outline-none focus:border-[#2563EB]"
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs text-[#78716C] mb-1">Longitude</label>
            <input
              type="number"
              step="any"
              placeholder="-7.9811"
              defaultValue={lng ?? ''}
              onChange={(e) => {
                const newLng = parseFloat(e.target.value);
                if (!isNaN(newLng)) onLocationChange(lat ?? 0, newLng);
              }}
              className="w-full h-9 px-2 border border-[#E2E8F0] rounded-lg text-sm focus:outline-none focus:border-[#2563EB]"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div
        ref={mapContainerRef}
        suppressHydrationWarning
        className="w-full h-[260px] rounded-lg border border-[#E2E8F0] overflow-hidden"
      />
      <button
        type="button"
        onClick={handleLocate}
        disabled={locating}
        className="absolute top-2 right-2 z-10 bg-white rounded-lg shadow-md p-2 hover:bg-stone-50 disabled:opacity-60"
        title="Ma position"
      >
        {locating ? (
          <div className="w-5 h-5 border-2 border-stone-400 border-t-transparent rounded-full animate-spin" />
        ) : (
          <svg viewBox="0 0 24 24" className="w-5 h-5 text-[#2563EB]" fill="none" stroke="currentColor" strokeWidth={2}>
            <circle cx="12" cy="12" r="3"/>
            <path d="M12 2v3m0 14v3M2 12h3m14 0h3"/>
          </svg>
        )}
      </button>
    </div>
  );
}

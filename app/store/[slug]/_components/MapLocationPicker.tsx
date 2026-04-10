'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

interface Props {
  onLocationSelect: (lat: number, lng: number, cityGuess: string) => void;
}

export function MapLocationPicker({ onLocationSelect }: Props) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);
  const [picked, setPicked] = useState(false);
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? '';

  const handleSelect = useCallback(onLocationSelect, [onLocationSelect]);

  useEffect(() => {
    if (!mapContainer.current || mapRef.current || !token) return;
    mapboxgl.accessToken = token;
    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [-7.09, 31.79],
      zoom: 5.5,
    });
    mapRef.current = map;

    map.on('click', async (e) => {
      const { lng, lat } = e.lngLat;
      if (markerRef.current) {
        markerRef.current.setLngLat([lng, lat]);
      } else {
        markerRef.current = new mapboxgl.Marker({ color: '#2563EB' })
          .setLngLat([lng, lat])
          .addTo(map);
      }
      setPicked(true);
      try {
        const res = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?types=place&language=fr&access_token=${token}`
        );
        const data = await res.json() as { features?: Array<{ text?: string }> };
        handleSelect(lat, lng, data.features?.[0]?.text ?? '');
      } catch {
        handleSelect(lat, lng, '');
      }
    });

    return () => { map.remove(); mapRef.current = null; };
  }, [token, handleSelect]);

  if (!token) {
    return (
      <div className="w-full h-[260px] rounded-xl bg-[#F5F5F4] flex items-center justify-center border border-[#E2E8F0]">
        <p className="text-[13px] text-[#78716C]">Carte non disponible</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div ref={mapContainer} className="w-full h-[260px] rounded-xl overflow-hidden border border-[#E2E8F0]" />
      <p className={`text-[13px] text-center ${picked ? 'text-[#16A34A] font-medium' : 'text-[#78716C]'}`}>
        {picked ? 'Position sélectionnée ✓' : 'Appuyez sur la carte pour indiquer votre position'}
      </p>
    </div>
  );
}

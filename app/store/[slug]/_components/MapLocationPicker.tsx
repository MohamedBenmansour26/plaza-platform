'use client';

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { applyMoroccoMapStyle } from '@/lib/mapbox-utils';

interface Props {
  onLocationSelect: (lat: number, lng: number, cityGuess: string) => void;
}

export function MapLocationPicker({ onLocationSelect }: Props) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);
  const onLocationSelectRef = useRef(onLocationSelect);
  const [picked, setPicked] = useState(false);
  const [locating, setLocating] = useState(false);
  const [mapError, setMapError] = useState(false);
  const [textAddress, setTextAddress] = useState('');
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? '';

  // Keep ref up-to-date without triggering effect
  onLocationSelectRef.current = onLocationSelect;

  const handleLocate = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!navigator.geolocation || !mapRef.current) return;
    setLocating(true);
    try {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude: lat, longitude: lng } = pos.coords;
          mapRef.current?.flyTo({ center: [lng, lat], zoom: 15, duration: 1000 });
          if (markerRef.current) {
            markerRef.current.setLngLat([lng, lat]);
          } else {
            markerRef.current = new mapboxgl.Marker({ color: '#E8632A' })
              .setLngLat([lng, lat])
              .addTo(mapRef.current!);
          }
          setPicked(true);
          try {
            const res = await fetch(
              `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?types=place&language=fr&access_token=${token}`
            );
            const data = await res.json() as { features?: Array<{ text?: string }> };
            onLocationSelectRef.current(lat, lng, data.features?.[0]?.text ?? '');
          } catch {
            onLocationSelectRef.current(lat, lng, '');
          }
          setLocating(false);
        },
        (err) => {
          console.warn('Geolocation denied:', err);
          setLocating(false);
          // Do NOT navigate anywhere on error
        },
        { timeout: 10000 },
      );
    } catch {
      setLocating(false);
    }
  };

  useEffect(() => {
    if (!mapContainer.current || mapRef.current || !token) return;
    mapboxgl.accessToken = token;
    let map: mapboxgl.Map;
    try {
      map = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [-6.0, 31.5] as [number, number],
        zoom: 5,
      });
    } catch {
      setMapError(true);
      return;
    }
    mapRef.current = map;

    map.on('error', () => {
      setMapError(true);
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    });

    map.on('load', () => {
      map.jumpTo({ center: [-6.0, 31.5], zoom: 5 });
      applyMoroccoMapStyle(map);
    });

    map.getCanvas().style.cursor = 'crosshair';

    map.on('click', async (e) => {
      const { lng, lat } = e.lngLat;
      if (markerRef.current) {
        markerRef.current.setLngLat([lng, lat]);
      } else {
        markerRef.current = new mapboxgl.Marker({ color: '#E8632A' })
          .setLngLat([lng, lat])
          .addTo(map);
      }
      setPicked(true);
      try {
        const res = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?types=place&language=fr&access_token=${token}`
        );
        const data = await res.json() as { features?: Array<{ text?: string }> };
        onLocationSelectRef.current(lat, lng, data.features?.[0]?.text ?? '');
      } catch {
        onLocationSelectRef.current(lat, lng, '');
      }
    });

    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, [token]); // ONLY token — never re-initialize when parent re-renders

  // Text-address fallback: shown when token is missing OR map failed to load
  if (!token || mapError) {
    return (
      <div className="space-y-3">
        <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          <svg className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <p className="text-xs text-amber-700">
            La carte interactive n&apos;est pas disponible. Veuillez saisir votre adresse manuellement.
          </p>
        </div>
        <div>
          <label className="block text-[14px] font-medium text-[#1C1917] mb-1.5">
            Adresse complète <span className="text-[#DC2626] ml-0.5">*</span>
          </label>
          <input
            type="text"
            value={textAddress}
            onChange={(e) => {
              setTextAddress(e.target.value);
              // Signal a valid text address by using sentinel coords (0, 0) and passing the
              // address via cityGuess so commande/page.tsx can store it as delivery_notes.
              // Actual lat/lng will be null — the checkout page handles text-only fallback.
              if (e.target.value.trim()) {
                onLocationSelectRef.current(0, 0, e.target.value.trim());
              }
            }}
            placeholder="Ex : 12 rue Mohamed V, Casablanca"
            className="w-full px-3 py-2.5 border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-[15px]"
            data-testid="customer-checkout-address-input"
          />
        </div>
        {textAddress.trim() && (
          <p className="text-[13px] text-[#16A34A] font-medium">Adresse saisie ✓</p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="relative">
        <div ref={mapContainer} className="w-full h-[260px] rounded-xl overflow-hidden border border-[#E2E8F0]" />
        <button
          type="button"
          onClick={handleLocate}
          disabled={locating}
          className="absolute top-3 right-3 z-10 bg-white rounded-lg shadow-md p-2 hover:bg-stone-50 disabled:opacity-60"
          title="Ma position"
          data-testid="customer-checkout-locate-btn"
        >
          {locating ? (
            <div className="w-5 h-5 border-2 border-stone-400 border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg viewBox="0 0 24 24" className="w-5 h-5 text-stone-700" fill="none" stroke="currentColor" strokeWidth={2}>
              <circle cx="12" cy="12" r="3"/>
              <path d="M12 2v3m0 14v3M2 12h3m14 0h3"/>
              <circle cx="12" cy="12" r="8" strokeDasharray="4 2"/>
            </svg>
          )}
        </button>
      </div>
      <p className={`text-[13px] text-center ${picked ? 'text-[#16A34A] font-medium' : 'text-[#78716C]'}`}>
        {picked ? 'Position sélectionnée ✓' : 'Appuyez sur la carte pour indiquer votre position'}
      </p>
    </div>
  );
}

import type mapboxgl from 'mapbox-gl';

/** Centered on Morocco, zoom 5 shows the full country without ocean bleed. */
export const MOROCCO_DEFAULT_VIEW = {
  center: [-6.0, 31.5] as [number, number],
  zoom: 5,
} satisfies mapboxgl.CameraOptions;

/**
 * Hides disputed-territory labels and sub-national boundary layers on a
 * Mapbox satellite-streets style. Call inside a map `load` handler.
 */
export function applyMoroccoMapStyle(map: mapboxgl.Map): void {
  // Suppress politically disputed labels (e.g. Western Sahara)
  if (map.getLayer('country-label')) {
    map.setFilter('country-label', [
      '!in', 'name_en',
      'Western Sahara',
      'Sahrawi Arab Democratic Republic',
    ]);
  }

  for (const layer of ['admin-1-boundary', 'admin-1-boundary-bg', 'admin-2-boundary']) {
    if (map.getLayer(layer)) {
      map.setLayoutProperty(layer, 'visibility', 'none');
    }
  }
}

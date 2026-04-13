import type mapboxgl from 'mapbox-gl';

/** Centered on Morocco, zoom 5 shows the full country without ocean bleed. */
export const MOROCCO_DEFAULT_VIEW = {
  center: [-6.0, 31.5] as [number, number],
  zoom: 5,
} satisfies mapboxgl.CameraOptions;

/**
 * Hides disputed-territory labels and all admin boundary layers on a
 * Mapbox streets style. Call inside a map `load` handler.
 */
export function applyMoroccoMapStyle(map: mapboxgl.Map): void {
  // Hide all admin boundary layers — including disputed variants (e.g. WS dotted line)
  const layersToHide = [
    // Admin boundaries (all variants)
    'admin-0-boundary',
    'admin-0-boundary-bg',
    'admin-1-boundary',
    'admin-1-boundary-bg',
    'admin-2-boundary',
    'admin-2-boundary-bg',
    'admin-0-boundary-disputed',
    'admin-1-boundary-disputed',
    // Country/territory labels
    'country-label',
    'state-label',
  ];

  layersToHide.forEach(layer => {
    if (map.getLayer(layer)) {
      map.setLayoutProperty(layer, 'visibility', 'none');
    }
  });

  // Backup filter: explicitly exclude WS from country-label
  if (map.getLayer('country-label')) {
    map.setFilter('country-label', [
      'all',
      ['!in', 'name_en',
        'Western Sahara',
        'Sahrawi Arab Democratic Republic',
        'SADR',
      ],
    ]);
  }
}

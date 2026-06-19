'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import polyline from '@mapbox/polyline';

// Fix pour les icônes Leaflet dans Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapViewProps {
  polyline: string;
  startLatitude?: number | null;
  startLongitude?: number | null;
}

export default function MapView({ polyline: encodedPolyline, startLatitude, startLongitude }: MapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current || mapInstance.current) return;

    try {
      // Décoder la polyline
      const coordinates = polyline.decode(encodedPolyline);

      if (!coordinates || coordinates.length === 0) {
        console.error('Aucune coordonnée décodée');
        return;
      }

      // Créer la carte centrée sur la première coordonnée
      const firstPoint = coordinates[0] as [number, number];
      const map = L.map(mapContainer.current).setView(firstPoint, 13);

      mapInstance.current = map;

      // Ajouter la couche de tuiles OpenStreetMap
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      // Dessiner la trace
      const routeLine = L.polyline(coordinates as [number, number][], {
        color: '#27509B', // Bleu Michelin
        weight: 4,
        opacity: 0.8,
      }).addTo(map);

      // Ajouter un marqueur de départ
      if (coordinates.length > 0) {
        L.marker(coordinates[0] as [number, number])
          .addTo(map)
          .bindPopup('Départ');
      }

      // Ajouter un marqueur d'arrivée si différent du départ
      if (coordinates.length > 1) {
        const endPoint = coordinates[coordinates.length - 1] as [number, number];
        const startPoint = coordinates[0] as [number, number];

        // Vérifier si le point de départ et d'arrivée sont différents
        if (endPoint[0] !== startPoint[0] || endPoint[1] !== startPoint[1]) {
          const greenIcon = new L.Icon({
            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
          });

          L.marker(endPoint, { icon: greenIcon })
            .addTo(map)
            .bindPopup('Arrivée');
        }
      }

      // Ajuster la vue pour afficher toute la trace
      map.fitBounds(routeLine.getBounds(), {
        padding: [50, 50],
      });

    } catch (error) {
      console.error('Erreur lors du chargement de la carte:', error);
    }

    // Cleanup
    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [encodedPolyline, startLatitude, startLongitude]);

  return (
    <div
      ref={mapContainer}
      className="w-full h-full min-h-[200px] sm:min-h-[320px] md:min-h-[400px]"
      style={{ zIndex: 0 }}
    />
  );
}

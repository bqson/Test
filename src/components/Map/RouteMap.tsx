'use client';

import React, { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { IRoute } from '@/lib/type/interface';

// Fix for default marker icon in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface RouteMapProps {
  routes: IRoute[];
  height?: string;
  showAllRoutes?: boolean;
  center?: [number, number];
  zoom?: number;
}

// Helper function to validate coordinates
const isValidCoordinate = (value: number): boolean => {
  return !isNaN(value) && isFinite(value) && value !== 0;
};

const isValidLatitude = (lat: number): boolean => {
  return isValidCoordinate(lat) && lat >= -90 && lat <= 90;
};

const isValidLongitude = (lng: number): boolean => {
  return isValidCoordinate(lng) && lng >= -180 && lng <= 180;
};

const isValidRoute = (route: IRoute): boolean => {
  return (
    isValidLatitude(route.latStart) &&
    isValidLongitude(route.lngStart) &&
    isValidLatitude(route.latEnd) &&
    isValidLongitude(route.lngEnd)
  );
};

// Component to fit map bounds to show all routes
function FitBounds({ routes }: { routes: IRoute[] }) {
  const map = useMap();

  useEffect(() => {
    const validRoutes = routes.filter(isValidRoute);
    if (validRoutes.length > 0) {
      try {
        const bounds = validRoutes.reduce((acc, route) => {
          const start: [number, number] = [route.latStart, route.lngStart];
          const end: [number, number] = [route.latEnd, route.lngEnd];
          return acc.extend(start).extend(end);
        }, L.latLngBounds(
          [validRoutes[0].latStart, validRoutes[0].lngStart],
          [validRoutes[0].latEnd, validRoutes[0].lngEnd]
        ));

        map.fitBounds(bounds, { padding: [50, 50] });
      } catch (error) {
        console.error("Error fitting bounds:", error);
      }
    }
  }, [routes, map]);

  return null;
}

export const RouteMap: React.FC<RouteMapProps> = ({
  routes,
  height = '500px',
  showAllRoutes = true,
  center,
  zoom = 10,
}) => {
  // Filter out routes with invalid coordinates
  const validRoutes = useMemo(() => {
    return routes.filter(isValidRoute);
  }, [routes]);

  // Calculate center if not provided
  const mapCenter = useMemo(() => {
    if (center) return center;
    if (validRoutes.length === 0) return [10.7769, 106.7009] as [number, number];
    
    try {
      const allLats = validRoutes.flatMap(r => [r.latStart, r.latEnd]);
      const allLngs = validRoutes.flatMap(r => [r.lngStart, r.lngEnd]);
      const avgLat = allLats.reduce((a, b) => a + b, 0) / allLats.length;
      const avgLng = allLngs.reduce((a, b) => a + b, 0) / allLngs.length;
      
      // Validate calculated center
      if (isValidLatitude(avgLat) && isValidLongitude(avgLng)) {
        return [avgLat, avgLng] as [number, number];
      }
    } catch (error) {
      console.error("Error calculating map center:", error);
    }
    
    return [10.7769, 106.7009] as [number, number]; // Default to Ho Chi Minh City
  }, [center, validRoutes]);

  // Create custom icons
  const startIcon = L.divIcon({
    className: 'custom-marker',
    html: `<div style="background-color: #10b981; width: 30px; height: 30px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
  });

  const endIcon = L.divIcon({
    className: 'custom-marker',
    html: `<div style="background-color: #ef4444; width: 30px; height: 30px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
  });

  const waypointIcon = L.divIcon({
    className: 'custom-marker',
    html: `<div style="background-color: #3b82f6; width: 25px; height: 25px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>`,
    iconSize: [25, 25],
    iconAnchor: [12.5, 25],
  });

  if (validRoutes.length === 0) {
    return (
      <div className="w-full rounded-lg overflow-hidden border border-gray-300 bg-gray-100 flex items-center justify-center" style={{ height }}>
        <p className="text-gray-500">
          {routes.length === 0 ? "No routes to display" : "No valid routes with coordinates to display"}
        </p>
      </div>
    );
  }

  // Get all unique points for markers
  const allPoints = useMemo(() => {
    const points: Array<{ lat: number; lng: number; type: 'start' | 'end' | 'waypoint'; routeIndex: number; title?: string }> = [];
    
    validRoutes.forEach((route, index) => {
      if (index === 0) {
        points.push({ lat: route.latStart, lng: route.lngStart, type: 'start', routeIndex: index, title: route.title });
      }
      points.push({ lat: route.latEnd, lng: route.lngEnd, type: index === validRoutes.length - 1 ? 'end' : 'waypoint', routeIndex: index, title: route.title });
    });
    
    return points;
  }, [validRoutes]);

  return (
    <div className="w-full rounded-lg overflow-hidden border border-gray-300" style={{ height }}>
      <MapContainer
        center={mapCenter}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {showAllRoutes && validRoutes.length > 0 && <FitBounds routes={validRoutes} />}
        
        {/* Draw polylines for each route */}
        {validRoutes.map((route, index) => {
          const polyline: [number, number][] = [
            [route.latStart, route.lngStart],
            [route.latEnd, route.lngEnd],
          ];
          
          return (
            <Polyline
              key={route.id || index}
              positions={polyline}
              color={index === 0 ? '#10b981' : '#3b82f6'}
              weight={4}
              opacity={0.7}
            />
          );
        })}
        
        {/* Add markers for start, end, and waypoints */}
        {allPoints.map((point, index) => {
          let icon = waypointIcon;
          if (point.type === 'start') icon = startIcon;
          else if (point.type === 'end') icon = endIcon;
          
          return (
            <Marker
              key={`${point.lat}-${point.lng}-${index}`}
              position={[point.lat, point.lng]}
              icon={icon}
            >
              <Popup>
                <div className="p-2">
                  <p className="font-semibold text-sm">{point.title || `Route ${point.routeIndex + 1}`}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {point.type === 'start' && 'Start Point'}
                    {point.type === 'end' && 'End Point'}
                    {point.type === 'waypoint' && 'Waypoint'}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {point.lat.toFixed(4)}, {point.lng.toFixed(4)}
                  </p>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};


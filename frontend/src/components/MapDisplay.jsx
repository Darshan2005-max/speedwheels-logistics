import React, { useEffect, useRef, useState } from 'react';

const MapDisplay = ({ pickupCoords, dropCoords, routePolyline, distance, duration }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [mapError, setMapError] = useState(false);

  useEffect(() => {
    // Check if Google Maps is loaded
    if (!window.google || !window.google.maps) {
      setMapError(true);
      console.error('Google Maps JavaScript API not loaded');
      return;
    }

    // Initialize map
    const map = new window.google.maps.Map(mapRef.current, {
      zoom: 8,
      center: pickupCoords,
      mapTypeControl: true,
      streetViewControl: false,
      fullscreenControl: true,
    });

    mapInstanceRef.current = map;

    // Add pickup marker (green)
    const pickupMarker = new window.google.maps.Marker({
      position: pickupCoords,
      map: map,
      title: 'Pickup Location',
      icon: {
        url: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png',
      },
      animation: window.google.maps.Animation.DROP,
    });

    // Add drop marker (red)
    const dropMarker = new window.google.maps.Marker({
      position: dropCoords,
      map: map,
      title: 'Drop Location',
      icon: {
        url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
      },
      animation: window.google.maps.Animation.DROP,
    });

    // Draw route if polyline is available
    if (routePolyline) {
      const decodedPath = window.google.maps.geometry.encoding.decodePath(routePolyline);
      const routePath = new window.google.maps.Polyline({
        path: decodedPath,
        geodesic: true,
        strokeColor: '#2563eb',
        strokeOpacity: 0.8,
        strokeWeight: 4,
      });
      routePath.setMap(map);

      // Fit bounds to show entire route
      const bounds = new window.google.maps.LatLngBounds();
      decodedPath.forEach((point) => bounds.extend(point));
      map.fitBounds(bounds);
    } else {
      // If no polyline, just fit bounds to markers
      const bounds = new window.google.maps.LatLngBounds();
      bounds.extend(pickupCoords);
      bounds.extend(dropCoords);
      map.fitBounds(bounds);
    }

    // Add info window with distance and duration
    const infoContent = `
      <div style="padding: 8px; font-family: Arial, sans-serif;">
        <strong style="color: #2563eb; font-size: 16px;">Route Details</strong><br/>
        <div style="margin-top: 8px;">
          <strong>Distance:</strong> ${distance} km<br/>
          <strong>Duration:</strong> ${duration}
        </div>
      </div>
    `;

    const infoWindow = new window.google.maps.InfoWindow({
      content: infoContent,
      position: pickupCoords,
    });

    // Show info window after a short delay
    setTimeout(() => {
      infoWindow.open(map);
    }, 500);

    // Cleanup
    return () => {
      if (mapInstanceRef.current) {
        window.google.maps.event.clearInstanceListeners(mapInstanceRef.current);
      }
    };
  }, [pickupCoords, dropCoords, routePolyline, distance, duration]);

  if (mapError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
        <p className="text-red-600 font-semibold">⚠️ Map could not be loaded</p>
        <p className="text-sm text-red-500 mt-2">
          Please ensure Google Maps API is properly configured
        </p>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <h4 className="text-lg font-bold mb-3 text-gray-800">📍 Route Map</h4>
      <div
        ref={mapRef}
        className="w-full h-96 rounded-lg border-2 border-gray-300 shadow-md"
        style={{ minHeight: '400px' }}
      />
      <div className="mt-3 text-sm text-gray-600 text-center">
        <span className="inline-block mr-4">🟢 Pickup Location</span>
        <span className="inline-block">🔴 Drop Location</span>
      </div>
    </div>
  );
};

export default MapDisplay;

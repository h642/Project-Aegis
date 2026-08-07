import React, { useState, useEffect, useRef } from 'react';
import { MapPin, RefreshCw, ExternalLink, AlertTriangle, Layers, Navigation, Crosshair, ZoomIn, ZoomOut } from 'lucide-react';
import { fetchCurrentGpsLocation, GpsLocationData, generateMapsUrl } from '../utils/locationService';
import { useTranslation } from 'react-i18next';
import L from 'leaflet';

interface GpsStatusCardProps {
  initialLocation?: Partial<GpsLocationData>;
  onLocationUpdate?: (location: GpsLocationData) => void;
  className?: string;
}

export const GpsStatusCard: React.FC<GpsStatusCardProps> = ({
  initialLocation,
  onLocationUpdate,
  className = '',
}) => {
  const { t } = useTranslation();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [mapLayerMode, setMapLayerMode] = useState<'satellite' | 'streets'>('satellite');
  const [gpsData, setGpsData] = useState<GpsLocationData>({
    latitude: initialLocation?.latitude || 30.7333,
    longitude: initialLocation?.longitude || 76.7794,
    accuracy: initialLocation?.accuracy || 8,
    timestamp: initialLocation?.timestamp || new Date().toISOString(),
    is_live: initialLocation?.is_live ?? true,
    is_cached: initialLocation?.is_cached ?? false,
    location_name: initialLocation?.location_name || 'Patient GPS Location',
    location_url: initialLocation?.location_url || generateMapsUrl(initialLocation?.latitude || 30.7333, initialLocation?.longitude || 76.7794),
    status: initialLocation?.status || 'active',
    error_message: initialLocation?.error_message,
  });

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const labelsLayerRef = useRef<L.TileLayer | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const circleRef = useRef<L.Circle | null>(null);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    const updated = await fetchCurrentGpsLocation(true, 8000);
    setGpsData(updated);
    if (onLocationUpdate) {
      onLocationUpdate(updated);
    }
    setIsRefreshing(false);
  };

  useEffect(() => {
    handleRefresh();
  }, []);

  // Initialize and manage Leaflet Map Instance
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Create map centered on patient coordinates
      const map = L.map(mapContainerRef.current, {
        center: [gpsData.latitude, gpsData.longitude],
        zoom: 16,
        zoomControl: false,
      });

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Remove existing tile layers before re-adding
    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }
    if (labelsLayerRef.current) {
      map.removeLayer(labelsLayerRef.current);
    }

    if (mapLayerMode === 'satellite') {
      // Esri World Imagery (High-Resolution Satellite)
      const satLayer = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        {
          maxZoom: 19,
          attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
        }
      );
      satLayer.addTo(map);
      tileLayerRef.current = satLayer;

      // Transportation / Road labels overlay for satellite view
      const labelsLayer = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}',
        {
          maxZoom: 19,
          opacity: 0.85,
        }
      );
      labelsLayer.addTo(map);
      labelsLayerRef.current = labelsLayer;
    } else {
      // OpenStreetMap standard street layer
      const streetLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors',
      });
      streetLayer.addTo(map);
      tileLayerRef.current = streetLayer;
    }

    // Custom Emergency Marker Icon
    const customIcon = L.divIcon({
      className: 'aegis-gps-marker',
      html: `
        <div style="position: relative; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;">
          <div style="position: absolute; width: 32px; height: 32px; background: rgba(16, 185, 129, 0.4); border-radius: 50%; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="width: 18px; height: 18px; background: #10b981; border: 3px solid #ffffff; border-radius: 50%; box-shadow: 0 0 10px rgba(0,0,0,0.5);"></div>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    // Update marker position
    if (markerRef.current) {
      markerRef.current.setLatLng([gpsData.latitude, gpsData.longitude]);
    } else {
      const marker = L.marker([gpsData.latitude, gpsData.longitude], { icon: customIcon }).addTo(map);
      markerRef.current = marker;
    }

    const popupHtml = `
      <div style="font-family: system-ui, sans-serif; padding: 4px; color: #0f172a;">
        <div style="font-weight: 800; font-size: 12px; color: #059669; display: flex; align-items: center; gap: 4px;">
          📍 ${t('gps.patientLocation')}
        </div>
        <div style="font-size: 11px; margin-top: 4px; font-family: monospace;">
          <strong>${t('gps.latitude')}:</strong> ${gpsData.latitude.toFixed(6)}<br/>
          <strong>${t('gps.longitude')}:</strong> ${gpsData.longitude.toFixed(6)}<br/>
          <strong>${t('gps.accuracy')}:</strong> ±${gpsData.accuracy || 8} m
        </div>
        <a href="${gpsData.location_url}" target="_blank" rel="noopener noreferrer" style="display: inline-block; margin-top: 6px; background: #059669; color: white; text-decoration: none; font-size: 10px; font-weight: bold; padding: 3px 8px; border-radius: 4px;">
          ${t('gps.openGoogleMaps')}
        </a>
      </div>
    `;

    if (markerRef.current) {
      markerRef.current.bindPopup(popupHtml);
    }

    // Update accuracy radius circle
    if (circleRef.current) {
      circleRef.current.setLatLng([gpsData.latitude, gpsData.longitude]);
      circleRef.current.setRadius(gpsData.accuracy || 15);
    } else {
      const circle = L.circle([gpsData.latitude, gpsData.longitude], {
        radius: gpsData.accuracy || 15,
        color: '#10b981',
        fillColor: '#10b981',
        fillOpacity: 0.2,
        weight: 1.5,
      }).addTo(map);
      circleRef.current = circle;
    }

    map.setView([gpsData.latitude, gpsData.longitude], map.getZoom() || 16);

    // Invalidate size to prevent rendering glitches
    setTimeout(() => {
      map.invalidateSize();
    }, 200);

  }, [gpsData, mapLayerMode, t]);

  const handleRecenter = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([gpsData.latitude, gpsData.longitude], 17, {
        duration: 1.2,
      });
    }
  };

  const handleZoomIn = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomOut();
    }
  };

  const formattedTime = new Date(gpsData.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  return (
    <div id="gps-status-card" className={`bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3.5 ${className}`}>
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <span className="p-2.5 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
            <MapPin className="h-5 w-5" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-black text-slate-900 dark:text-white tracking-wide">{t('gps.title')}</h3>
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded flex items-center gap-1 ${
                gpsData.status === 'active' 
                  ? 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30' 
                  : 'bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30'
              }`}>
                <span className={`w-2 h-2 rounded-full ${gpsData.status === 'active' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                <span>
                  {gpsData.status === 'active' 
                    ? (gpsData.is_cached ? t('gps.lastKnown') : t('gps.gpsActive')) 
                    : gpsData.status === 'denied' 
                    ? t('gps.permissionDenied') 
                    : t('gps.gpsStandby')}
                </span>
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
              {t('gps.subtitle')}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
          {gpsData.location_url && (
            <a
              id="gps-view-map-link"
              href={gpsData.location_url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-xl bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-700 dark:text-indigo-300 text-xs font-bold transition-all flex items-center gap-1.5 border border-indigo-500/30"
            >
              <ExternalLink className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>{t('gps.locationLink')}</span>
            </a>
          )}
          <button
            id="gps-refresh-button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 disabled:opacity-50 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{t('gps.refreshLocation')}</span>
          </button>
        </div>
      </div>

      {/* Warning/Error Box if GPS permission denied or disabled */}
      {gpsData.error_message && (
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs flex items-start gap-2 font-medium">
          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
          <span>{gpsData.error_message}</span>
        </div>
      )}

      {/* 📡 Interactive Satellite & Street Map Container */}
      <div className="relative rounded-xl overflow-hidden border border-slate-300 dark:border-slate-800 shadow-inner group">
        <div 
          ref={mapContainerRef} 
          className="w-full h-80 sm:h-96 bg-slate-950 z-0"
        />

        {/* Map View Mode Controls Overlay */}
        <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 bg-slate-900/90 backdrop-blur p-1 rounded-xl border border-slate-700/80 shadow-lg">
          <button
            type="button"
            onClick={() => setMapLayerMode('satellite')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              mapLayerMode === 'satellite'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>{t('gps.satelliteView')}</span>
          </button>
          <button
            type="button"
            onClick={() => setMapLayerMode('streets')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              mapLayerMode === 'streets'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Navigation className="h-3.5 w-3.5" />
            <span>{t('gps.streetMap')}</span>
          </button>
        </div>

        {/* Zoom & Recenter Controls Overlay */}
        <div className="absolute top-3 right-3 z-10 flex flex-col gap-1.5 bg-slate-900/90 backdrop-blur p-1 rounded-xl border border-slate-700/80 shadow-lg">
          <button
            type="button"
            onClick={handleRecenter}
            title={t('gps.recenter')}
            className="p-2 rounded-lg text-slate-200 hover:bg-emerald-600 hover:text-white transition-all text-xs font-bold flex items-center justify-center"
          >
            <Crosshair className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={handleZoomIn}
            title="Zoom In"
            className="p-2 rounded-lg text-slate-200 hover:bg-slate-800 transition-all text-xs font-bold flex items-center justify-center border-t border-slate-800"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={handleZoomOut}
            title="Zoom Out"
            className="p-2 rounded-lg text-slate-200 hover:bg-slate-800 transition-all text-xs font-bold flex items-center justify-center"
          >
            <ZoomOut className="h-4 w-4" />
          </button>
        </div>

        {/* Coordinate Badge Overlay at Bottom of Map */}
        <div className="absolute bottom-3 left-3 right-3 z-10 flex flex-wrap items-center justify-between gap-2 bg-slate-900/90 backdrop-blur px-3 py-2 rounded-xl border border-slate-800 text-white text-xs font-mono shadow-md">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
              <MapPin className="h-3.5 w-3.5 animate-bounce" />
              <span>{gpsData.latitude.toFixed(6)}, {gpsData.longitude.toFixed(6)}</span>
            </span>
            <span className="hidden sm:inline-block text-slate-400 text-[11px]">
              {t('gps.accuracy')}: <strong className="text-white">±{gpsData.accuracy || 8}m</strong>
            </span>
          </div>
          <span className="text-[10px] text-slate-400">
            {gpsData.is_cached ? t('gps.lastKnownCached') : t('gps.gpsActive')}: {formattedTime}
          </span>
        </div>
      </div>

      {/* Grid displaying Latitude, Longitude, Accuracy, Last Updated */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
        <div className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
          <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-semibold">{t('gps.latitude')}</span>
          <span className="text-slate-900 dark:text-white font-black text-sm">{gpsData.latitude.toFixed(6)}</span>
        </div>
        <div className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
          <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-semibold">{t('gps.longitude')}</span>
          <span className="text-slate-900 dark:text-white font-black text-sm">{gpsData.longitude.toFixed(6)}</span>
        </div>
        <div className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
          <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-semibold">{t('gps.accuracy')}</span>
          <span className="text-emerald-600 dark:text-emerald-400 font-extrabold text-sm">±{gpsData.accuracy || 8} m</span>
        </div>
        <div className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
          <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-semibold">
            {gpsData.is_cached ? t('gps.lastKnownCached') : t('gps.lastUpdated')}
          </span>
          <span className="text-slate-800 dark:text-slate-200 font-bold text-xs truncate block">
            {formattedTime}
          </span>
        </div>
      </div>
    </div>
  );
};


// Phone GPS Live Location Service (Free Browser Geolocation API)
// Uses navigator.geolocation with fallback to cached last-known location

export interface GpsLocationData {
  latitude: number;
  longitude: number;
  accuracy: number | null; // meters
  timestamp: string;
  is_live: boolean;
  is_cached: boolean;
  location_name: string;
  location_url: string;
  status: 'active' | 'denied' | 'disabled' | 'unavailable' | 'loading' | 'idle';
  error_message?: string;
}

const CACHE_KEY = 'aegis_last_known_gps';

// Helper to generate free Google Maps external URL (No API key required)
export const generateMapsUrl = (lat: number, lng: number): string => {
  return `https://www.google.com/maps/search/?api=1&query=${lat.toFixed(6)},${lng.toFixed(6)}`;
};

// Default fallback / initial baseline location
const DEFAULT_FALLBACK_LOCATION: GpsLocationData = {
  latitude: 30.7333,
  longitude: 76.7794,
  accuracy: 12,
  timestamp: new Date().toISOString(),
  is_live: false,
  is_cached: false,
  location_name: 'Chandigarh / Default Region',
  location_url: generateMapsUrl(30.7333, 76.7794),
  status: 'idle',
};

// Get cached last-known location from localStorage
export const getLastKnownLocation = (): GpsLocationData | null => {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return {
      ...parsed,
      is_live: false,
      is_cached: true,
      status: 'active',
      location_name: parsed.location_name || `Last Known (${parsed.latitude.toFixed(4)}, ${parsed.longitude.toFixed(4)})`,
      location_url: generateMapsUrl(parsed.latitude, parsed.longitude),
    };
  } catch (err) {
    console.warn('Failed to parse cached GPS location:', err);
    return null;
  }
};

// Save location to localStorage cache
export const saveLastKnownLocation = (data: Partial<GpsLocationData>) => {
  try {
    if (data.latitude && data.longitude) {
      const cachePayload = {
        latitude: data.latitude,
        longitude: data.longitude,
        accuracy: data.accuracy ?? 10,
        timestamp: new Date().toISOString(),
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cachePayload));
    }
  } catch (err) {
    console.warn('Failed to cache GPS location:', err);
  }
};

// Main function to fetch current phone GPS coordinates dynamically
export const fetchCurrentGpsLocation = (
  highAccuracy: boolean = true,
  timeoutMs: number = 8000
): Promise<GpsLocationData> => {
  return new Promise((resolve) => {
    // Check if browser supports Geolocation
    if (!navigator.geolocation) {
      const lastKnown = getLastKnownLocation();
      const fallback = lastKnown || DEFAULT_FALLBACK_LOCATION;
      resolve({
        ...fallback,
        status: 'unavailable',
        error_message: 'Geolocation is not supported by this device or browser.',
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        const now = new Date().toISOString();
        const locationUrl = generateMapsUrl(latitude, longitude);

        const liveData: GpsLocationData = {
          latitude,
          longitude,
          accuracy: Math.round(accuracy),
          timestamp: now,
          is_live: true,
          is_cached: false,
          location_name: `Device GPS (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`,
          location_url: locationUrl,
          status: 'active',
        };

        saveLastKnownLocation(liveData);
        resolve(liveData);
      },
      (error) => {
        let statusReason: GpsLocationData['status'] = 'unavailable';
        let errorMsg = 'Unable to retrieve location.';

        if (error.code === error.PERMISSION_DENIED) {
          statusReason = 'denied';
          errorMsg = 'Location services are disabled or permission was denied. Please enable GPS so Aegis can determine your location during an emergency.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          statusReason = 'disabled';
          errorMsg = 'GPS signal unavailable or turned off.';
        } else if (error.code === error.TIMEOUT) {
          statusReason = 'unavailable';
          errorMsg = 'Location request timed out. Using last known coordinates.';
        }

        const lastKnown = getLastKnownLocation();
        if (lastKnown) {
          resolve({
            ...lastKnown,
            status: statusReason,
            error_message: errorMsg,
          });
        } else {
          resolve({
            ...DEFAULT_FALLBACK_LOCATION,
            status: statusReason,
            error_message: errorMsg,
          });
        }
      },
      {
        enableHighAccuracy: highAccuracy,
        timeout: timeoutMs,
        maximumAge: 10000,
      }
    );
  });
};

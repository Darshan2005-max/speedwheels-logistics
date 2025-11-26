// Utility to dynamically load Google Maps API
let googleMapsPromise = null;

export const loadGoogleMapsAPI = async () => {
  // Return existing promise if already loading/loaded
  if (googleMapsPromise) {
    return googleMapsPromise;
  }

  googleMapsPromise = new Promise(async (resolve, reject) => {
    // Check if already loaded
    if (window.google && window.google.maps) {
      resolve(window.google);
      return;
    }

    try {
      // Fetch API key from backend
      const response = await fetch('http://localhost:8080/api/config/google-maps-key');
      
      if (!response.ok) {
        throw new Error('Failed to fetch Google Maps API key');
      }

      const { apiKey } = await response.json();

      // Create and load script
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geometry`;
      script.async = true;
      script.defer = true;

      script.onload = () => {
        if (window.google && window.google.maps) {
          resolve(window.google);
        } else {
          reject(new Error('Google Maps failed to load'));
        }
      };

      script.onerror = () => {
        reject(new Error('Failed to load Google Maps script'));
      };

      document.head.appendChild(script);
    } catch (error) {
      reject(error);
    }
  });

  return googleMapsPromise;
};

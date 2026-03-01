import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Locations() {
  const [message, setMessage] = useState('Finding your location...');
  const [status, setStatus] = useState('idle');
  const [coords, setCoords] = useState(null);
  const [isTracking, setIsTracking] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [selectedPreference, setSelectedPreference] = useState(null);
  const [selected, setSelected] = useState([]);
  const [sortedLocations, setSortedLocations] = useState([]);
  const intervalRef = React.useRef(null);
  const navigate = useNavigate();

  // Real Chicago Loop locations data with coordinates
  const locationsByPreference = {
    films: [
      { name: 'Cloud Gate (The Bean)', address: '201 E Randolph St', emoji: '🎬', lat: 41.8827, lng: -87.6233 },
      { name: 'Chicago Cultural Center', address: '78 E Washington St', emoji: '🎬', lat: 41.8834, lng: -87.6250 },
      { name: 'The Chicago Theatre', address: '175 N State St', emoji: '🎬', lat: 41.8854, lng: -87.6279 },
      // additional famous film shoots
      { name: 'The Dark Knight (truck flip)', address: 'Lower Wacker Drive', emoji: '🎬', lat: 41.8781, lng: -87.6355 },
      { name: 'Ferris Bueller Parade Route', address: 'Downtown Parade Route', emoji: '🎬', lat: 41.8830, lng: -87.6270 },
      { name: 'The Blues Brothers Chase', address: 'LaSalle St', emoji: '🎬', lat: 41.8781, lng: -87.6315 },
      { name: 'Transformers: Dark of the Moon', address: 'Wacker Drive', emoji: '🎬', lat: 41.8781, lng: -87.6355 },
    ],
    architecture: [
      { name: 'Marquette Building', address: '140 S Dearborn St', emoji: '🏛️', lat: 41.8779, lng: -87.6295 },
      { name: 'Chicago Cultural Center', address: '78 E Washington St', emoji: '🏛️', lat: 41.8834, lng: -87.6250 },
      { name: '875 North Michigan Avenue', address: '875 N Michigan Ave', emoji: '🏛️', lat: 41.8960, lng: -87.6244 },
      // added architecture locations
      { name: 'Willis Tower', address: '233 S Wacker Dr', emoji: '🏛️', lat: 41.878876, lng: -87.635915 },
      { name: 'Rookery Building', address: '209 S LaSalle St', emoji: '🏛️', lat: 41.8786, lng: -87.6324 },
      { name: 'Chicago Board of Trade Building', address: '141 W Jackson Blvd', emoji: '🏛️', lat: 41.8782, lng: -87.6325 },
      { name: 'Monadnock Building', address: '53 W Jackson Blvd', emoji: '🏛️', lat: 41.8783, lng: -87.6319 },
      { name: 'Marina City', address: '300 N State St', emoji: '🏛️', lat: 41.8885, lng: -87.6267 },
      { name: 'Carbide & Carbon Building', address: '230 N Michigan Ave', emoji: '🏛️', lat: 41.8881, lng: -87.6244 },
      { name: 'Civic Opera House', address: '20 N Wacker Dr', emoji: '🏛️', lat: 41.8851, lng: -87.6360 },
    ],
    music: [
      { name: 'American Music Box Theatre', address: '60 E Van Buren St', emoji: '🎵', lat: 41.8751, lng: -87.6176 },
      { name: 'Grant Park', address: '337 E Randolph St', emoji: '🎵', lat: 41.8829, lng: -87.6176 },
      { name: 'Pritzker Pavilion', address: '201 E Randolph St', emoji: '🎵', lat: 41.8827, lng: -87.6233 },
      // added live entertainment venues
      { name: 'Chicago Theatre', address: '175 N State St', emoji: '🎵', lat: 41.8854, lng: -87.6279 },
      { name: 'Lyric Opera of Chicago', address: '20 N Wacker Dr', emoji: '🎵', lat: 41.8851, lng: -87.6360 },
      { name: 'Goodman Theatre', address: '170 N Dearborn St', emoji: '🎵', lat: 41.8830, lng: -87.6306 },
      { name: 'Jay Pritzker Pavilion', address: 'Millennium Park', emoji: '🎵', lat: 41.8826, lng: -87.6226 },
    ],
    history: [
      { name: 'Chicago Cultural Center', address: '78 E Washington St', emoji: '📚', lat: 41.8834, lng: -87.6250 },
      { name: 'The Art Institute of Chicago', address: '111 S Michigan Ave', emoji: '📚', lat: 41.8766, lng: -87.6244 },
      { name: 'Federal Center Plazas', address: '230 S Dearborn St', emoji: '📚', lat: 41.8829, lng: -87.6295 },
    ],
    // new category for food locations
    food: [
      { name: "Lou Malnati's Pizzeria", address: '439 N Wells St', emoji: '🍽️', lat: 41.8951, lng: -87.6346 },
      { name: "Giordano's", address: '223 W Jackson Blvd', emoji: '🍽️', lat: 41.8782, lng: -87.6340 },
      { name: "Portillo's", address: '100 W Ontario St', emoji: '🍽️', lat: 41.8947, lng: -87.6266 },
      { name: 'The Dearborn', address: '145 N Dearborn St', emoji: '🍽️', lat: 41.8834, lng: -87.6308 },
      { name: 'Revival Food Hall', address: '125 S Clark St', emoji: '🍽️', lat: 41.8764, lng: -87.6283 },
      { name: "Cindy's Rooftop", address: '12 S Michigan Ave', emoji: '🍽️', lat: 41.8843, lng: -87.6246 },
      { name: 'Eleven City Diner', address: '1112 S Wabash Ave', emoji: '🍽️', lat: 41.8573, lng: -87.6261 },
      { name: "Miller's Pub", address: '134 S Wabash Ave', emoji: '🍽️', lat: 41.8566, lng: -87.6260 },
    ],
  };

  // Calculate distance in miles using Haversine formula
  function calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 3959; // Earth's radius in miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return (R * c).toFixed(2);
  }

  useEffect(() => {
    // Get preference from localStorage
    const preference = localStorage.getItem('chicagoPreference');
    setSelectedPreference(preference);
    
    // Auto-start tracking when component loads
    const timer = setTimeout(() => {
      getLocationData();
    }, 100);
    
    return () => {
      clearTimeout(timer);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);

  // Update sorted locations when coords are obtained
  useEffect(() => {
    if (coords && selectedPreference) {
      const locationsData = locationsByPreference[selectedPreference] || [];
      const withDistances = locationsData.map(loc => ({
        ...loc,
        distance: calculateDistance(coords.latitude, coords.longitude, loc.lat, loc.lng)
      }));
      // Sort by distance (closest first)
      const sorted = withDistances.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
      setSortedLocations(sorted);
    }
  }, [coords, selectedPreference]);

  function getLocationData() {
    getLocation();
  }

  async function getLocation() {
    setStatus('requesting');
    setMessage('Finding your location...');
    try {
      // eslint-disable-next-line no-undef
      if (typeof Capacitor !== 'undefined' && Capacitor.Plugins && Capacitor.Plugins.Geolocation) {
        const { value } = await Capacitor.Plugins.Geolocation.getCurrentPosition();
        const { latitude, longitude } = value.coords || value;
        setCoords({ latitude, longitude });
        setStatus('success');
        setMessage('Location found! Select up to 2 locations to visit.');
        setLastUpdated(new Date().toISOString());
        return;
      }
    } catch (e) {
      console.warn('Capacitor geolocation failed', e);
    }

    if (!('geolocation' in navigator)) {
      setStatus('unsupported');
      setMessage('Geolocation is not supported by your browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      position => {
        const { latitude, longitude } = position.coords;
        setCoords({ latitude, longitude });
        setStatus('success');
        setMessage('Location found! Select up to 2 locations to visit.');
        setLastUpdated(new Date().toISOString());
      },
      error => {
        console.error('geolocation error', error);
        setStatus('error: ' + (error.message || error.code));
        setMessage('Unable to get your location. Please try again.');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }

  function toggleLocation(locName) {
    if (selected.includes(locName)) {
      setSelected(selected.filter(name => name !== locName));
    } else if (selected.length < 2) {
      setSelected([...selected, locName]);
    }
  }

  function goToRoute() {
    if (selected.length > 0) {
      const selectedLocationData = sortedLocations.filter(loc => selected.includes(loc.name));
      localStorage.setItem('selectedLocations', JSON.stringify(selectedLocationData));
      localStorage.setItem('userCoords', JSON.stringify(coords));
      navigate('/route');
    }
  }

  return (
    <main className="container">
      <div className="card">
        <h1 style={{ marginTop: 0 }}>Nearby Locations</h1>
        <p className="muted">{message}</p>
        
        {!coords ? (
          <div style={{ marginTop: 20, padding: 16, backgroundColor: '#fef3c7', borderRadius: 8, border: '2px solid #fcd34d' }}>
            <p style={{ marginTop: 0 }}>
              <strong>⏳ Getting your location...</strong>
            </p>
            <p>Please allow location access when prompted. This helps us show you nearby attractions.</p>
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <button className="btn" onClick={getLocation} style={{ background: '#3b82f6' }}>
                Retry Location
              </button>
            </div>
          </div>
        ) : (
          <>
            <div style={{ marginTop: 12, marginBottom: 20, padding: 12, backgroundColor: '#dcfce7', borderRadius: 8, border: '2px solid #86efac' }}>
              <div><strong>✓ Location Found</strong></div>
              <div style={{ fontSize: 13, color: '#333', marginTop: 4 }}>
                Lat: {coords.latitude.toFixed(6)}, Lng: {coords.longitude.toFixed(6)}
              </div>
            </div>

            <div style={{ marginTop: 20 }}>
              <h2 style={{ marginTop: 0, marginBottom: 12 }}>Select up to 2 Locations</h2>
              <div style={{ fontSize: 13, color: '#666', marginBottom: 16 }}>
                {selectedPreference && `Showing ${selectedPreference.charAt(0).toUpperCase() + selectedPreference.slice(1).toLowerCase()} locations, ordered by distance`}
              </div>
              {sortedLocations.length > 0 ? (
                sortedLocations.map((location, idx) => (
                  <div
                    key={idx}
                    onClick={() => toggleLocation(location.name)}
                    style={{
                      padding: 16,
                      margin: '8px 0',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      backgroundColor: selected.includes(location.name) ? '#dbeafe' : '#f9fafb',
                      borderColor: selected.includes(location.name) ? '#3b82f6' : '#e5e7eb',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                      <input
                        type="checkbox"
                        checked={selected.includes(location.name)}
                        onChange={() => {}}
                        style={{ marginTop: 4, cursor: 'pointer', width: 18, height: 18 }}
                        disabled={!selected.includes(location.name) && selected.length >= 2}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 18, marginBottom: 4 }}>
                          <span style={{ marginRight: 8 }}>{location.emoji}</span>
                          <strong>{location.name}</strong>
                        </div>
                        <div style={{ fontSize: 14, color: '#666' }}>{location.address}</div>
                        <div style={{ fontSize: 13, color: '#999', marginTop: 4 }}>
                          📍 {location.distance} mi away
                        </div>
                      </div>
                      {selected.includes(location.name) && (
                        <div style={{ fontSize: 20, color: '#3b82f6' }}>✓</div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="muted">Loading locations...</div>
              )}
            </div>

            <div style={{ marginTop: 24, display: 'flex', gap: 8 }}>
              <button
                className="btn"
                onClick={() => navigate('/preferences')}
                style={{ background: '#9CA3AF' }}
              >
                Back
              </button>
              <button
                className="btn"
                onClick={goToRoute}
                disabled={selected.length === 0}
                style={{
                  opacity: selected.length > 0 ? 1 : 0.5,
                  cursor: selected.length > 0 ? 'pointer' : 'not-allowed',
                  flex: 1,
                }}
              >
                Create Route ({selected.length}/2)
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}

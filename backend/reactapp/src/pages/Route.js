import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Route() {
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [userCoords, setUserCoords] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Load data from localStorage
    const locations = JSON.parse(localStorage.getItem('selectedLocations') || '[]');
    const coords = JSON.parse(localStorage.getItem('userCoords') || 'null');
    setSelectedLocations(locations);
    setUserCoords(coords);
  }, []);

  // Generate Google Maps URL with route
  function generateMapsUrl() {
    if (!userCoords || selectedLocations.length === 0) return '';
    
    // Start from user's location
    let url = `https://www.google.com/maps/dir/${userCoords.latitude},${userCoords.longitude}`;
    
    // Add each selected location
    selectedLocations.forEach(loc => {
      url += `/${loc.lat},${loc.lng}`;
    });
    
    return url;
  }

  // Calculate total walking distance (rough estimate)
  function calculateTotalDistance() {
    if (!userCoords || selectedLocations.length === 0) return 0;
    
    let total = 0;
    let prevLat = userCoords.latitude;
    let prevLng = userCoords.longitude;
    
    selectedLocations.forEach(loc => {
      const R = 3959;
      const dLat = (loc.lat - prevLat) * Math.PI / 180;
      const dLng = (loc.lng - prevLng) * Math.PI / 180;
      const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(prevLat * Math.PI / 180) * Math.cos(loc.lat * Math.PI / 180) *
                Math.sin(dLng / 2) * Math.sin(dLng / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      total += R * c;
      prevLat = loc.lat;
      prevLng = loc.lng;
    });
    
    return total.toFixed(2);
  }

  // Create map visualization using embedded Google Maps iframe
  const mapsUrl = generateMapsUrl();

  return (
    <main className="container">
      <div className="card">
        <h1 style={{ marginTop: 0 }}>Your Route</h1>
        <p className="muted">Follow the blue route to visit your selected locations</p>

        {userCoords && selectedLocations.length > 0 ? (
          <>
            {/* Map Iframe */}
            <div style={{ marginTop: 20, marginBottom: 20, borderRadius: 8, overflow: 'hidden', border: '2px solid #e5e7eb' }}>
              <iframe
                width="100%"
                height="400"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen=""
                referrerPolicy="no-referrer-when-downgrade"
                src={`https://www.google.com/maps/embed/v1/directions?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}&origin=${userCoords.latitude},${userCoords.longitude}&destination=${selectedLocations[selectedLocations.length - 1].lat},${selectedLocations[selectedLocations.length - 1].lng}&mode=walking${selectedLocations.length > 1 ? '&waypoints=' + selectedLocations.slice(0, -1).map(l => `${l.lat},${l.lng}`).join('|') : ''}`}
              />
            </div>

            {/* Route Details */}
            <div style={{ marginTop: 20 }}>
              <h2 style={{ marginTop: 0, marginBottom: 16 }}>Route Summary</h2>
              
              {/* Starting Point */}
              <div style={{
                padding: 16,
                margin: '8px 0',
                border: '2px solid #3b82f6',
                borderRadius: '8px',
                backgroundColor: '#dbeafe',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ fontSize: 24 }}>📍</div>
                  <div>
                    <div><strong>Your Location</strong></div>
                    <div style={{ fontSize: 13, color: '#666', marginTop: 4 }}>
                      {userCoords.latitude.toFixed(6)}, {userCoords.longitude.toFixed(6)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Waypoints */}
              {selectedLocations.map((location, idx) => (
                <div key={idx}>
                  <div style={{ textAlign: 'center', padding: '8px 0', color: '#999', fontSize: 18 }}>
                    ↓
                  </div>
                  <div style={{
                    padding: 16,
                    margin: '8px 0',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    backgroundColor: '#f9fafb',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                      <div style={{ fontSize: 24 }}>{location.emoji}</div>
                      <div style={{ flex: 1 }}>
                        <div><strong>{location.name}</strong></div>
                        <div style={{ fontSize: 13, color: '#666', marginTop: 4 }}>
                          {location.address}
                        </div>
                        <div style={{ fontSize: 13, color: '#999', marginTop: 4 }}>
                          📍 {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Distance Summary */}
              <div style={{
                marginTop: 20,
                padding: 16,
                backgroundColor: '#f0f9ff',
                border: '2px solid #0ea5e9',
                borderRadius: 8,
              }}>
                <div><strong>Total Estimated Walking Distance:</strong></div>
                <div style={{ fontSize: 24, fontWeight: 'bold', color: '#0ea5e9', marginTop: 8 }}>
                  {calculateTotalDistance()} miles
                </div>
                <div style={{ fontSize: 13, color: '#666', marginTop: 8 }}>
                  ⏱️ Estimated time: {Math.round(calculateTotalDistance() / 3)} minutes (at 3 mph walking pace)
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ marginTop: 24, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button
                className="btn"
                onClick={() => window.open(mapsUrl, '_blank')}
                style={{ background: '#16a34a', flex: 1 }}
              >
                📱 Open in Google Maps
              </button>
              <button
                className="btn"
                onClick={() => navigate('/locations')}
                style={{ background: '#9CA3AF' }}
              >
                Back
              </button>
            </div>
          </>
        ) : (
          <div style={{ marginTop: 20, padding: 16, backgroundColor: '#fee2e2', borderRadius: 8, border: '2px solid #fecaca' }}>
            <p><strong>No route data found</strong></p>
            <p>Please select locations from the previous page.</p>
            <button className="btn" onClick={() => navigate('/locations')}>Go Back</button>
          </div>
        )}
      </div>
    </main>
  );
}

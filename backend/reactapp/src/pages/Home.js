import React, { useEffect, useState } from 'react';

export default function Home() {
  const [message, setMessage] = useState('Welcome to ChicaGO');
  const [status, setStatus] = useState('idle');
  const [coords, setCoords] = useState(null);
  const [isTracking, setIsTracking] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const intervalRef = React.useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => setMessage('Ready to build!'), 800);
    return () => {
      clearTimeout(timer);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);

  async function getLocation() {
    setStatus('requesting');
    // Capacitor Geolocation fallback (if running inside a Capacitor native shell)
    try {
      // eslint-disable-next-line no-undef
      if (typeof Capacitor !== 'undefined' && Capacitor.Plugins && Capacitor.Plugins.Geolocation) {
        // use Capacitor plugin
        const { value } = await Capacitor.Plugins.Geolocation.getCurrentPosition();
        const { latitude, longitude } = value.coords || value;
        setCoords({ latitude, longitude });
        setStatus('success');
        setLastUpdated(new Date().toISOString());
        return;
      }
    } catch (e) {
      // fall through to browser API
      console.warn('Capacitor geolocation failed', e);
    }

    if (!('geolocation' in navigator)) {
      setStatus('unsupported');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      position => {
        const { latitude, longitude } = position.coords;
        setCoords({ latitude, longitude });
        setStatus('success');
        setLastUpdated(new Date().toISOString());
      },
      error => {
        console.error('geolocation error', error);
        setStatus('error: ' + (error.message || error.code));
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }

  function startTracking() {
    if (isTracking) return;
    // immediately get one location then schedule interval
    getLocation();
    intervalRef.current = setInterval(() => {
      getLocation();
    }, 30 * 1000);
    setIsTracking(true);
    setStatus('tracking');
  }

  function stopTracking() {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsTracking(false);
    setStatus('idle');
  }

  function openInMaps() {
    if (!coords) return;
    const { latitude, longitude } = coords;
    const iosUrl = `maps://?q=${latitude},${longitude}`;
    const webUrl = `https://maps.google.com/?q=${latitude},${longitude}`;
    // try opening native maps on mobile; fallback to Google Maps web
    window.location.href = iosUrl;
    setTimeout(() => { window.location.href = webUrl; }, 500);
  }

  return (
    <main className="container">
      <div className="card">
        <h1 style={{ marginTop: 0 }}>Home</h1>
        <p className="muted">{message}</p>
        <p>This is the main page — add your UI and logic in this file.</p>

        <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {!isTracking ? (
            <button className="btn" onClick={startTracking}>Start Live Tracking</button>
          ) : (
            <button className="btn" onClick={stopTracking} style={{ background: '#ef4444' }}>Stop Tracking</button>
          )}
          <button
            className="btn"
            onClick={() => { setCoords(null); setStatus('idle'); setLastUpdated(null); }}
            style={{ background: '#9CA3AF' }}
          >
            Reset
          </button>
        </div>

        <div style={{ marginTop: 12 }}>
          <div className="card">
            <strong>Status:</strong> <span className="muted">{status}</span>
            <div style={{ height: 8 }} />
            {coords ? (
              <div>
                <div><strong>Latitude:</strong> {coords.latitude}</div>
                <div><strong>Longitude:</strong> {coords.longitude}</div>
                {lastUpdated && <div style={{marginTop:6}}><small className="muted">Last updated: {lastUpdated}</small></div>}
                <div style={{ marginTop: 8 }}>
                  <button className="btn" onClick={openInMaps}>Open in Maps</button>
                </div>
              </div>
            ) : (
              <div className="muted">No coordinates yet.</div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

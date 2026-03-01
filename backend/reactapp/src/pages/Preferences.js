import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Preferences() {
  const [selected, setSelected] = useState(null);
  const navigate = useNavigate();

  const preferences = [
    { id: 'films', label: 'Famous Film Shoots', emoji: '🎬' }, //used copilot for emojis
    { id: 'architecture', label: 'Architecture', emoji: '🏛️' },
    { id: 'music', label: 'Music', emoji: '🎵' },
    { id: 'history', label: 'History', emoji: '📚' },
  ];

  return (
    <main className="container">
      <div className="card">
        <h1 style={{ marginTop: 0 }}>Preferences</h1>
        <p className="muted">Select up to 1 preference from the options below.</p>

        <div style={{ marginTop: 20 }}>
          {preferences.map((pref) => (
            <div
              key={pref.id}
              onClick={() => setSelected(selected === pref.id ? null : pref.id)}
              style={{
                padding: 16,
                margin: '8px 0',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                cursor: 'pointer',
                backgroundColor: selected === pref.id ? '#dbeafe' : '#fff',
                borderColor: selected === pref.id ? '#3b82f6' : '#e5e7eb',
                transition: 'all 0.2s',
              }}
            >
              <span style={{ fontSize: 24, marginRight: 12 }}>{pref.emoji}</span>
              <span style={{ fontSize: 16, fontWeight: selected === pref.id ? 'bold' : 'normal' }}>
                {pref.label}
              </span>
              {selected === pref.id && (
                <span style={{ marginLeft: 12, fontSize: 18 }}>✓</span>
              )}
            </div>
          ))}
        </div>

        <div style={{ marginTop: 24, display: 'flex', gap: 8 }}>
          <button
            className="btn"
            onClick={() => navigate(-1)}
            style={{ background: '#9CA3AF' }}
          >
            Back
          </button>
          <button
            className="btn"
            onClick={() => {
              localStorage.setItem('chicagoPreference', selected);
              navigate('/locations');
            }}
            disabled={!selected}
            style={{ 
              opacity: selected ? 1 : 0.5,
              cursor: selected ? 'pointer' : 'not-allowed'
            }}
          >
            Continue
          </button>
        </div>
      </div>
    </main>
  );
}

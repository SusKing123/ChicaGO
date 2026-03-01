import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();

  return (
    <main className="container">
      <div className="card">
        <h1 style={{ marginTop: 0 }}>ChicaGO</h1>
        <p style={{ fontSize: 18, marginBottom: 20 }}>Discover Chicago's hidden gems based on your interests</p>
        
        <div style={{ backgroundColor: '#f3f4f6', padding: 20, borderRadius: 8, marginBottom: 24 }}>
          <h2 style={{ marginTop: 0, marginBottom: 12 }}>Welcome to ChicaGO</h2>
          <p>Welcome to ChicaGO, your personal tour guide during your stay in the loop.</p>
          
          <h3>How it works:</h3>
          <ol>
            <li><strong>Choose Your Interest:</strong> Select from Films, Architecture, Music, or History</li>
            <li><strong>Get Your Location:</strong> We'll track your position to show nearby attractions</li>
            <li><strong>Explore:</strong> Discover 3 tour worthy spots</li>
          </ol>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button
            className="btn"
            onClick={() => navigate('/preferences')}
            style={{ background: '#8b5cf6', flex: 1 }}
          >
            Get Started →
          </button>
        </div>
      </div>
    </main>
  );
}

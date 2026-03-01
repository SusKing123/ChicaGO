import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();

  return (
    <main className="container">
      <div className="card">
        <h1 style={{ marginTop: 0 }}>🏙️ ChicaGO</h1>
        <p style={{ fontSize: 18, marginBottom: 20 }}>Discover Chicago's hidden gems based on your interests</p>
        
        <div style={{ backgroundColor: '#f3f4f6', padding: 20, borderRadius: 8, marginBottom: 24 }}>
          <h2 style={{ marginTop: 0, marginBottom: 12 }}>Welcome to ChicaGO</h2>
          <p>ChicaGO is your personal guide to exploring the vibrant culture and history of Chicago's Loop district. Whether you're interested in famous film locations, stunning architecture, world-class music venues, or fascinating historical sites, we'll help you find the perfect places to visit.</p>
          
          <h3>How it works:</h3>
          <ol>
            <li><strong>Choose Your Interest:</strong> Select from Films, Architecture, Music, or History</li>
            <li><strong>Get Your Location:</strong> We'll track your position to show nearby attractions</li>
            <li><strong>Explore:</strong> Discover 3 amazing spots within walking distance</li>
          </ol>
        </div>

        <div style={{ 
          backgroundColor: '#f0f9ff', 
          border: '2px solid #0ea5e9', 
          padding: 16, 
          borderRadius: 8, 
          marginBottom: 24 
        }}>
          <p style={{ marginTop: 0, marginBottom: 8 }}>
            <strong>✨ Why ChicaGO?</strong>
          </p>
          <ul style={{ marginTop: 8, marginBottom: 0 }}>
            <li>Personalized recommendations based on your interests</li>
            <li>Real-time location tracking to find nearby attractions</li>
            <li>Walking distances from Chicago Loop for easy exploration</li>
            <li>Discover world-renowned cultural landmarks</li>
          </ul>
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

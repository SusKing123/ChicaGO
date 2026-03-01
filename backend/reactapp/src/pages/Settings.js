import React, { useState } from 'react';

export default function Settings() {
  const [name, setName] = useState('');

  function handleSave(e) {
    e.preventDefault();
    // save logic: persist to server or localStorage
    localStorage.setItem('chicago_name', name);
    alert('Saved');
  }

  return (
    <main className="container">
      <div className="card">
        <h1 style={{marginTop:0}}>Settings</h1>
        <form onSubmit={handleSave}>
          <label style={{display:'block', marginBottom:8}}>Name:</label>
          <input className="input" value={name} onChange={e => setName(e.target.value)} />
          <div style={{marginTop:12}}>
            <button className="btn" type="submit">Save</button>
          </div>
        </form>
      </div>
    </main>
  );
}

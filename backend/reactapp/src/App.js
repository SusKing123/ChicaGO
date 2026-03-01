import './App.css';
import React, { Suspense, lazy } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';

const Home = lazy(() => import('./pages/Home'));
const Preferences = lazy(() => import('./pages/Preferences'));
const Locations = lazy(() => import('./pages/Locations'));
const RoutePage = lazy(() => import('./pages/Route'));
const Settings = lazy(() => import('./pages/Settings'));

function App() {
  return (
    <Router>
      <div className="App">
        <Header />

        <main>
          <Suspense fallback={<div style={{padding:20}}>Loading...</div>}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/preferences" element={<Preferences />} />
              <Route path="/locations" element={<Locations />} />
              <Route path="/route" element={<RoutePage />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </Suspense>
        </main>
      </div>
    </Router>
  );
}

export default App;

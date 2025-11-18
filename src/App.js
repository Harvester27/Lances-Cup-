import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { GameProvider } from './components/GameContext';
import HockeyManagerMenu from './components/HockeyManagerMenu';
import PlayerSetup from './components/PlayerSetup';
import PlayerProfile from './components/PlayerProfile';
import CityMap from './components/city/CityMap';
import CharacterEditor from './components/city/CharacterEditor';
import GameDashboard from './components/GameDashboard';
import SaveLoad from './components/SaveLoad';
import Calendar from './components/Calendar';
import Rozlosování from './components/Rozlosovani';
import LeagueTable from './components/LeagueTable';
import LeagueStats from './components/LeagueStats';
import LancersSoupiska from './components/LancersSoupiska';
import PreGame from './components/PreGame';
import Zapas from './components/Zapas';
import './App.css';

function App() {
  return (
    <GameProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HockeyManagerMenu />} />
          <Route path="/menu" element={<HockeyManagerMenu />} />
          <Route path="/setup" element={<PlayerSetup />} />
          <Route path="/profile" element={<PlayerProfile />} />
          <Route path="/city-map" element={<CityMap />} />
          <Route path="/character-editor" element={<CharacterEditor />} />
          <Route path="/dashboard" element={<GameDashboard />} />
          <Route path="/save-load" element={<SaveLoad />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/rozlosovani" element={<Rozlosování />} />
          <Route path="/league-table" element={<LeagueTable />} />
          <Route path="/league-stats" element={<LeagueStats />} />
          <Route path="/lancers-soupiska" element={<LancersSoupiska />} />
          <Route path="/pregame" element={<PreGame />} />
          <Route path="/zapas" element={<Zapas />} />
          <Route path="/game" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </GameProvider>
  );
}

export default App;
